import React, { useState } from 'react';
import { Github, Star, GitFork, ExternalLink, Terminal, Search, AlertCircle, Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface GitHubSectionProps {
  githubUrl: string;
}

export const GitHubSection: React.FC<GitHubSectionProps> = ({ githubUrl }) => {
  const [inspectUrl, setInspectUrl] = useState('https://github.com/waelkirlous/novatrack-android');
  const [inspecting, setInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const pinnedRepos = [
    {
      name: 'novatrack-android',
      description: 'Native Android fleet telemetry engine built with Kotlin, Jetpack Compose, and offline Room DB sync.',
      stars: 34,
      forks: 6,
      language: 'Kotlin',
      url: 'https://github.com/waelkirlous/novatrack-android',
    },
    {
      name: 'pulsegrid-analytics',
      description: 'Full-stack distributed real-time metrics platform with React, Next.js, Express, and PostgreSQL.',
      stars: 48,
      forks: 11,
      language: 'TypeScript',
      url: 'https://github.com/waelkirlous/pulsegrid-analytics',
    },
    {
      name: 'auradoc-ai',
      description: 'Server-side document intelligence and structured schema extraction using Gemini API and TypeScript.',
      stars: 29,
      forks: 5,
      language: 'TypeScript',
      url: 'https://github.com/waelkirlous/auradoc-ai',
    },
  ];

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectUrl) return;

    setInspecting(true);
    setInspectError(null);
    setInspectResult(null);

    try {
      const data = await api.githubInspect(inspectUrl);
      setInspectResult(data);
    } catch (err: any) {
      setInspectError(err.message || 'Inspection failed');
    } finally {
      setInspecting(false);
    }
  };

  return (
    <section id="github" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
              07 / OPEN_SOURCE
            </div>
            <h2
              className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Open Source & Architectural Repositories
            </h2>
            <p
              className={`mt-3 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
              }`}
            >
              Inspect open-source code repositories, verify architecture contracts, and run real-time static codebase audits.
            </p>
          </motion.div>

          <a
            id="view-full-github-profile-link"
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-mono font-medium transition-all ${
              isDark
                ? 'border-white/[0.08] bg-[#111316] text-[#F5F5F5] hover:border-white/[0.2] hover:bg-[#17191D]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <Github className="h-4 w-4 text-[#00A3FF]" />
            <span>github.com/waelkirlous</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </a>
        </div>

        {/* Pinned Repositories Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pinnedRepos.map((repo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 font-mono text-xs font-semibold ${
                      isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                    }`}
                  >
                    <Github className="h-3.5 w-3.5 text-[#00A3FF]" />
                    <span>{repo.name}</span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold border ${
                      isDark
                        ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                        : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                    }`}
                  >
                    {repo.language}
                  </span>
                </div>

                <p
                  className={`mt-3 text-xs leading-relaxed ${
                    isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                  }`}
                >
                  {repo.description}
                </p>
              </div>

              <div
                className={`mt-6 flex items-center justify-between border-t pt-3.5 font-mono text-[11px] ${
                  isDark
                    ? 'border-white/[0.06] text-[#71717A]'
                    : 'border-slate-100 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-[#00A3FF]" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks}
                  </span>
                </div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A3FF] hover:text-[#38BDF8] font-semibold transition-colors"
                >
                  View Code →
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive GitHub Repository Inspector Tool */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`mt-10 rounded-2xl border p-6 sm:p-7 transition-colors ${
            isDark
              ? 'border-white/[0.08] bg-[#111316]'
              : 'border-slate-200 bg-white shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#00A3FF]">
            <Terminal className="h-4 w-4" />
            <span>PUBLIC_REPO_INSPECTION_TOOL</span>
          </div>

          <h3
            className={`mt-2 font-sans text-xl font-bold ${
              isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
            }`}
          >
            Inspect Any Public Repository Architecture
          </h3>
          <p
            className={`mt-1 text-xs ${
              isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
            }`}
          >
            Extracts framework configuration, detects verified dependencies, and generates structured architectural summaries.
          </p>

          <form onSubmit={handleInspect} className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                id="github-inspect-input"
                type="url"
                value={inspectUrl}
                onChange={e => setInspectUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                required
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono focus:border-[#00A3FF] focus:outline-none transition-colors ${
                  isDark
                    ? 'border-white/[0.08] bg-[#0B0C0E] text-white placeholder-slate-600'
                    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <button
              id="github-inspect-submit-btn"
              type="submit"
              disabled={inspecting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0092E6] disabled:opacity-50"
            >
              {inspecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Inspecting Architecture...</span>
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span>Inspect Repository</span>
                </>
              )}
            </button>
          </form>

          {inspectError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{inspectError}</span>
            </div>
          )}

          {inspectResult && (
            <div
              className={`mt-6 rounded-xl border p-5 text-xs ${
                isDark
                  ? 'border-white/[0.06] bg-[#0B0C0E]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex flex-wrap items-center justify-between border-b pb-3 gap-2 ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-200'
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-mono font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Github className="h-3.5 w-3.5 text-[#00A3FF]" />
                  <span>
                    {inspectResult.repository.owner}/{inspectResult.repository.name}
                  </span>
                </div>
                <span className="rounded-md bg-[#00A3FF]/15 border border-[#00A3FF]/30 px-2.5 py-0.5 font-mono text-[10px] text-[#00A3FF] font-semibold">
                  {inspectResult.repository.detectedFramework}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="font-mono text-[#00A3FF] font-medium block mb-1 text-[11px]">
                    AI Architectural Summary:
                  </span>
                  <p
                    className={`leading-relaxed ${
                      isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                    }`}
                  >
                    {inspectResult.aiStructured?.longDescription ||
                      inspectResult.aiStructured?.description}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-emerald-400 font-medium block mb-1 text-[11px]">
                    Detected Verified Technologies:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {inspectResult.aiStructured?.verifiedTechnologies?.map(
                      (t: any, i: number) => (
                        <span
                          key={i}
                          className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                            isDark
                              ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA]'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          {t.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
