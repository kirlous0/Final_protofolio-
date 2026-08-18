import React, { useState, useEffect } from 'react';
import {
  Camera,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Star,
} from 'lucide-react';
import { Project, ScreenshotJob, ProjectImage } from '../../types';
import { api } from '../../lib/api';

interface AdminScreenshotEngineProps {
  projects: Project[];
  onRefreshProjects: () => void;
}

export const AdminScreenshotEngine: React.FC<AdminScreenshotEngineProps> = ({
  projects,
  onRefreshProjects,
}) => {
  const [targetUrl, setTargetUrl] = useState('https://novatrack-fleet.app');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeJob, setActiveJob] = useState<ScreenshotJob | null>(null);
  const [jobsHistory, setJobsHistory] = useState<ScreenshotJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll active job until finished
  useEffect(() => {
    let timer: any = null;
    if (activeJob && (activeJob.status === 'queued' || activeJob.status === 'validating' || activeJob.status === 'connecting' || activeJob.status === 'capturing' || activeJob.status === 'optimizing' || activeJob.status === 'analyzing')) {
      timer = setInterval(async () => {
        try {
          const updated = await api.getScreenshotJob(activeJob.id);
          setActiveJob(updated);
          if (updated.status === 'completed' || updated.status === 'failed') {
            loadJobsHistory();
            onRefreshProjects();
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeJob]);

  const loadJobsHistory = async () => {
    try {
      const history = await api.getScreenshotJobs();
      setJobsHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadJobsHistory();
  }, []);

  const handleStartCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    const project = projects.find(p => p.id === selectedProjectId);

    try {
      const res = await api.triggerScreenshotJob({
        url: targetUrl,
        projectId: selectedProjectId || undefined,
        projectTitle: project?.title || undefined,
      });

      const initialJob = await api.getScreenshotJob(res.jobId);
      setActiveJob(initialJob);
      loadJobsHistory();
    } catch (err: any) {
      setError(err.message || 'Screenshot job creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-screenshots-tab" className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#202738] bg-[#0c1017] p-6">
        <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
          <Shield className="h-4 w-4" />
          <span>AUTOMATED_SCREENSHOT_ENGINE • SSRF_HARDENED</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold text-white">
          Responsive Screenshot Automation
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Server-side multi-viewport capture engine (Desktop, Laptop, Tablet, Mobile) with SSRF DNS-rebinding protection and Gemini visual quality scoring.
        </p>

        {/* Trigger Form */}
        <form onSubmit={handleStartCapture} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <label className="block font-mono text-xs font-medium text-slate-300">
                Target Live URL (HTTPS Required)
              </label>
              <input
                id="screenshot-target-url-input"
                type="url"
                required
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 w-full rounded-lg border border-[#232d40] bg-[#121723] px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block font-mono text-xs font-medium text-slate-300">
                Assign to Project (Optional)
              </label>
              <select
                id="screenshot-project-select"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#232d40] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- No project (standalone capture) --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Viewport indicators */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1 rounded bg-[#10141e] border border-[#1e2535] px-2 py-1">
                <Monitor className="h-3 w-3 text-amber-400" /> Desktop 1440x900
              </span>
              <span className="flex items-center gap-1 rounded bg-[#10141e] border border-[#1e2535] px-2 py-1">
                <Monitor className="h-3 w-3 text-amber-400" /> Laptop 1280x800
              </span>
              <span className="flex items-center gap-1 rounded bg-[#10141e] border border-[#1e2535] px-2 py-1">
                <Tablet className="h-3 w-3 text-amber-400" /> Tablet 768x1024
              </span>
              <span className="flex items-center gap-1 rounded bg-[#10141e] border border-[#1e2535] px-2 py-1">
                <Smartphone className="h-3 w-3 text-amber-400" /> Mobile 390x844
              </span>
            </div>

            <button
              id="start-screenshot-job-btn"
              type="submit"
              disabled={loading || (activeJob && activeJob.status !== 'completed' && activeJob.status !== 'failed')}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initiating Capture...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>Capture All Viewports</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Active Job Progress View */}
      {activeJob && (
        <div className="rounded-2xl border border-[#253246] bg-[#0c1017] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-[#182030] pb-4 gap-2">
            <div>
              <span className="font-mono text-xs text-amber-400 font-semibold">ACTIVE CAPTURE JOB</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeJob.url}</h3>
              {activeJob.projectTitle && (
                <p className="text-xs text-slate-400">Assigned: {activeJob.projectTitle}</p>
              )}
            </div>

            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                activeJob.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : activeJob.status === 'failed'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
              }`}
            >
              {activeJob.status.toUpperCase()}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">{activeJob.stepName}</span>
              <span className="text-amber-400 font-bold">{activeJob.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#161c28]">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
          </div>

          {/* Captured Gallery Preview */}
          {activeJob.capturedImages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Captured Multi-Viewport Renders ({activeJob.capturedImages.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeJob.capturedImages.map(img => (
                  <div
                    key={img.id}
                    className="overflow-hidden rounded-xl border border-[#202738] bg-[#0a0d14] p-3 space-y-2"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#121622]">
                      <img src={img.url} alt={img.caption} className="h-full w-full object-cover" />
                      {img.isCover && (
                        <div className="absolute top-2 left-2 rounded bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-950">
                          AI BEST COVER
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-semibold">{img.viewport.toUpperCase()}</span>
                      <span className="text-slate-400">{img.width}x{img.height}</span>
                    </div>

                    {img.aiScore && (
                      <div className="rounded bg-[#121723] p-2 font-mono text-[10px] space-y-0.5 border border-[#1b2230]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Overall Quality:</span>
                          <span className="text-amber-400 font-bold">{img.aiScore.overall}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Readability:</span>
                          <span className="text-slate-300">{img.aiScore.readability}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Jobs History Table */}
      <div className="rounded-2xl border border-[#202738] bg-[#0c1017] p-6">
        <div className="flex items-center justify-between border-b border-[#182030] pb-4">
          <h3 className="text-base font-bold text-white">Capture History & Log</h3>
          <button
            onClick={loadJobsHistory}
            className="flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#182030]">
          {jobsHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No screenshot jobs recorded yet.
            </div>
          ) : (
            jobsHistory.map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{job.url}</span>
                  <p className="font-mono text-[11px] text-slate-500">
                    {new Date(job.createdAt).toLocaleDateString()} at{' '}
                    {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {job.capturedImages.length} viewports
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      job.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : job.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
