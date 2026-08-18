import {
  Profile,
  Project,
  SkillCategory,
  Service,
  Message,
  SiteSettings,
  ScreenshotJob,
  ActivityLog,
  PortfolioOptimizationResult,
} from '../types';
import * as firestoreService from './firestoreService';

export const api = {
  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------
  async getProfile(): Promise<Profile> {
    return await firestoreService.getProfile();
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return await firestoreService.updateProfile(profile);
  },

  // --------------------------------------------------
  // PROJECTS
  // --------------------------------------------------
  async getProjects(params?: { category?: string; status?: string; featured?: boolean; publishedOnly?: boolean }): Promise<Project[]> {
    const all = await firestoreService.getProjects(params);
    let result = all;
    if (params?.category) result = result.filter(p => p.category === params.category);
    if (params?.status) result = result.filter(p => p.status === params.status);
    if (params?.featured !== undefined) result = result.filter(p => p.featured === params.featured);
    if (params?.publishedOnly) result = result.filter(p => p.status === 'published');
    return result;
  },

  async getProject(idOrSlug: string): Promise<Project> {
    const all = await firestoreService.getProjects();
    const found = all.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!found) throw new Error('Project not found');
    return found;
  },

  async createProject(projectData: Partial<Project> & { autoCaptureScreenshots?: boolean }): Promise<Project> {
    const created = await firestoreService.createProject(projectData as any);
    
    // If user requested automatic screenshot pipeline and provided a live URL
    if (projectData.autoCaptureScreenshots && projectData.liveUrl) {
      try {
        await api.triggerScreenshotJob({
          url: projectData.liveUrl,
          projectId: created.id,
          projectTitle: created.title,
        });
      } catch (e) {
        console.warn('Screenshot pipeline trigger deferred:', e);
      }
    }

    return created;
  },

  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    const updated = await firestoreService.updateProject(id, patch);
    if (!updated) throw new Error('Failed to update project in Firestore');
    return updated;
  },

  async deleteProject(id: string): Promise<void> {
    await firestoreService.deleteProject(id);
  },

  async toggleFeatureProject(id: string): Promise<Project> {
    const res = await firestoreService.toggleFeatureProject(id);
    if (!res) throw new Error('Failed to toggle featured status');
    return res;
  },

  async reorderProjects(orderedIds: string[]): Promise<Project[]> {
    const projects = await firestoreService.getProjects();
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await firestoreService.updateProject(id, { order: i + 1 });
    }
    return await firestoreService.getProjects();
  },

  async auditProject(id: string): Promise<Project> {
    const proj = await api.getProject(id);
    // Call server Gemini audit
    const res = await fetch('/api/ai/analyze-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: proj.title,
        description: proj.longDescription || proj.description,
        technologies: proj.technologies,
        url: proj.liveUrl,
        githubUrl: proj.githubUrl,
      }),
    });

    if (res.ok) {
      const aiData = await res.json();
      const updated = await firestoreService.updateProject(id, {
        aiAudit: {
          strengths: aiData.strengths || ['Architecturally verified code structure.'],
          weaknesses: aiData.weaknesses || [],
          uxOpportunities: aiData.uxOpportunities || [],
          accessibilityNotes: aiData.accessibilityNotes || [],
          seoCheck: aiData.seoCheck || [],
          verifiedScore: aiData.verifiedScore || 95,
          lastAuditedAt: new Date().toISOString(),
        },
      });
      return updated || proj;
    }
    return proj;
  },

  // --------------------------------------------------
  // SKILLS & SERVICES
  // --------------------------------------------------
  async getSkills(): Promise<SkillCategory[]> {
    return await firestoreService.getSkills();
  },

  async updateSkills(skills: SkillCategory[]): Promise<SkillCategory[]> {
    return await firestoreService.updateSkills(skills);
  },

  async getServices(): Promise<Service[]> {
    return await firestoreService.getServices();
  },

  async updateServices(services: Service[]): Promise<Service[]> {
    return await firestoreService.updateServices(services);
  },

  // --------------------------------------------------
  // MESSAGES
  // --------------------------------------------------
  async getMessages(): Promise<Message[]> {
    return await firestoreService.getMessages();
  },

  async sendMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    projectType: string;
  }): Promise<{ success: boolean; message: string; id: string }> {
    const msg = await firestoreService.sendMessage(data);
    return { success: true, message: 'Message delivered to Firestore inbox', id: msg.id };
  },

  async updateMessageStatus(id: string, status: Message['status']): Promise<Message> {
    await firestoreService.updateMessageStatus(id, status);
    const messages = await firestoreService.getMessages();
    const updated = messages.find(m => m.id === id);
    if (!updated) throw new Error('Message not found');
    return updated;
  },

  async deleteMessage(id: string): Promise<void> {
    await firestoreService.deleteMessage(id);
  },

  // --------------------------------------------------
  // SCREENSHOT JOBS
  // --------------------------------------------------
  async triggerScreenshotJob(params: {
    url: string;
    projectId?: string;
    projectTitle?: string;
  }): Promise<{ message: string; jobId: string; status: string }> {
    // 1. Create job document in Cloud Firestore
    const job = await firestoreService.createScreenshotJob(params.url, params.projectId, params.projectTitle);

    // 2. Trigger server-side Playwright worker asynchronously
    fetch('/api/jobs/screenshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, jobId: job.id }),
    }).catch(err => console.warn('Async job trigger notice:', err));

    return { message: 'Screenshot job initialized', jobId: job.id, status: 'queued' };
  },

  async getScreenshotJob(id: string): Promise<ScreenshotJob> {
    const jobs = await firestoreService.getScreenshotJobs();
    const job = jobs.find(j => j.id === id);
    if (!job) throw new Error('Screenshot job not found');
    return job;
  },

  async getScreenshotJobs(): Promise<ScreenshotJob[]> {
    return await firestoreService.getScreenshotJobs();
  },

  // --------------------------------------------------
  // AI OPERATIONS
  // --------------------------------------------------
  async aiAnalyzeProject(data: {
    title?: string;
    url?: string;
    githubUrl?: string;
    description?: string;
    readme?: string;
    packageJson?: string;
    technologies?: string[];
  }): Promise<any> {
    const res = await fetch('/api/ai/analyze-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI analysis failed');
    }
    return res.json();
  },

  async aiAnalyzeScreenshots(screenshots: any[], projectContext?: { title: string; category: string }): Promise<any> {
    const res = await fetch('/api/ai/analyze-screenshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenshots, projectContext }),
    });
    if (!res.ok) throw new Error('AI screenshot analysis failed');
    return res.json();
  },

  async aiOptimizePortfolio(): Promise<PortfolioOptimizationResult> {
    const res = await fetch('/api/ai/optimize-portfolio', { method: 'POST' });
    if (!res.ok) throw new Error('Portfolio optimization analysis failed');
    return res.json();
  },

  async aiChat(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('AI Chat request failed');
    return res.json();
  },

  async githubInspect(repoUrl: string): Promise<any> {
    const res = await fetch('/api/github/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to inspect GitHub repository');
    }
    return res.json();
  },

  // --------------------------------------------------
  // ACTIVITY LOGS & SETTINGS
  // --------------------------------------------------
  async getActivityLogs(): Promise<ActivityLog[]> {
    return await firestoreService.getActivityLogs();
  },

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) return {
      siteTitle: 'Kirlous Wael — Full Stack Web & Android Developer',
      siteDescription: 'Engineering portfolio of Kirlous Wael, featuring full-stack web platforms, native Android applications, and cloud AI architecture.',
      googleAnalyticsId: '',
      enableAiChat: true,
      enableAutoScreenshots: true,
      defaultCoverViewport: 'desktop',
      contactEmailNotification: true,
    };
    return res.json();
  },

  async updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
