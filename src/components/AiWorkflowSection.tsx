import React from 'react';
import { Cpu, Camera, CheckCircle2, ShieldCheck, Sparkles, FileCode, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const AiWorkflowSection: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const pipelineStages = [
    {
      title: 'Repository & Code Ingestion',
      icon: FileCode,
      tech: 'AST Parser & Dependency Inspector',
      desc: 'Parses `package.json`, Gradle files, and project structures to extract verified libraries and architecture patterns with zero assumptions.',
    },
    {
      title: 'Automated Multi-Viewport Capture',
      icon: Camera,
      tech: 'Playwright & Chromium Engine',
      desc: 'Captures deterministic screenshots across Desktop (1440x900), Laptop, Tablet, and Mobile viewports with full asset synchronization.',
    },
    {
      title: 'Gemini Multimodal Quality Audit',
      icon: Sparkles,
      tech: 'Gemini 2.5 Flash Multimodal',
      desc: 'Evaluates layout balance, color contrast, typography scale, and responsive compliance, returning structured scores and concrete recommendations.',
    },
    {
      title: 'Durable Firestore State',
      icon: ShieldCheck,
      tech: 'Firebase Auth & Cloud Firestore',
      desc: 'Stores audited metadata, gallery viewports, and technical highlights in an atomic document database backed by strict security rules.',
    },
  ];

  return (
    <section id="workflow" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading & Concept */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5"
          >
            <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
              06 / INTELLIGENT_PIPELINE
            </div>
            <h2
              className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Automated AI Inspection & Verification
            </h2>
            <p
              className={`mt-4 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
              }`}
            >
              This portfolio platform runs an autonomous verification pipeline: when new projects or repositories are submitted, it audits source code, captures multi-device viewports, and performs Gemini multimodal analysis.
            </p>

            <div
              className={`mt-6 rounded-xl border p-4 font-mono text-xs ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA]'
                  : 'border-slate-200 bg-white text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-[#00A3FF] font-semibold">
                <Cpu className="h-4 w-4" />
                <span>SERVER_SIDE_GEMINI_PIPELINE</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Guaranteed schema adherence via TypeChat & Zod contracts. No unstructured hallucinations.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Pipeline Stages */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-7 space-y-3.5"
          >
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          isDark
                            ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                            : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3
                        className={`font-sans text-sm font-bold ${
                          isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                        }`}
                      >
                        {stage.title}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-[#00A3FF]">
                      0{idx + 1}
                    </span>
                  </div>

                  <div
                    className={`mt-2 font-mono text-[11px] font-medium ${
                      isDark ? 'text-[#00A3FF]' : 'text-[#0284C7]'
                    }`}
                  >
                    {stage.tech}
                  </div>

                  <p
                    className={`mt-1.5 text-xs leading-relaxed ${
                      isDark ? 'text-[#71717A]' : 'text-slate-600'
                    }`}
                  >
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
