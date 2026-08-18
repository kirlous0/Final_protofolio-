import React, { useState } from 'react';
import { ExternalLink, Github, ArrowRight, Smartphone, Globe, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onSelectProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const categories = ['all', 'Android', 'Full Stack', 'AI & Cloud', 'Web'];

  const publishedProjects = projects.filter(p => p.status === 'published');

  const filteredProjects =
    selectedCategory === 'all'
      ? publishedProjects
      : publishedProjects.filter(p => p.category === selectedCategory);

  // Find dominant featured project (or first project)
  const featuredProject =
    filteredProjects.find(p => p.featured) || filteredProjects[0];
  const otherProjects = filteredProjects.filter(
    p => p.id !== featuredProject?.id
  );

  return (
    <section id="projects" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
              02 / SELECTED_WORK
            </div>
            <h2
              className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Featured Systems & Case Studies
            </h2>
            <p
              className={`mt-3 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
              }`}
            >
              Production-grade applications engineered with verified architecture, clean domain isolation, and real performance metrics.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <div
            className={`flex flex-wrap gap-1 rounded-xl p-1 border transition-colors ${
              isDark
                ? 'border-white/[0.08] bg-[#111316]'
                : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`project-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative rounded-lg px-3 py-1 text-xs font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00A3FF] ${
                    isSelected
                      ? isDark
                        ? 'text-[#F5F5F5] font-semibold'
                        : 'text-slate-950 font-semibold'
                      : isDark
                      ? 'text-[#71717A] hover:text-[#F5F5F5]'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeProjectFilterPill"
                      className={`absolute inset-0 rounded-lg ${
                        isDark ? 'bg-[#17191D] border border-white/[0.1]' : 'bg-slate-100 border border-slate-200'
                      }`}
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat === 'all' ? 'All Projects' : cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Layout: Dominant Featured + Grid */}
        <div className="mt-12 space-y-8">
          {/* Dominant Featured Project (Large 2-Column) */}
          {featuredProject && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              id={`featured-project-${featuredProject.slug}`}
              className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Large Dominant Image Frame */}
                <div
                  className={`relative lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-slate-100'
                  }`}
                >
                  <img
                    src={featuredProject.coverImage}
                    alt={featuredProject.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
                      isDark ? 'from-[#111316] lg:hidden' : 'from-white lg:hidden'
                    }`}
                  />
                  {/* Category Pill Overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md ${
                        isDark
                          ? 'border-white/[0.12] bg-[#0B0C0E]/90 text-[#00A3FF]'
                          : 'border-slate-200 bg-white/90 text-[#0284C7]'
                      }`}
                    >
                      {featuredProject.platform === 'Android' ? (
                        <Smartphone className="h-3 w-3" />
                      ) : (
                        <Globe className="h-3 w-3" />
                      )}
                      <span>{featuredProject.platform}</span>
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-1 font-mono text-[10px] font-medium backdrop-blur-md ${
                        isDark
                          ? 'border-white/[0.1] bg-[#0B0C0E]/90 text-[#A1A1AA]'
                          : 'border-slate-200 bg-white/90 text-slate-700'
                      }`}
                    >
                      {featuredProject.category}
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-semibold text-[#00A3FF] uppercase tracking-wider">
                      Featured Case Study
                    </div>
                    <h3
                      className={`mt-2 font-sans text-2xl sm:text-3xl font-bold tracking-tight transition-colors ${
                        isDark ? 'text-[#F5F5F5] group-hover:text-white' : 'text-slate-900'
                      }`}
                    >
                      {featuredProject.title}
                    </h3>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                      }`}
                    >
                      {featuredProject.description}
                    </p>

                    {/* Problem / Solution Preview */}
                    <div
                      className={`mt-4 rounded-xl border p-3.5 text-xs ${
                        isDark
                          ? 'border-white/[0.06] bg-[#0B0C0E]/80'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-semibold text-[#00A3FF] block mb-1 uppercase">
                        Architecture Focus:
                      </span>
                      <p
                        className={`line-clamp-2 leading-relaxed ${
                          isDark ? 'text-[#71717A]' : 'text-slate-600'
                        }`}
                      >
                        {featuredProject.solution || featuredProject.problem}
                      </p>
                    </div>

                    {/* Technology Stack Tags */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {featuredProject.technologies.slice(0, 5).map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                            isDark
                              ? 'border-white/[0.08] bg-[#17191D] text-[#A1A1AA]'
                              : 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(featuredProject.slug)}
                      className="group/btn flex items-center gap-1.5 text-xs font-semibold text-[#00A3FF] transition-colors hover:text-[#38BDF8]"
                    >
                      <span>View Case Study</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </button>

                    <div className="flex items-center gap-3">
                      {featuredProject.githubUrl && (
                        <a
                          href={featuredProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-md transition-colors ${
                            isDark ? 'text-[#71717A] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                          }`}
                          title="GitHub Repository"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {featuredProject.liveUrl && (
                        <a
                          href={featuredProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-md transition-colors ${
                            isDark ? 'text-[#71717A] hover:text-[#00A3FF]' : 'text-slate-500 hover:text-[#0284C7]'
                          }`}
                          title="Live Demo"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Secondary Projects Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {otherProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  id={`project-card-${project.slug}`}
                  className={`group flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Project Image Frame */}
                    <div
                      className={`relative aspect-[16/9] w-full overflow-hidden ${
                        isDark ? 'bg-[#0B0C0E]' : 'bg-slate-100'
                      }`}
                    >
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
                          isDark ? 'from-[#111316] opacity-70' : 'from-white opacity-40'
                        }`}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold backdrop-blur-md ${
                            isDark
                              ? 'border-white/[0.12] bg-[#0B0C0E]/90 text-[#00A3FF]'
                              : 'border-slate-200 bg-white/90 text-[#0284C7]'
                          }`}
                        >
                          {project.platform}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium backdrop-blur-md ${
                            isDark
                              ? 'border-white/[0.08] bg-[#0B0C0E]/90 text-[#A1A1AA]'
                              : 'border-slate-200 bg-white/90 text-slate-700'
                          }`}
                        >
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <h3
                        className={`font-sans text-xl font-bold tracking-tight transition-colors ${
                          isDark ? 'text-[#F5F5F5] group-hover:text-white' : 'text-slate-900'
                        }`}
                      >
                        {project.title}
                      </h3>

                      <p
                        className={`mt-2 text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                        }`}
                      >
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                              isDark
                                ? 'border-white/[0.06] bg-[#17191D] text-[#71717A]'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span
                            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                              isDark
                                ? 'border-white/[0.06] bg-[#17191D] text-[#71717A]'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    className={`flex items-center justify-between border-t px-5 py-3.5 sm:px-6 ${
                      isDark ? 'border-white/[0.06] bg-[#0B0C0E]/50' : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <button
                      onClick={() => onSelectProject(project.slug)}
                      className="group/link flex items-center gap-1 text-xs font-semibold text-[#00A3FF] transition-colors hover:text-[#38BDF8]"
                    >
                      <span>Case Study</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                    </button>

                    <div className="flex items-center gap-2.5">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-colors ${
                            isDark ? 'text-[#71717A] hover:text-white' : 'text-slate-400 hover:text-slate-900'
                          }`}
                          title="GitHub Repository"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-colors ${
                            isDark ? 'text-[#71717A] hover:text-[#00A3FF]' : 'text-slate-400 hover:text-[#0284C7]'
                          }`}
                          title="Live Demo"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
