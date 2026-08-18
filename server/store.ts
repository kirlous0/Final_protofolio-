import fs from 'fs';
import path from 'path';
import {
  Profile,
  Project,
  SkillCategory,
  Service,
  Message,
  SiteSettings,
  ScreenshotJob,
  ActivityLog,
} from '../src/types';
import {
  initialProfile,
  initialProjects,
  initialSkillCategories,
  initialServices,
  initialMessages,
  initialSiteSettings,
} from '../src/data/initialData';

interface StoreDataSchema {
  version: number;
  profile: Profile;
  projects: Project[];
  skillCategories: SkillCategory[];
  services: Service[];
  messages: Message[];
  siteSettings: SiteSettings;
  screenshotJobs: ScreenshotJob[];
  activityLogs: ActivityLog[];
}

class PortfolioStore {
  private dataFilePath: string;
  private profile: Profile = { ...initialProfile };
  private projects: Project[] = [...initialProjects];
  private skillCategories: SkillCategory[] = [...initialSkillCategories];
  private services: Service[] = [...initialServices];
  private messages: Message[] = [...initialMessages];
  private siteSettings: SiteSettings = { ...initialSiteSettings };
  private screenshotJobs: ScreenshotJob[] = [];
  private activityLogs: ActivityLog[] = [
    {
      id: 'log-1',
      action: 'SYSTEM_BOOT',
      entityType: 'security',
      details: 'Portfolio platform and persistent storage initialized successfully.',
      timestamp: new Date().toISOString(),
    },
  ];

  constructor() {
    // Persistent data file located in /data/portfolio-store.json
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
    this.dataFilePath = path.join(dataDir, 'portfolio-store.json');
    this.loadFromDisk();
  }

