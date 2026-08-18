import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  FileCode,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { Project, PortfolioOptimizationResult } from '../../types';
import { api } from '../../lib/api';

interface AdminAiStudioProps {
  projects: Project[];
  onRefreshProjects: () => void;
  onSelectProjectToEdit: (project: Project) => void;
}

export const AdminAiStudio: React.FC<AdminAiStudioProps> = ({
  projects,
  onRefreshProjects,
  onSelectProjectToEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'optimizer' | 'audit'>('optimizer');

  // AI Import State
  const [importInput, setImportInput] = useState({
    title: '',
    url: '',
    githubUrl: '',
    description: '',
    manifest: '',
  });
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Portfolio Optimizer State
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<PortfolioOptimizationResult | null>(null);
  const [optimizerError, setOptimizerError] = useState<string | null>(null);

  // Single Project Audit State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);

    try {
      const data = await api.aiAnalyzeProject({
        title: importInput.title,
        url: importInput.url,
        githubUrl: importInput.githubUrl,
        description: importInput.description,
        readme: importInput.manifest,
      });
      setImportResult(data);
    } catch (err: any) {
      setImportError(err.message || 'AI extraction failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleCreateFromImport = async () => {
    if (!importResult) return;
    setImportLoading(true);
    try {
      const newProj = await api.createProject({
        title: importResult.title || 'AI Extracted Project',
        description: importResult.description || '',
        longDescription: importResult.longDescription || importResult.description || '',
        problem: importResult.problem || '',
        solution: importResult.solution || '',
        features: importResult.features || [],
        category: importResult.category || 'Full Stack',
        platform: importResult.platform || 'Web',
        technologies: importResult.technologies || ['TypeScript', 'React'],
        verifiedTechnologies: importResult.verifiedTechnologies || [],
        engineeringHighlights: importResult.engineeringHighlights || [],
        challenges: importResult.challenges || [],
        githubUrl: importInput.githubUrl || '',
        liveUrl: importInput.url || '',
        status: 'published',
        featured: true,
        autoCaptureScreenshots: Boolean(importInput.url),
      });

      alert(`Successfully created project "${newProj.title}"!`);
      onRefreshProjects();
      setImportResult(null);
      setImportInput({ title: '', url: '', githubUrl: '', description: '', manifest: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create project from AI output');
    } finally {
      setImportLoading(false);
    }
  };

  const handleRunOptimizer = async () => {
    setOptimizerLoading(true);
    setOptimizerError(null);
    try {
      const res = await api.aiOptimizePortfolio();
      setOptimizationResult(res);
    } catch (err: any) {
      setOptimizerError(err.message || 'Failed to run optimization analysis');
    } finally {
      setOptimizerLoading(false);
    }
  };

  const handleRunSingleAudit = async () => {
    if (!selectedProjectId) return;
    setAuditLoading(true);
    try {
      const updated = await api.auditProject(selectedProjectId);
      setAuditResult(updated.aiAudit);
      onRefreshProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to run project audit');
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div id="admin-ai-studio-tab" className="space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-[#263348] bg-[#0c1018] p-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>GEMINI_AI_STUDIO_ENGINE</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white">
            AI Project Analysis & Portfolio Optimization
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Deep Gemini intelligence for schema generation, SSRF-safe project extraction, and architectural auditing.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-[#232e42] bg-[#101522] p-1">
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'optimizer'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portfolio Optimizer
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'import'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Project Import Pipeline
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Case Study Audits
          </button>
        </div>
      </div>

      {/* Tab 1: Portfolio Optimizer */}
      {activeTab === 'optimizer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-[#202738] bg-[#0c1017] p-5">
            <div>
              <h3 className="text-base font-bold text-white">Holistic Portfolio Evaluation</h3>
              <p className="text-xs text-slate-400">
                Audits all {projects.length} project case studies against senior developer standards (Android & Full-Stack balance)
              </p>
            </div>
            <button
              id="run-portfolio-optimizer-btn"
              onClick={handleRunOptimizer}
              disabled={optimizerLoading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {optimizerLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating Portfolio Architecture...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Run AI Portfolio Optimizer</span>
                </>
              )}
            </button>
          </div>

          {optimizerError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{optimizerError}</span>
            </div>
          )}

          {optimizationResult && (
            <div className="space-y-6">
              {/* Overall Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#242f44] bg-[#0f1422] p-5 text-center">
                  <span className="font-mono text-xs text-slate-400">Portfolio Quality Score</span>
                  <div className="mt-2 font-mono text-3xl font-extrabold text-amber-400">
                    {optimizationResult.overallScore}/100
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Production Ready</span>
                </div>

                <div className="md:col-span-3 rounded-xl border border-[#202738] bg-[#0c1017] p-5 flex flex-col justify-center">
                  <span className="font-mono text-xs text-amber-400 font-semibold">Executive AI Summary</span>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {optimizationResult.summary}
                  </p>
                </div>
              </div>

              {/* Recommended Featured Project Ordering */}
              <div className="rounded-xl border border-[#202738] bg-[#0c1017] p-6">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                  RECOMMENDED FEATURED SHOWCASE ORDER & RATIONALE
                </h4>
                <div className="mt-4 space-y-3">
                  {optimizationResult.recommendedFeaturedOrder.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-[#1b2232] bg-[#0f131d] p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-[#182030] font-mono font-bold text-amber-300 text-[11px]">
                          0{idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-white">{item.title}</span>
                          <p className="text-slate-400 text-[11px] mt-0.5">{item.rationale}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Missing Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[#202738] bg-[#0c1017] p-6">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
                    VERIFIED ARCHITECTURAL STRENGTHS
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {optimizationResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#202738] bg-[#0c1017] p-6">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                    SUGGESTED HIGH-IMPACT TOPICS TO EXPAND
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {optimizationResult.missingTopics.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Project Import Pipeline */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#202738] bg-[#0c1017] p-6">
            <h3 className="text-base font-bold text-white">AI Project Extraction & Structuring</h3>
            <p className="mt-1 text-xs text-slate-400">
              Paste a repository URL, live domain, or raw README to automatically extract problem/solution architecture, verified tech stacks, and features.
            </p>

            <form onSubmit={handleRunImport} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    Project Title (or draft name)
                  </label>
                  <input
                    type="text"
                    value={importInput.title}
                    onChange={e => setImportInput({ ...importInput, title: e.target.value })}
                    placeholder="NovaTrack Android Fleet"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    Live Demo / Web URL
                  </label>
                  <input
                    type="url"
                    value={importInput.url}
                    onChange={e => setImportInput({ ...importInput, url: e.target.value })}
                    placeholder="https://my-app.com"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    value={importInput.githubUrl}
                    onChange={e => setImportInput({ ...importInput, githubUrl: e.target.value })}
                    placeholder="https://github.com/waelkirlous/repo"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-medium text-slate-300">
                  Raw README, Build Gradle, or Architecture Notes
                </label>
                <textarea
                  rows={4}
                  value={importInput.manifest}
                  onChange={e => setImportInput({ ...importInput, manifest: e.target.value })}
                  placeholder="Paste dependencies, architecture notes, or problem statements..."
                  className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={importLoading}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting Structured Case Study...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Extraction Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {importError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importResult && (
            <div className="rounded-xl border border-[#253246] bg-[#0c1017] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#182030] pb-4">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-semibold">
                    AI EXTRACTION RESULT
                  </span>
                  <h4 className="text-xl font-bold text-white mt-1">{importResult.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {importResult.platform} • {importResult.category}
                  </p>
                </div>

                <button
                  onClick={handleCreateFromImport}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  <Check className="h-4 w-4" />
                  <span>Publish to Portfolio</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="font-mono text-amber-400 font-semibold block mb-1">
                    Problem & Friction:
                  </span>
                  <p className="text-slate-300">{importResult.problem}</p>
                </div>
                <div>
                  <span className="font-mono text-amber-400 font-semibold block mb-1">
                    Architecture & Solution:
                  </span>
                  <p className="text-slate-300">{importResult.solution}</p>
                </div>
              </div>

              <div>
                <span className="font-mono text-emerald-400 font-semibold block mb-2 text-xs">
                  Detected Verified Technologies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {importResult.technologies?.map((tech: string, i: number) => (
                    <span key={i} className="rounded border border-[#232f42] bg-[#121724] px-2.5 py-1 font-mono text-xs text-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Case Study Audits */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#202738] bg-[#0c1017] p-5">
            <div className="flex items-center gap-3">
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="rounded-lg border border-[#232e42] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.platform})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunSingleAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {auditLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auditing Case Study...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Deep Case Study Audit</span>
                </>
              )}
            </button>
          </div>

          {auditResult && (
            <div className="rounded-xl border border-[#253246] bg-[#0c1017] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#182030] pb-4">
                <h4 className="text-lg font-bold text-white">Quality Audit Report</h4>
                <span className="rounded bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  Quality Score: {auditResult.verifiedScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="font-mono text-emerald-400 font-semibold block mb-2">
                    Verified Strengths:
                  </span>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {auditResult.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-mono text-amber-400 font-semibold block mb-2">
                    UX & Readability Opportunities:
                  </span>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {auditResult.uxImprovements?.map((u: string, i: number) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
