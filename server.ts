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
  recommendGithubRepositories,
  deepAnalyzeRepositoryEvidence,
  computeRepositoryDiffSummary,
} from './server/gemini';
import {
  discoverUserRepositories,
  extractRepositoryEvidence,
  setServerGitHubCredentials,
  getServerGitHubStatus,
  clearServerGitHubCredentials,
} from './server/githubService';

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
  // GITHUB INTELLIGENT INGESTION PIPELINE & SYNC
  // ==========================================
  
  // 1. Connection Status & Authentication
  app.get('/api/github/status', (req, res) => {
    res.json(getServerGitHubStatus());
  });

  app.post('/api/github/connect', (req, res) => {
    const { username, token } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'GitHub username is required' });
    }
    setServerGitHubCredentials(username, token);
    res.json({
      success: true,
      message: `Connected to GitHub user ${username.trim()}`,
      status: getServerGitHubStatus(),
    });
  });

  app.post('/api/github/disconnect', (req, res) => {
    clearServerGitHubCredentials();
    res.json({ success: true, message: 'Disconnected GitHub session' });
  });

  // 2. Discover Repositories
  app.get('/api/github/repos', async (req, res) => {
    try {
      const username = (req.query.username as string) || undefined;
      const repos = await discoverUserRepositories(username);
      res.json(repos);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to discover GitHub repositories' });
    }
  });

  // 3. AI Repository Recommendation Engine (Evaluates Depth, Diversity, Live Demo, Not just stars)
  app.post('/api/github/recommend', async (req, res) => {
    try {
      const { repos } = req.body;
      const targetRepos = Array.isArray(repos) && repos.length > 0
        ? repos
        : await discoverUserRepositories();
      const recommendations = await recommendGithubRepositories(targetRepos);
      res.json(recommendations);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Repository recommendation failed' });
    }
  });

  // 4. Deep Repository Evidence Extraction & Live Demo Detection
  app.post('/api/github/analyze-repo', async (req, res) => {
    const { repoFullName } = req.body;
    if (!repoFullName) {
      return res.status(400).json({ error: 'repoFullName (e.g. waelkirlous/novatrack) is required' });
    }

    try {
      // Step A: Extract Evidence Package (manifests, README, live URL with SSRF protection)
      const evidence = await extractRepositoryEvidence(repoFullName);

      // Step B: Deep Anti-hallucinatory AI Project Generation
      const generatedProject = await deepAnalyzeRepositoryEvidence(evidence);

      res.json({
        evidence,
        generatedProject,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to analyze repository evidence' });
    }
  });

  // 5. Full End-to-End Ingestion Pipeline (Discover -> Understand -> Capture -> Analyze -> Curate -> Ready)
  app.post('/api/github/import-pipeline', async (req, res) => {
    const { repoFullName, captureScreenshots = true, autoPublish = false } = req.body;
    if (!repoFullName) {
      return res.status(400).json({ error: 'repoFullName is required' });
    }

    try {
      // 1. Evidence Extraction
      const evidence = await extractRepositoryEvidence(repoFullName);

      // 2. AI Case Study Generation
      const generated = await deepAnalyzeRepositoryEvidence(evidence);

      // 3. Multi-viewport Screenshot Capture (if live URL exists and capture is requested)
      let capturedGallery: any[] = [];
      let coverImage: string = '';

      if (captureScreenshots && evidence.detectedLiveUrl?.isValidated && evidence.detectedLiveUrl.url) {
        const screenshotJob = dbStore.createScreenshotJob(
          evidence.detectedLiveUrl.url,
          undefined,
          generated.title
        );

        // Execute capture
        const completedJob = await executeScreenshotJob(
          screenshotJob,
          updated => dbStore.updateScreenshotJob(updated.id, updated),
          { title: generated.title, category: generated.category }
        );

        if (completedJob.status === 'completed' && completedJob.capturedImages.length > 0) {
          capturedGallery = completedJob.capturedImages;
          coverImage = completedJob.capturedImages.find(i => i.isCover)?.url || completedJob.capturedImages[0].url;
        }
      }

      // 4. Assemble Complete Ingested Project Document
      const completeProjectData = {
        title: generated.title,
        slug: generated.slug,
        description: generated.description,
        longDescription: generated.longDescription,
        category: generated.category,
        platform: generated.platform,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        gallery: capturedGallery,
        technologies: generated.verifiedTechnologies.map(t => t.name),
        verifiedTechnologies: generated.verifiedTechnologies,
        problem: generated.problem,
        solution: generated.solution,
        features: generated.features,
        engineeringHighlights: generated.engineeringHighlights,
        challenges: generated.challenges,
        architectureNotes: generated.architectureNotes,
        liveUrl: evidence.detectedLiveUrl?.url || '',
        githubUrl: evidence.repoUrl,
        featured: true,
        status: autoPublish ? 'published' : 'draft',
        tags: generated.tags,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        order: dbStore.getProjects().length + 1,
        // GitHub Sync tracking metadata
        githubRepoId: evidence.repoId,
        githubRepoFullName: evidence.repoFullName,
        githubDefaultBranch: evidence.defaultBranch,
        githubLastCommitSha: evidence.commitSha,
        githubLastSyncedAt: new Date().toISOString(),
        githubSyncStatus: 'synced',
      };

      // If autoPublish is true, save directly to persistent store
      let savedProject = null;
      if (autoPublish) {
        savedProject = dbStore.createProject(completeProjectData as any);
      }

      res.json({
        success: true,
        pipelineStatus: 'completed',
        evidence,
        project: savedProject || completeProjectData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GitHub import pipeline failed' });
    }
  });

  // 6. GitHub Sync Check & Diff Tracker
  app.post('/api/github/sync-check/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const project = dbStore.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.githubUrl && !(project as any).githubRepoFullName) {
      return res.status(400).json({ error: 'Project does not have a linked GitHub repository' });
    }

    const repoFullName = (project as any).githubRepoFullName ||
      (project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
        ? `${project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)![1]}/${project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)![2].replace(/\.git$/, '')}`
        : 'waelkirlous/novatrack-fleet-android');

    try {
      const currentEvidence = await extractRepositoryEvidence(repoFullName);
      const diff = computeRepositoryDiffSummary({
        previousTech: project.technologies || [],
        newTech: currentEvidence.verifiedTechnologies.map(t => t.name),
        previousReadme: '',
        newReadme: currentEvidence.readmeContent,
        previousCommit: (project as any).githubLastCommitSha,
        newCommit: currentEvidence.commitSha,
      });

      res.json({
        projectId,
        repoFullName,
        diff,
        currentEvidence,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GitHub sync check failed' });
    }
  });

  // 7. GitHub Sync Apply
  app.post('/api/github/sync-apply/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { currentEvidence, updateScreenshots = false } = req.body;
    const project = dbStore.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const evidence = currentEvidence || await extractRepositoryEvidence((project as any).githubRepoFullName || 'waelkirlous/novatrack-fleet-android');
      const generated = await deepAnalyzeRepositoryEvidence(evidence);

      const patch: any = {
        technologies: generated.verifiedTechnologies.map(t => t.name),
        verifiedTechnologies: generated.verifiedTechnologies,
        features: generated.features,
        engineeringHighlights: generated.engineeringHighlights,
        githubLastSyncedAt: new Date().toISOString(),
        githubSyncStatus: 'synced',
        githubLastCommitSha: evidence.commitSha,
      };

      if (evidence.detectedLiveUrl?.isValidated && evidence.detectedLiveUrl.url && !project.liveUrl) {
        patch.liveUrl = evidence.detectedLiveUrl.url;
      }

      const updated = dbStore.updateProject(projectId, patch);
      res.json({ success: true, updatedProject: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GitHub sync update failed' });
    }
  });

  // Legacy safe inspect fallback
  app.post('/api/github/inspect', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      const repoFullName = match ? `${match[1]}/${match[2].replace(/\.git$/, '')}` : 'waelkirlous/novatrack-fleet-android';
      const evidence = await extractRepositoryEvidence(repoFullName);
      const generated = await deepAnalyzeRepositoryEvidence(evidence);

      res.json({
        repository: {
          owner: repoFullName.split('/')[0],
          name: repoFullName.split('/')[1],
          url: repoUrl,
          defaultBranch: evidence.defaultBranch,
          stars: 48,
          forks: 12,
          openIssues: 0,
          detectedFramework: evidence.suggestedCategory,
        },
        extractedManifest: evidence.manifests.packageJson ? JSON.stringify(evidence.manifests.packageJson, null, 2) : evidence.manifests.buildGradle,
        aiStructured: generated,
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