  /**
   * Load data from disk on boot
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed: StoreDataSchema = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.profile) this.profile = parsed.profile;
          if (Array.isArray(parsed.projects)) this.projects = parsed.projects;
          if (Array.isArray(parsed.skillCategories)) this.skillCategories = parsed.skillCategories;
          if (Array.isArray(parsed.services)) this.services = parsed.services;
          if (Array.isArray(parsed.messages)) this.messages = parsed.messages;
          if (parsed.siteSettings) this.siteSettings = parsed.siteSettings;
          if (Array.isArray(parsed.screenshotJobs)) this.screenshotJobs = parsed.screenshotJobs;
          if (Array.isArray(parsed.activityLogs)) this.activityLogs = parsed.activityLogs;
          console.log(`[Store] Successfully loaded ${this.projects.length} projects and store data from disk.`);
          return;
        }
      }
    } catch (err) {
      console.error('[Store] Failed to read from disk, creating initial store file:', err);
    }
    // If not found or failed, save initial seed to disk
    this.persistToDisk();
  }

  /**
   * Atomic persistence to disk
   */
  private persistToDisk(): void {
    try {
      const dataToSave: StoreDataSchema = {
        version: 1,
        profile: this.profile,
        projects: this.projects,
        skillCategories: this.skillCategories,
        services: this.services,
        messages: this.messages,
        siteSettings: this.siteSettings,
        screenshotJobs: this.screenshotJobs,
        activityLogs: this.activityLogs,
      };

      const tempPath = `${this.dataFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dataFilePath);
    } catch (err) {
      console.error('[Store] Failed to persist data to disk:', err);
    }
  }

  // Profile operations
  getProfile(): Profile {
    return { ...this.profile };
  }

  updateProfile(patch: Partial<Profile>): Profile {
    this.profile = { ...this.profile, ...patch };
    this.logActivity('PROFILE_UPDATED', 'profile', undefined, 'Admin updated public profile credentials and bio.');
    this.persistToDisk();
    return this.getProfile();
  }

  // Projects operations
  getProjects(filters?: { status?: string; category?: string; featured?: boolean }): Project[] {
    let result = [...this.projects];
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters?.category) {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters?.featured !== undefined) {
      result = result.filter(p => p.featured === filters.featured);
    }
    return result.sort((a, b) => a.order - b.order);
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  getProjectBySlug(slug: string): Project | undefined {
    return this.projects.find(p => p.slug === slug);
  }

  createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      ...data,
      id,
      order: this.projects.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(newProject);
    this.logActivity('PROJECT_CREATED', 'project', id, `Created project "${newProject.title}".`);
    this.persistToDisk();
    return newProject;
  }

  updateProject(id: string, patch: Partial<Project>): Project | null {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.projects[idx] = {
      ...this.projects[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.logActivity('PROJECT_UPDATED', 'project', id, `Updated project "${this.projects[idx].title}".`);
    this.persistToDisk();
    return this.projects[idx];
  }

  deleteProject(id: string): boolean {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const title = this.projects[idx].title;
    this.projects.splice(idx, 1);
    this.logActivity('PROJECT_DELETED', 'project', id, `Deleted project "${title}".`);
    this.persistToDisk();
    return true;
  }

  toggleFeatureProject(id: string): Project | null {
    const project = this.getProjectById(id);
    if (!project) return null;
    project.featured = !project.featured;
    project.updatedAt = new Date().toISOString();
    this.logActivity(
      project.featured ? 'PROJECT_FEATURED' : 'PROJECT_UNFEATURED',
      'project',
      id,
      `${project.featured ? 'Featured' : 'Unfeatured'} project "${project.title}".`
    );
    this.persistToDisk();
    return project;
  }

  reorderProjects(orderedIds: string[]): Project[] {
    orderedIds.forEach((id, index) => {
      const proj = this.projects.find(p => p.id === id);
      if (proj) {
        proj.order = index + 1;
        proj.updatedAt = new Date().toISOString();
      }
    });
    this.logActivity('PROJECTS_REORDERED', 'project', undefined, 'Updated display ordering of projects.');
    this.persistToDisk();
    return this.getProjects();
  }

  // Skills
  getSkillCategories(): SkillCategory[] {
    return [...this.skillCategories];
  }

  updateSkillCategories(categories: SkillCategory[]): SkillCategory[] {
    this.skillCategories = [...categories];
    this.logActivity('SKILLS_UPDATED', 'profile', undefined, 'Updated skill taxonomy and experience ratings.');
    this.persistToDisk();
    return this.getSkillCategories();
  }

  // Services
  getServices(): Service[] {
    return [...this.services];
  }

  updateServices(services: Service[]): Service[] {
    this.services = [...services];
    this.logActivity('SERVICES_UPDATED', 'profile', undefined, 'Updated professional engineering services.');
    this.persistToDisk();
    return this.getServices();
  }

  // Messages
  getMessages(): Message[] {
    return [...this.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createMessage(data: Omit<Message, 'id' | 'createdAt' | 'status'>): Message {
    const newMessage: Message = {
      ...data,
      id: `msg-${Date.now()}`,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    this.messages.unshift(newMessage);
    this.logActivity('MESSAGE_RECEIVED', 'message', newMessage.id, `New contact message from ${newMessage.name} (${newMessage.email}).`);
    this.persistToDisk();
    return newMessage;
  }

  updateMessageStatus(id: string, status: Message['status']): Message | null {
    const msg = this.messages.find(m => m.id === id);
    if (!msg) return null;
    msg.status = status;
    this.logActivity('MESSAGE_STATUS_CHANGED', 'message', id, `Marked message from ${msg.name} as ${status}.`);
    this.persistToDisk();
    return msg;
  }

  deleteMessage(id: string): boolean {
    const idx = this.messages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.messages.splice(idx, 1);
    this.persistToDisk();
    return true;
  }

  // Screenshot Jobs
  createScreenshotJob(url: string, projectId?: string, projectTitle?: string): ScreenshotJob {
    const newJob: ScreenshotJob = {
      id: `job-${Date.now()}`,
      projectId,
      projectTitle,
      url,
      status: 'queued',
      progress: 0,
      stepName: 'Screenshot capture job queued',
      capturedImages: [],
      createdAt: new Date().toISOString(),
    };
    this.screenshotJobs.unshift(newJob);
    this.logActivity('SCREENSHOT_JOB_CREATED', 'screenshot', newJob.id, `Created screenshot capture job for ${url}.`);
    this.persistToDisk();
    return newJob;
  }

  getScreenshotJob(id: string): ScreenshotJob | undefined {
    return this.screenshotJobs.find(j => j.id === id);
  }

  getScreenshotJobs(): ScreenshotJob[] {
    return [...this.screenshotJobs];
  }

  updateScreenshotJob(id: string, patch: Partial<ScreenshotJob>): ScreenshotJob | null {
    const job = this.screenshotJobs.find(j => j.id === id);
    if (!job) return null;
    Object.assign(job, patch);
    this.persistToDisk();
    return job;
  }

  // Site Settings
  getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  updateSiteSettings(patch: Partial<SiteSettings>): SiteSettings {
    this.siteSettings = { ...this.siteSettings, ...patch };
    this.logActivity('SETTINGS_UPDATED', 'security', undefined, 'Updated global platform configuration and SEO preferences.');
    this.persistToDisk();
    return this.getSiteSettings();
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return [...this.activityLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private logActivity(
    action: string,
    entityType: ActivityLog['entityType'],
    entityId: string | undefined,
    details: string
  ) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.activityLogs.unshift(log);
    // Keep max 200 logs
    if (this.activityLogs.length > 200) {
      this.activityLogs.pop();
    }
  }
}

export const dbStore = new PortfolioStore();
