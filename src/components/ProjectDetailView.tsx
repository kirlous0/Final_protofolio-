import React, { useState } from 'react';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Monitor,
  Maximize2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ProjectImage } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ProjectDetailViewProps {
  project: Project;
  allProjects: Project[];
  onBack: () => void;
  onSelectProject: (slug: string) => void;
  onContact: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  allProjects,
  onBack,
  onSelectProject,
  onContact,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const activeImage: ProjectImage | undefined =
    project.gallery[activeImageIndex] ||
    (project.coverImage
      ? {
          id: 'cover',
          url: project.coverImage,
          viewport: 'desktop',
          width: 1440,
          height: 900,
          caption: `${project.title} Primary Viewport`,
          isCover: true,
        }
      : undefined);

  const relatedProjects = allProjects
    .filter(
      p =>
        p.id !== project.id &&
        (p.category === project.category || p.platform === project.platform)
    )
    .slice(0, 2);

  return (
    <motion.div
      id="project-detail-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen py-8 sm:py-14 relative z-10"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb Action Bar */}
        <div
          className={`flex items-center justify-between border-b pb-5 ${
            isDark ? 'border-white/[0.08]' : 'border-slate-200'
          }`}
        >
          <button
            id="back-to-projects-btn"
            onClick={onBack}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-tight transition-all ${
              isDark
                ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:border-white/[0.2] hover:text-[#F5F5F5] hover:bg-[#17191D]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-2.5">
            {project.githubUrl && (
              <a
                id="project-github-link"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:text-[#F5F5F5] hover:border-white/[0.2]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Github className="h-3.5 w-3.5" />
                <span>Source</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                id="project-live-link"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A3FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0092E6]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Project Header */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                isDark
                  ? 'border-white/[0.12] bg-[#111316] text-[#00A3FF]'
                  : 'border-slate-200 bg-slate-100 text-[#0284C7]'
              }`}
            >
              {project.platform === 'Android' ? (
                <Smartphone className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
              <span>{project.platform}</span>
            </span>
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-medium ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA]'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {project.category}
            </span>
            {project.featured && (
              <span className="rounded-md bg-[#00A3FF]/15 border border-[#00A3FF]/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00A3FF]">
                Featured Project
              </span>
            )}
          </div>

          <h1
            className={`mt-4 font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight transition-colors ${
              isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
            }`}
          >
            {project.title}
          </h1>

          <p
            className={`mt-4 text-base sm:text-lg leading-relaxed max-w-3xl ${
              isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
            }`}
          >
            {project.description}
          </p>
        </div>

        {/* Screenshot Gallery with Viewport Switcher & Zoom */}
        <div
          className={`mt-10 overflow-hidden rounded-2xl border transition-colors ${
            isDark
              ? 'border-white/[0.08] bg-[#111316]'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          {/* Top Switcher Bar */}
          <div
            className={`flex flex-wrap items-center justify-between border-b px-4 py-3 sm:px-6 ${
              isDark ? 'border-white/[0.06] bg-[#0B0C0E]/70' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-xs">
              <Monitor className="h-3.5 w-3.5 text-[#00A3FF]" />
              <span
                className={`font-semibold ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                Multi-Viewport Capture ({project.gallery.length || 1})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {project.gallery.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {project.gallery.map((img, idx) => (
                    <button
                      key={img.id}
                      id={`gallery-tab-${idx}`}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition-all ${
                        activeImageIndex === idx
                          ? 'bg-[#00A3FF] text-white font-semibold shadow-xs'
                          : isDark
                          ? 'border border-white/[0.06] bg-[#17191D] text-[#A1A1AA] hover:text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {img.viewport.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setZoomModalOpen(true)}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  isDark
                    ? 'border-white/[0.08] text-[#A1A1AA] hover:text-white hover:bg-[#17191D]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Fullscreen Preview"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Active Image Display */}
          {activeImage && (
            <div
              className={`relative aspect-[16/9] w-full overflow-hidden flex items-center justify-center cursor-zoom-in ${
                isDark ? 'bg-[#0B0C0E]' : 'bg-slate-100'
              }`}
              onClick={() => setZoomModalOpen(true)}
            >
              <img
                src={activeImage.url}
                alt={activeImage.caption || project.title}
                className="max-h-full max-w-full object-contain"
              />
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                  isDark
                    ? 'from-[#0B0C0E] via-[#0B0C0E]/70 to-transparent'
                    : 'from-white via-white/70 to-transparent'
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                    }`}
                  >
                    {activeImage.caption}
                  </p>
                  <p
                    className={`font-mono text-[10px] mt-0.5 ${
                      isDark ? 'text-[#71717A]' : 'text-slate-500'
                    }`}
                  >
                    Viewport: {activeImage.viewport} ({activeImage.width}x
                    {activeImage.height})
                  </p>
                </div>

                {activeImage.aiScore && (
                  <div
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] backdrop-blur-md ${
                      isDark
                        ? 'border-white/[0.08] bg-[#111316]/90 text-[#A1A1AA]'
                        : 'border-slate-200 bg-white/90 text-slate-700'
                    }`}
                  >
                    <span className="text-[#00A3FF] font-semibold">
                      AI Visual Score: {activeImage.aiScore.overall}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Case Study Content Grid */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* The Engineering Problem */}
            <section
              className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
                THE CHALLENGE
              </div>
              <h2
                className={`mt-2 font-sans text-xl font-bold ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                The Engineering Problem
              </h2>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                }`}
              >
                {project.problem}
              </p>
            </section>

            {/* Architecture & Solution */}
            <section
              className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
                SYSTEM DESIGN
              </div>
              <h2
                className={`mt-2 font-sans text-xl font-bold ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                Architecture & Technical Solution
              </h2>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                }`}
              >
                {project.solution}
              </p>
              {project.longDescription && (
                <div
                  className={`mt-4 border-t pt-4 text-xs leading-relaxed ${
                    isDark ? 'border-white/[0.06] text-[#71717A]' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  {project.longDescription}
                </div>
              )}
            </section>

            {/* Key Features */}
            {project.features.length > 0 && (
              <section
                className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                  isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
                  VERIFIED CAPABILITIES
                </div>
                <h2
                  className={`mt-2 font-sans text-xl font-bold ${
                    isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                  }`}
                >
                  Key Capabilities
                </h2>
                <div className="mt-4 space-y-2.5">
                  {project.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A3FF] mt-0.5" />
                      <span
                        className={`text-xs leading-relaxed ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Engineering Highlights */}
            {project.engineeringHighlights.length > 0 && (
              <section
                className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                  isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
                  IMPLEMENTATION DEPTH
                </div>
                <h2
                  className={`mt-2 font-sans text-xl font-bold ${
                    isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                  }`}
                >
                  Engineering Highlights
                </h2>
                <div className="mt-4 space-y-2.5">
                  {project.engineeringHighlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2.5">
                      <Cpu className="h-4 w-4 shrink-0 text-[#00A3FF] mt-0.5" />
                      <span
                        className={`text-xs leading-relaxed ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Quality Audit */}
            {project.aiAudit && (
              <section
                className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                  isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00A3FF]" />
                    <h2
                      className={`font-sans text-base font-bold ${
                        isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                      }`}
                    >
                      AI Quality & Architecture Audit
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#00A3FF]">
                    Score: {project.aiAudit.verifiedScore}/100
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-mono text-[#00A3FF] font-medium block mb-1.5">
                      Verified Strengths:
                    </span>
                    <ul
                      className={`space-y-1 list-disc list-inside ${
                        isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                      }`}
                    >
                      {project.aiAudit.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-mono text-[#71717A] font-medium block mb-1.5">
                      Accessibility & UX:
                    </span>
                    <ul
                      className={`space-y-1 list-disc list-inside ${
                        isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                      }`}
                    >
                      {project.aiAudit.accessibilityNotes.map((acc, aIdx) => (
                        <li key={aIdx}>{acc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tech Stack Specs */}
            <div
              className={`rounded-2xl border p-5 transition-colors ${
                isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00A3FF]">
                VERIFIED TECH STACK
              </h3>
              <div className="mt-3 space-y-1.5">
                {project.technologies.map((t, tIdx) => (
                  <div
                    key={tIdx}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                      isDark
                        ? 'border-white/[0.06] bg-[#0B0C0E]/80'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                      }`}
                    >
                      {t}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-500">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Notes */}
            {project.architectureNotes && (
              <div
                className={`rounded-2xl border p-5 transition-colors ${
                  isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00A3FF]">
                  ARCHITECTURE NOTES
                </h3>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                  }`}
                >
                  {project.architectureNotes}
                </p>
              </div>
            )}

            {/* Direct Project Discussion Box */}
            <div
              className={`rounded-2xl border p-5 text-center transition-colors ${
                isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <h3
                className={`font-sans text-sm font-bold ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                Need Similar Architecture?
              </h3>
              <p
                className={`mt-1.5 text-xs leading-relaxed ${
                  isDark ? 'text-[#71717A]' : 'text-slate-600'
                }`}
              >
                Let's discuss building your native Android app or scalable web platform.
              </p>
              <button
                onClick={onContact}
                className="mt-4 w-full rounded-xl bg-[#00A3FF] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0092E6] transition-colors"
              >
                Discuss This Project
              </button>
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div
            className={`mt-16 border-t pt-10 ${
              isDark ? 'border-white/[0.08]' : 'border-slate-200'
            }`}
          >
            <h2
              className={`font-sans text-xl font-bold ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Related Case Studies
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedProjects.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProject(rel.slug)}
                  className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <span className="font-mono text-[10px] font-semibold text-[#00A3FF]">
                    {rel.platform} • {rel.category}
                  </span>
                  <h3
                    className={`mt-1 font-sans text-base font-bold transition-colors ${
                      isDark ? 'text-[#F5F5F5] group-hover:text-white' : 'text-slate-900'
                    }`}
                  >
                    {rel.title}
                  </h3>
                  <p
                    className={`mt-1 line-clamp-2 text-xs ${
                      isDark ? 'text-[#71717A]' : 'text-slate-500'
                    }`}
                  >
                    {rel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {zoomModalOpen && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setZoomModalOpen(false)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <button
                onClick={() => setZoomModalOpen(false)}
                className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close fullscreen image"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={activeImage.url}
                alt={activeImage.caption || project.title}
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
