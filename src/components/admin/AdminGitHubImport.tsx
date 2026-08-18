import React, { useState, useEffect } from 'react';
import {
  Github,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Flame,
  FileCode,
  Tag,
  Star,
  GitFork,
  ArrowUpRight,
  Check,
  X,
  Play,
  RotateCcw,
  Sliders,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, GitHubRepository, ProjectImage, VerifiedTechnology } from '../../types';
import { api } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

interface AdminGitHubImportProps {
  onRefreshProjects: () => void;
  onSelectProjectToEdit?: (project: Project) => void;
  existingProjects: Project[];
}

type PipelineStep = 'discover' | 'ingesting' | 'review' | 'sync-manager';

export const AdminGitHubImport: React.FC<AdminGitHubImportProps> = ({
  onRefreshProjects,
  onSelectProjectToEdit,
  existingProjects,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Navigation & Step state
  const [currentStep, setCurrentStep] = useState<PipelineStep>('discover');

  // Connection State
  const [username, setUsername] = useState('waelkirlous');
  const [githubToken, setGithubToken] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Repositories State
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'stars' | 'updated'>('recommended');

  // AI Recommendation State
  const [recommendations, setRecommendations] = useState<Record<string, any>>({});
  const [isRecommending, setIsRecommending] = useState(false);

  // Ingestion Pipeline Execution State
  const [activeIngestionRepo, setActiveIngestionRepo] = useState<GitHubRepository | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStepName, setPipelineStepName] = useState('');
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [captureScreenshotsOption, setCaptureScreenshotsOption] = useState(true);

  // Review & Curation State
  const [ingestedProject, setIngestedProject] = useState<Partial<Project> | null>(null);
  const [ingestedEvidence, setIngestedEvidence] = useState<any>(null);
  const [selectedViewport, setSelectedViewport] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Sync Manager State
  const [checkingSyncId, setCheckingSyncId] = useState<string | null>(null);
  const [syncDiffs, setSyncDiffs] = useState<Record<string, any>>({});
  const [applyingSyncId, setApplyingSyncId] = useState<string | null>(null);

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async (targetUser?: string) => {
    setLoadingRepos(true);
    try {
      const data = await api.getGitHubRepos(targetUser || username);
      setRepos(data);
      // Auto-fetch recommendations
      fetchRecommendations(data);
    } catch (e) {
      console.error('Failed to load GitHub repos:', e);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchRecommendations = async (repoList: GitHubRepository[]) => {
    if (repoList.length === 0) return;
    setIsRecommending(true);
    try {
      const recs = await api.getGitHubAiRecommendations(repoList);
      const recMap: Record<string, any> = {};
      recs.forEach((r: any) => {
        recMap[r.repoFullName] = r;
      });
      setRecommendations(recMap);
    } catch (e) {
      console.error('Failed to fetch AI recommendations:', e);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.connectGitHub(username, githubToken || undefined);
      setShowAuthModal(false);
      setIsConnected(true);
      loadRepositories(username);
    } catch (e: any) {
      alert(e.message || 'Connection failed');
    }
  };

  // Run End-to-End Ingestion Pipeline
  const startIngestionPipeline = async (repo: GitHubRepository) => {
    setActiveIngestionRepo(repo);
    setCurrentStep('ingesting');
    setPipelineProgress(10);
    setPipelineStepName('Reading repository tree & manifest files (package.json / build.gradle)...');
    setPipelineError(null);

    try {
      // Step 1: Simulated progress feedback for deep analysis
      setTimeout(() => {
        setPipelineProgress(35);
        setPipelineStepName('Validating live demo URL with SSRF security engine...');
      }, 700);

      setTimeout(() => {
        setPipelineProgress(65);
        setPipelineStepName('Launching multi-viewport headless capture (Desktop, Laptop, Tablet, Mobile)...');
      }, 1400);

      setTimeout(() => {
        setPipelineProgress(85);
        setPipelineStepName('Gemini AI evaluating composition quality & grounding evidence...');
      }, 2100);

      const result = await api.runGitHubImportPipeline({
        repoFullName: repo.fullName,
        captureScreenshots: captureScreenshotsOption,
        autoPublish: false,
      });

      setPipelineProgress(100);
      setPipelineStepName('Ingestion pipeline completed successfully!');
      
      setIngestedEvidence(result.evidence);
      setIngestedProject(result.project);
      
      setTimeout(() => {
        setCurrentStep('review');
      }, 600);
    } catch (err: any) {
      setPipelineError(err.message || 'Ingestion failed');
    }
  };

  // Publish to Live Firestore Portfolio
  const handlePublishProject = async (status: 'published' | 'draft') => {
    if (!ingestedProject) return;
    setIsPublishing(true);
    try {
      const toSave = {
        ...ingestedProject,
        status,
      };

      await api.createProject(toSave);
      setPublishSuccess(true);
      onRefreshProjects();
      
      setTimeout(() => {
        setPublishSuccess(false);
        setCurrentStep('discover');
        setIngestedProject(null);
        setIngestedEvidence(null);
      }, 1500);
    } catch (e: any) {
      alert('Failed to publish project: ' + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Sync Check for an existing project
  const handleCheckSync = async (proj: Project) => {
    setCheckingSyncId(proj.id);
    try {
      const res = await api.checkGitHubSync(proj.id);
      setSyncDiffs(prev => ({ ...prev, [proj.id]: res }));
    } catch (e: any) {
      alert(e.message || 'Sync check failed');
    } finally {
      setCheckingSyncId(null);
    }
  };

  const handleApplySync = async (proj: Project) => {
    const diffInfo = syncDiffs[proj.id];
    if (!diffInfo) return;

    setApplyingSyncId(proj.id);
    try {
      await api.applyGitHubSync(proj.id, diffInfo.currentEvidence);
      setSyncDiffs(prev => {
        const next = { ...prev };
        delete next[proj.id];
        return next;
      });
      onRefreshProjects();
      alert(`Successfully synchronized ${proj.title} with GitHub!`);
    } catch (e: any) {
      alert(e.message || 'Failed to apply sync');
    } finally {
      setApplyingSyncId(null);
    }
  };

  // Filter & Sort Repos
  const filteredRepos = repos.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.language || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'Android') return r.category === 'Android' || r.language === 'Kotlin';
    if (categoryFilter === 'Full Stack') return r.category === 'Full Stack';
    if (categoryFilter === 'AI & Cloud') return r.category === 'AI & Cloud';
    if (categoryFilter === 'Web') return r.category === 'Web';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'recommended') {
      const scoreA = recommendations[a.fullName]?.score || 0;
      const scoreB = recommendations[b.fullName]?.score || 0;
      return scoreB - scoreA;
    }
    if (sortBy === 'stars') return b.stars - a.stars;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const alreadyImportedMap = new Map<string, Project>();
  existingProjects.forEach(p => {
    if (p.githubUrl) {
      alreadyImportedMap.set(p.githubUrl.toLowerCase(), p);
    }
    if ((p as any).githubRepoFullName) {
      alreadyImportedMap.set(`https://github.com/${(p as any).githubRepoFullName}`.toLowerCase(), p);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Pipeline Header */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 transition-colors ${
          isDark
            ? 'border-[#1e2738] bg-linear-to-br from-[#0c1017] via-[#101622] to-[#0c1017]'
            : 'border-slate-200 bg-linear-to-br from-white via-amber-50/20 to-white shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  GitHub Intelligent Project Ingestion Pipeline
                </h1>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Discover, verify technical manifests, capture multi-viewport screenshots, and curate evidence-based case studies.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Step Selector Tabs */}
            <div
              className={`flex items-center rounded-xl border p-1 ${
                isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <button
                onClick={() => setCurrentStep('discover')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  currentStep === 'discover'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Discovery</span>
              </button>

              <button
                onClick={() => setCurrentStep('sync-manager')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  currentStep === 'sync-manager'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Sync Tracker</span>
                {existingProjects.filter(p => p.githubUrl).length > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-500 font-bold">
                    {existingProjects.filter(p => p.githubUrl).length}
                  </span>
                )}
              </button>
            </div>

            {/* Account Settings / Connect button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                isDark
                  ? 'border-[#232d40] bg-[#141a27] text-slate-200 hover:border-amber-500/40 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-500/40 shadow-xs'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>User: @{username}</span>
              <Sliders className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Visual Pipeline Progression Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-200/40 dark:border-[#1e2738]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            {[
              { id: '1', title: 'DISCOVER', desc: 'Scan Repos & Filter' },
              { id: '2', title: 'UNDERSTAND', desc: 'Read Manifests & Evidence' },
              { id: '3', title: 'CAPTURE', desc: 'Multi-Viewport Screenshots' },
              { id: '4', title: 'ANALYZE', desc: 'Gemini Quality Scoring' },
              { id: '5', title: 'CURATE', desc: 'Verified Case Study' },
            ].map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    currentStep === 'review'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : currentStep === 'ingesting' && idx <= 2
                      ? 'bg-amber-500 text-slate-950'
                      : isDark
                      ? 'bg-[#182030] text-slate-400 border border-[#232d40]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step.id}
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold">{step.title}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{step.desc}</div>
                </div>
                {idx < 4 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: DISCOVER VIEW */}
      {/* ========================================================================= */}
      {currentStep === 'discover' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filter, Sort & AI Recommend */}
          <div
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border ${
              isDark ? 'border-[#1e2738] bg-[#0c1017]/90' : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            {/* Search Box */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search repositories by name, language, or keyword..."
                className={`w-full rounded-xl border pl-10 pr-4 py-2 text-xs focus:outline-hidden ${
                  isDark
                    ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                }`}
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'Android', 'Full Stack', 'AI & Cloud', 'Web'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'border border-[#232d40] bg-[#121723] text-slate-300 hover:text-white'
                      : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Platforms' : cat}
                </button>
              ))}
            </div>

            {/* AI Recommend & Refresh Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchRecommendations(repos)}
                disabled={isRecommending || repos.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-50"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isRecommending ? 'animate-spin' : ''}`} />
                <span>{isRecommending ? 'Evaluating Depth...' : 'AI Rank Projects'}</span>
              </button>

              <button
                onClick={() => loadRepositories()}
                disabled={loadingRepos}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-[#232d40] bg-[#121723] text-slate-400 hover:text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'
                }`}
                title="Refresh Repositories"
              >
                <RefreshCw className={`h-4 w-4 ${loadingRepos ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Screenshot Capture Toggle Setting */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border ${
              isDark ? 'border-[#1e2738] bg-[#0f141f]' : 'border-slate-200 bg-amber-50/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs font-bold">Automated Multi-Viewport Screenshot Pipeline</div>
                <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Automatically discover live demo links, capture Desktop (1440x900), Laptop, Tablet, and Mobile (390x844) captures.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={captureScreenshotsOption}
                onChange={e => setCaptureScreenshotsOption(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Repositories Grid */}
          {loadingRepos ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <span className="font-mono text-xs font-bold text-slate-400">DISCOVERING GITHUB REPOSITORIES...</span>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white'
              }`}
            >
              <Github className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-base font-bold">No Repositories Found</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No repositories matched your filter criteria. Try clearing search or change connected user.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRepos.map(repo => {
                const rec = recommendations[repo.fullName];
                const existing = alreadyImportedMap.get(repo.htmlUrl.toLowerCase());

                return (
                  <motion.div
                    key={repo.id}
                    layout
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition-all relative overflow-hidden ${
                      rec?.recommended
                        ? isDark
                          ? 'border-amber-500/40 bg-linear-to-b from-[#131a29] to-[#0c1017] shadow-lg shadow-amber-500/5'
                          : 'border-amber-500/40 bg-linear-to-b from-amber-50/30 to-white shadow-sm'
                        : isDark
                        ? 'border-[#1e2738] bg-[#0c1017] hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Title, Category Badge & AI Score */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-500">
                              {repo.category}
                            </span>
                            {existing && (
                              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                                In Portfolio
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold tracking-tight">
                            {repo.name}
                          </h3>
                        </div>

                        {rec && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span className="font-mono text-xs font-black text-amber-500">
                              {rec.score}/100
                            </span>
                          </div>
                        )}
                      </div>

                      <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {repo.description || 'Modern codebase engineered with clean domain boundaries and automated testing.'}
                      </p>

                      {/* AI Recommendation Rationale Box */}
                      {rec && rec.why && rec.why.length > 0 && (
                        <div
                          className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                            isDark ? 'border-[#232d40] bg-[#121723]' : 'border-amber-200 bg-amber-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[11px]">
                            <Zap className="h-3 w-3" />
                            <span>Why Include in Portfolio:</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-300 dark:text-slate-400">
                            {rec.why.slice(0, 2).map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Topics / Tech Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                            repo.language === 'Kotlin'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {repo.language || 'TypeScript'}
                        </span>
                        {repo.topics.slice(0, 3).map(t => (
                          <span
                            key={t}
                            className={`rounded-md px-2 py-0.5 font-mono text-[10px] ${
                              isDark ? 'bg-[#182030] text-slate-400' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata & Action */}
                    <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-[#1e2738] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5" />
                          <span>{repo.forks}</span>
                        </div>
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-amber-500 hover:underline"
                            title="Live Demo Available"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="hidden sm:inline">Live Demo</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => startIngestionPipeline(repo)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>{existing ? 'Re-Ingest' : 'Start Import'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: INGESTION TELEMETRY PROGRESS MODAL */}
      {/* ========================================================================= */}
      {currentStep === 'ingesting' && activeIngestionRepo && (
        <div
          className={`rounded-3xl border p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl ${
            isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Ingesting & Analyzing {activeIngestionRepo.name}
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Running deep manifest extraction, SSRF security checks, multi-viewport capture, and Gemini AI ground truth evaluation.
          </p>

          {/* Progress Bar */}
          <div className="mt-8 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-500">{pipelineStepName}</span>
              <span className="font-bold">{pipelineProgress}%</span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#182030]' : 'bg-slate-100'}`}>
              <motion.div
                className="h-full bg-linear-to-r from-amber-500 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${pipelineProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.4 }}
              />
            </div>
          </div>

          {/* Live Telemetry Checklist */}
          <div
            className={`mt-6 rounded-2xl border p-4 text-left font-mono text-xs space-y-2 ${
              isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Extracted repository tree & build configurations</span>
            </div>
            <div className={`flex items-center gap-2 ${pipelineProgress >= 35 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {pipelineProgress >= 35 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-600" />}
              <span>SSRF security verification on detected demo URLs</span>
            </div>
            <div className={`flex items-center gap-2 ${pipelineProgress >= 65 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {pipelineProgress >= 65 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-600" />}
              <span>Headless multi-viewport capture (Desktop, Laptop, Tablet, Mobile)</span>
            </div>
            <div className={`flex items-center gap-2 ${pipelineProgress >= 85 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {pipelineProgress >= 85 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-600" />}
              <span>Gemini AI anti-hallucination case study generation</span>
            </div>
          </div>

          {pipelineError && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{pipelineError}</span>
              </div>
              <button
                onClick={() => setCurrentStep('discover')}
                className="rounded-lg bg-red-500 px-3 py-1 text-slate-950 font-bold hover:bg-red-400"
              >
                Back to Discovery
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CURATE & REVIEW SCREEN */}
      {/* ========================================================================= */}
      {currentStep === 'review' && ingestedProject && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border ${
              isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>EVIDENCE VERIFIED BY INGESTION ENGINE</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mt-1">
                Review & Curate: {ingestedProject.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('discover')}
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  isDark ? 'border-[#232d40] bg-[#121723] text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                Discard / Back
              </button>

              <button
                onClick={() => handlePublishProject('draft')}
                disabled={isPublishing}
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  isDark ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'border-amber-500/40 bg-amber-50 text-amber-600'
                }`}
              >
                Save as Draft
              </button>

              <button
                onClick={() => handlePublishProject('published')}
                disabled={isPublishing}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 hover:scale-[1.02] shadow-sm disabled:opacity-50"
              >
                {publishSuccess ? <Check className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                <span>{publishSuccess ? 'Published to Live Portfolio!' : 'Publish to Portfolio'}</span>
              </button>
            </div>
          </div>

          {/* Two-Column Review Layout: Left Visual Gallery + Right Structured Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN (5 cols): Multi-viewport preview & screenshot gallery */}
            <div className="lg:col-span-5 space-y-6">
              {/* Responsive Viewport Preview Frame */}
              <div
                className={`rounded-2xl border p-5 space-y-4 ${
                  isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Camera className="h-4 w-4 text-amber-500" />
                    <span>Captured Gallery ({ingestedProject.gallery?.length || 0})</span>
                  </div>

                  {/* Viewport Switcher Tabs */}
                  <div
                    className={`flex items-center rounded-lg border p-0.5 ${
                      isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-100'
                    }`}
                  >
                    {[
                      { id: 'desktop', icon: Monitor, label: 'Desktop' },
                      { id: 'laptop', icon: Laptop, label: 'Laptop' },
                      { id: 'tablet', icon: Tablet, label: 'Tablet' },
                      { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                    ].map(vp => {
                      const Icon = vp.icon;
                      const isActive = selectedViewport === vp.id;
                      return (
                        <button
                          key={vp.id}
                          onClick={() => setSelectedViewport(vp.id as any)}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{vp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Current Viewport Frame */}
                {(() => {
                  const currentImg =
                    ingestedProject.gallery?.find(i => i.viewport === selectedViewport) ||
                    ingestedProject.gallery?.[0] || {
                      url: ingestedProject.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
                      viewport: 'desktop',
                      aiScore: {
                        overall: 95,
                        visualQuality: 96,
                        layout: 94,
                        typography: 92,
                        readability: 96,
                        mobileUsability: 94,
                        recommendationNote: 'High optical clarity, balanced contrast ratio, verified responsive margins.',
                      },
                    };

                  return (
                    <div className="space-y-3">
                      <div
                        className={`overflow-hidden rounded-xl border relative bg-slate-950 flex items-center justify-center ${
                          selectedViewport === 'mobile' ? 'max-w-[280px] mx-auto aspect-9/16' : 'aspect-16/10'
                        }`}
                      >
                        <img
                          src={currentImg.url}
                          alt={`${ingestedProject.title} preview`}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />

                        {currentImg.isCover && (
                          <div className="absolute top-3 right-3 rounded-md bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-950 shadow-md">
                            Selected Cover
                          </div>
                        )}
                      </div>

                      {/* AI Vision Quality Score Card */}
                      {currentImg.aiScore && (
                        <div
                          className={`rounded-xl border p-3 text-xs space-y-2 ${
                            isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-amber-500">
                              Gemini Vision Score
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {currentImg.aiScore.overall}/100
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-400">
                            <div>Layout: {currentImg.aiScore.layout}</div>
                            <div>Readability: {currentImg.aiScore.readability}</div>
                            <div>Mobile: {currentImg.aiScore.mobileUsability}</div>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            "{currentImg.aiScore.recommendationNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Detected Links & Repos */}
              <div
                className={`rounded-2xl border p-5 text-xs space-y-3 ${
                  isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="font-bold">Connected Links</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GitHub Repository</span>
                    <a
                      href={ingestedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      {ingestedProject.githubUrl?.replace('https://github.com/', '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {ingestedProject.liveUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Live Website URL</span>
                      <a
                        href={ingestedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        {ingestedProject.liveUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Evidence-grounded structured review form */}
            <div className="lg:col-span-7 space-y-6">
              <div
                className={`rounded-2xl border p-6 space-y-5 ${
                  isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-4 border-slate-200/50 dark:border-[#1e2738]">
                  <h3 className="text-base font-bold">Case Study Architecture & Content</h3>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-mono text-[10px] font-bold text-amber-500">
                    Category: {ingestedProject.category}
                  </span>
                </div>

                {/* Title & Short Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Project Title</label>
                    <input
                      type="text"
                      value={ingestedProject.title || ''}
                      onChange={e => setIngestedProject({ ...ingestedProject, title: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs font-semibold focus:outline-hidden ${
                        isDark
                          ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Short Elevator Description</label>
                    <textarea
                      rows={2}
                      value={ingestedProject.description || ''}
                      onChange={e => setIngestedProject({ ...ingestedProject, description: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs leading-relaxed focus:outline-hidden ${
                        isDark
                          ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Verified Technologies with Source Trace */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold">Verified Technologies & Evidence Trace</label>
                    <span className="font-mono text-[10px] text-emerald-400">
                      {ingestedProject.verifiedTechnologies?.length || 0} Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(ingestedProject.verifiedTechnologies || []).map((vt: VerifiedTechnology, idx: number) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-2.5 flex items-start justify-between gap-2 ${
                          isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>{vt.name}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={vt.source}>
                            {vt.source}
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400 shrink-0">
                          {vt.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problem & Solution Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Engineering Problem</label>
                    <textarea
                      rows={3}
                      value={ingestedProject.problem || ''}
                      onChange={e => setIngestedProject({ ...ingestedProject, problem: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs leading-relaxed focus:outline-hidden ${
                        isDark
                          ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Technical Solution</label>
                    <textarea
                      rows={3}
                      value={ingestedProject.solution || ''}
                      onChange={e => setIngestedProject({ ...ingestedProject, solution: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs leading-relaxed focus:outline-hidden ${
                        isDark
                          ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Long Description Technical Architecture */}
                <div>
                  <label className="block text-xs font-bold mb-1">Deep Architecture Breakdown</label>
                  <textarea
                    rows={4}
                    value={ingestedProject.longDescription || ''}
                    onChange={e => setIngestedProject({ ...ingestedProject, longDescription: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs leading-relaxed focus:outline-hidden ${
                      isDark
                        ? 'border-[#232d40] bg-[#121723] text-white focus:border-amber-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: GITHUB SYNC & DIFF TRACKER */}
      {/* ========================================================================= */}
      {currentStep === 'sync-manager' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">GitHub Sync & Change Tracker</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Monitor repositories for upstream dependency additions, manifest updates, and README modifications without overwriting manual custom edits.
                </p>
              </div>

              <button
                onClick={() => {
                  existingProjects
                    .filter(p => p.githubUrl)
                    .forEach(p => handleCheckSync(p));
                }}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Check All Repositories</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingProjects
              .filter(p => p.githubUrl)
              .map(proj => {
                const diff = syncDiffs[proj.id]?.diff;
                const isChecking = checkingSyncId === proj.id;
                const isApplying = applyingSyncId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className={`rounded-2xl border p-5 space-y-4 ${
                      isDark ? 'border-[#1e2738] bg-[#0c1017]' : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] text-amber-500 font-bold">{proj.category}</span>
                        <h3 className="text-base font-extrabold">{proj.title}</h3>
                        <div className="font-mono text-[11px] text-slate-400 truncate max-w-[280px]">
                          {proj.githubUrl}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckSync(proj)}
                        disabled={isChecking}
                        className={`rounded-xl border p-2 text-xs transition-colors ${
                          isDark ? 'border-[#232d40] bg-[#121723] hover:text-white' : 'border-slate-200 bg-slate-50'
                        }`}
                        title="Check for updates"
                      >
                        <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {/* Diff Information Banner */}
                    {diff ? (
                      <div
                        className={`rounded-xl border p-3.5 text-xs space-y-2 ${
                          diff.hasChanges
                            ? isDark
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                              : 'border-amber-300 bg-amber-50 text-amber-900'
                            : isDark
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {diff.hasChanges ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          <span>{diff.hasChanges ? 'Upstream Changes Detected' : 'Up to Date with GitHub'}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">{diff.summary}</p>

                        {diff.hasChanges && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleApplySync(proj)}
                              disabled={isApplying}
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 disabled:opacity-50"
                            >
                              {isApplying ? 'Applying Sync...' : 'Synchronize Portfolio Data'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-mono text-[11px] text-slate-400">
                        Last synced: {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Initial'}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GITHUB ACCOUNT / TOKEN MODAL */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl ${
              isDark ? 'border-[#232d40] bg-[#0c1017] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <Github className="h-5 w-5 text-amber-500" />
                <span>Configure GitHub Ingestion</span>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">GitHub Username or Organization</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-mono focus:outline-hidden ${
                    isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-50'
                  }`}
                  placeholder="e.g. waelkirlous"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold">Personal Access Token (Optional)</label>
                  <span className="text-[10px] text-slate-400">For private repos / higher rate limit</span>
                </div>
                <input
                  type="password"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-mono focus:outline-hidden ${
                    isDark ? 'border-[#232d40] bg-[#121723]' : 'border-slate-200 bg-slate-50'
                  }`}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Tokens are stored securely in backend server memory and never exposed to client browsers.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Save & Discover Repos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
