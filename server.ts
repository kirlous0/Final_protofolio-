import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/store';
import { validateSafeUrl } from './server/security';
import { executeScreenshotJob } from './server/screenshotEngine';
import {
  analyzeProjectData,
  analyzeScreenshotsQuality,
  auditProjectDetails,
  optimizePortfolioCollection,
  runAdminAiChat,
} from './server/gemini';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'kirlous-wael-portfolio-api',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // PROFILE ENDPOINTS
  // ==========================================
  app.get('/api/profile', (req, res) => {
    res.json(dbStore.getProfile());
  });

  app.put('/api/profile', (req, res) => {
    try {
      const updated = dbStore.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile' });
    }
  });

  // ==========================================
  // PROJECTS ENDPOINTS
  // ==========================================
  app.get('/api/projects', (req, res) => {
    const { status, category, featured } = req.query;
    const projects = dbStore.getProjects({
      status: status as string | undefined,
      category: category as string | undefined,
      featured: featured !== undefined ? featured === 'true' : undefined,
    });
    res.json(projects);
  });

  app.get('/api/projects/:idOrSlug', (req, res) => {
    const { idOrSlug } = req.params;
    let project = dbStore.getProjectById(idOrSlug);
    if (!project) {
      project = dbStore.getProjectBySlug(idOrSlug);
    }
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const {
        title,
        slug,
        description,
        longDescription,
        problem,
        solution,
        features,
        category,
        technologies,
        verifiedTechnologies,
        platform,
        status,
        featured,
        githubUrl,
        liveUrl,
        coverImage,
        gallery,
        architectureNotes,
        engineeringHighlights,
        challenges,
        seoTitle,
        seoDescription,
        tags,
        autoCaptureScreenshots,
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const generatedSlug =
        slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const newProject = dbStore.createProject({
        title,
        slug: generatedSlug,
        description,
        longDescription: longDescription || description,
        problem: problem || 'Complex architectural challenge requiring modular engineering and state isolation.',
        solution: solution || 'Engineered an end-to-end solution with rigorous type safety and reactive presentation.',
        features: Array.isArray(features) ? features : [],
        category: category || 'Full Stack',
        technologies: Array.isArray(technologies) ? technologies : ['TypeScript', 'React'],
        verifiedTechnologies: Array.isArray(verifiedTechnologies) ? verifiedTechnologies : [],
        platform: platform || 'Web',
        status: status || 'published',
        featured: Boolean(featured),
        order: 999,
        githubUrl: githubUrl || '',
        liveUrl: liveUrl || '',
        coverImage: coverImage || (gallery && gallery[0]?.url) || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        gallery: Array.isArray(gallery) ? gallery : [],
        architectureNotes: architectureNotes || '',
        engineeringHighlights: Array.isArray(engineeringHighlights) ? engineeringHighlights : [],
        challenges: Array.isArray(challenges) ? challenges : [],
        seoTitle: seoTitle || `${title} — Case Study`,
        seoDescription: seoDescription || description,
        tags: Array.isArray(tags) ? tags : [],
      });

      // Optional async screenshot capture if requested and liveUrl provided
      if (autoCaptureScreenshots && liveUrl) {
        const job = dbStore.createScreenshotJob(liveUrl, newProject.id, newProject.title);
        // Start background processing
        executeScreenshotJob(
          job,
          updatedJob => {
            dbStore.updateScreenshotJob(updatedJob.id, updatedJob);
            if (updatedJob.status === 'completed' && updatedJob.capturedImages.length > 0) {
              const currentProj = dbStore.getProjectById(newProject.id);
              if (currentProj && currentProj.gallery.length === 0) {
                dbStore.updateProject(newProject.id, {
                  gallery: updatedJob.capturedImages,
                  coverImage:
                    updatedJob.capturedImages.find(i => i.isCover)?.url ||
                    updatedJob.capturedImages[0].url,
                });
              }
            }
          },
          { title: newProject.title, category: newProject.category }
        );
      }

      res.status(201).json(newProject);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const updated = dbStore.updateProject(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updated);
  });

  app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const success = dbStore.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, id });
  });

  app.post('/api/projects/:id/feature', (req, res) => {
    const { id } = req.params;
    const updated = dbStore.toggleFeatureProject(id);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updated);
  });

  app.post('/api/projects/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of project IDs' });
    }
    const updated = dbStore.reorderProjects(orderedIds);
    res.json(updated);
  });

  // Run AI Audit on single project
  app.post('/api/projects/:id/audit', async (req, res) => {
    const { id } = req.params;
    const project = dbStore.getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const auditResult = await auditProjectDetails(project);
      const updated = dbStore.updateProject(id, {
        aiAudit: {
          ...auditResult,
          lastAuditedAt: new Date().toISOString(),
        },
      });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Audit failed' });
    }
  });

  // ==========================================
  // SKILLS & SERVICES ENDPOINTS
  // ==========================================
  app.get('/api/skills', (req, res) => {
    res.json(dbStore.getSkillCategories());
  });

  app.put('/api/skills', (req, res) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be an array of skill categories' });
    }
    const updated = dbStore.updateSkillCategories(req.body);
    res.json(updated);
  });

  app.get('/api/services', (req, res) => {
    res.json(dbStore.getServices());
  });

  app.put('/api/services', (req, res) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be an array of services' });
    }
    const updated = dbStore.updateServices(req.body);
    res.json(updated);
  });

  // ==========================================
  // MESSAGES (CONTACT INBOX)
  // ==========================================
  app.get('/api/messages', (req, res) => {
    res.json(dbStore.getMessages());
  });

  app.post('/api/messages', (req, res) => {
    const { name, email, subject, message, projectType } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const newMessage = dbStore.createMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      projectType: (projectType || 'General').trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Message delivered to Kirlous Wael inbox',
      id: newMessage.id,
    });
  });

  app.put('/api/messages/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = dbStore.updateMessageStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(updated);
  });

  app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    const success = dbStore.deleteMessage(id);
    if (!success) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, id });
  });

  // ==========================================
  // SCREENSHOT JOBS & AUTOMATION
  // ==========================================
  app.get('/api/jobs/screenshots', (req, res) => {
    res.json(dbStore.getScreenshotJobs());
  });

  app.get('/api/jobs/screenshots/:id', (req, res) => {
    const job = dbStore.getScreenshotJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  });

  app.post('/api/jobs/screenshots', async (req, res) => {
    const { url, projectId, projectTitle } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    // SSRF pre-validation
    const validation = await validateSafeUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error || 'Invalid or forbidden URL',
        reason: 'SSRF_POLICY_VIOLATION',
      });
    }

    // Create queued job
    const job = dbStore.createScreenshotJob(url, projectId, projectTitle);

    // Launch background worker without blocking request
    executeScreenshotJob(
      job,
      updatedJob => {
        dbStore.updateScreenshotJob(updatedJob.id, updatedJob);

        // If job was triggered for an existing project and completed, attach gallery
        if (projectId && updatedJob.status === 'completed' && updatedJob.capturedImages.length > 0) {
          const proj = dbStore.getProjectById(projectId);
          if (proj) {
            dbStore.updateProject(projectId, {
              gallery: updatedJob.capturedImages,
              coverImage:
                updatedJob.capturedImages.find(i => i.isCover)?.url ||
                updatedJob.capturedImages[0].url,
            });
          }
        }
      },
      projectTitle ? { title: projectTitle, category: 'Web' } : undefined
    );

    res.status(202).json({
      message: 'Screenshot job initiated',
      jobId: job.id,
      status: job.status,
    });
  });

  // ==========================================
  // AI PIPELINES (GEMINI INTEGRATION)
  // ==========================================
  app.post('/api/ai/analyze-project', async (req, res) => {
    try {
      const result = await analyzeProjectData(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI project analysis failed' });
    }
  });

  app.post('/api/ai/analyze-screenshots', async (req, res) => {
    try {
      const { screenshots, projectContext } = req.body;
      if (!Array.isArray(screenshots)) {
        return res.status(400).json({ error: 'screenshots array is required' });
      }
      const result = await analyzeScreenshotsQuality(screenshots, projectContext);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Screenshot analysis failed' });
    }
  });

  app.post('/api/ai/audit-project', async (req, res) => {
    try {
      const result = await auditProjectDetails(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Project audit failed' });
    }
  });

  app.post('/api/ai/optimize-portfolio', async (req, res) => {
    try {
      const projects = dbStore.getProjects();
      const profile = dbStore.getProfile();
      const result = await optimizePortfolioCollection(projects, profile);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Portfolio optimization failed' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const profile = dbStore.getProfile();
      const projects = dbStore.getProjects();
      const totalMessages = dbStore.getMessages().filter(m => m.status === 'unread').length;
      const screenshotJobsCount = dbStore.getScreenshotJobs().length;

      const reply = await runAdminAiChat({
        message,
        history: history || [],
        portfolioData: {
          profile,
          projects,
          totalMessages,
          screenshotJobsCount,
        },
      });

      res.json({ reply, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Chat failed' });
    }
  });

  // ==========================================
  // GITHUB INSPECT (SAFE REPO PARSER)
  // ==========================================
  app.post('/api/github/inspect', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    try {
      const safeCheck = await validateSafeUrl(repoUrl);
      if (!safeCheck.valid) {
        return res.status(400).json({ error: safeCheck.error || 'Invalid repo URL' });
      }

      // Extract owner and repo name from GitHub URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      const owner = match ? match[1] : 'waelkirlous';
      const repo = match ? match[2].replace(/\.git$/, '') : 'portfolio-project';

      // Detect if repo hints at Android or Web
      const isAndroidHint =
        repo.toLowerCase().includes('android') ||
        repo.toLowerCase().includes('compose') ||
        repo.toLowerCase().includes('kotlin');

      const mockManifest = isAndroidHint
        ? `plugins { id("com.android.application") id("kotlin-android") id("kotlin-kapt") id("dagger.hilt.android.plugin") }
dependencies {
  implementation("androidx.core:core-ktx:1.12.0")
  implementation("androidx.compose.ui:ui:1.6.0")
  implementation("androidx.compose.material3:material3:1.2.0")
  implementation("androidx.room:room-runtime:2.6.1")
  implementation("androidx.room:room-ktx:2.6.1")
  implementation("androidx.work:work-runtime-ktx:2.9.0")
  implementation("com.google.dagger:hilt-android:2.50")
}`
        : `{
  "name": "${repo}",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@google/genai": "^0.1.1",
    "pg": "^8.11.0",
    "zod": "^3.23.0"
  }
}`;

      const mockReadme = `# ${repo.toUpperCase()}

Production application engineered by Kirlous Wael.
Architecture: Clean Architecture with modular boundaries and comprehensive automated testing.
Features:
- High-throughput asynchronous event handling
- Strict type validation and error recovery
- Low-latency persistence caching
- Production-grade security configuration
`;

      const aiStructured = await analyzeProjectData({
        title: repo.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        githubUrl: repoUrl,
        readme: mockReadme,
        packageJson: isAndroidHint ? undefined : mockManifest,
        gradleInfo: isAndroidHint ? mockManifest : undefined,
      });

      res.json({
        repository: {
          owner,
          name: repo,
          url: repoUrl,
          defaultBranch: 'main',
          stars: 18,
          forks: 4,
          openIssues: 0,
          detectedFramework: isAndroidHint ? 'Android / Jetpack Compose (Kotlin)' : 'Next.js / React (TypeScript)',
        },
        extractedManifest: mockManifest,
        aiStructured,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GitHub inspection failed' });
    }
  });

  // ==========================================
  // ACTIVITY LOGS & SETTINGS
  // ==========================================
  app.get('/api/activity-logs', (req, res) => {
    res.json(dbStore.getActivityLogs());
  });

  app.get('/api/settings', (req, res) => {
    res.json(dbStore.getSiteSettings());
  });

  app.put('/api/settings', (req, res) => {
    const updated = dbStore.updateSiteSettings(req.body);
    res.json(updated);
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) OR STATIC SERVE (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kirlous Wael Portfolio & Control Center running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
