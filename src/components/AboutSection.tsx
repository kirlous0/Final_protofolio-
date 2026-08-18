import React from 'react';
import { Smartphone, Globe, Server, Cpu, Cloud, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Profile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const technicalSummary = [
    {
      domain: 'Frontend',
      technologies: 'React, Next.js App Router, TypeScript, Tailwind CSS',
      highlight: 'Sub-second response targets, strict accessibility, and deterministic state.',
      icon: Globe,
    },
    {
      domain: 'Mobile (Android)',
      technologies: 'Kotlin, Jetpack Compose, Coroutines/Flow, Room DB',
      highlight: 'Offline-first persistence, reactive UI, battery-aware background tasks.',
      icon: Smartphone,
    },
    {
      domain: 'Backend & APIs',
      technologies: 'Node.js, Express, TypeScript, REST & Realtime',
      highlight: 'Type-safe contracts, SSRF & input security, low-latency endpoints.',
      icon: Server,
    },
    {
      domain: 'AI & Intelligence',
      technologies: 'Gemini API, Structured JSON, Multimodal Audits',
      highlight: 'Zero-hallucination verification, automated code & visual analysis.',
      icon: Cpu,
    },
    {
      domain: 'Cloud & Database',
      technologies: 'Cloud Firestore, PostgreSQL, Firebase Auth, Cloud Storage',
      highlight: 'Durable data modeling, atomic transactions, and strict security rules.',
      icon: Cloud,
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: ABOUT Eyebrow & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4"
          >
            <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
              01 / ABOUT
            </div>
            <h2
              className={`mt-3 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Engineering with precision and intent.
            </h2>
            <p
              className={`mt-4 text-sm leading-relaxed ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
              }`}
            >
              Focusing on the intersection of native mobile performance and scalable web architectures.
            </p>
          </motion.div>

          {/* Right Column: Concise Bio & Technical Summary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Concise Bio */}
            <div
              className={`rounded-2xl border p-6 sm:p-7 transition-colors ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316]/80'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <p
                className={`text-base leading-relaxed sm:text-lg font-normal ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                {profile.bio ||
                  'I specialize in building durable digital products from the ground up. Whether engineering battery-aware Android applications with Jetpack Compose or scalable full-stack web platforms with Next.js and Cloud Firestore, I prioritize maintainable architectures, measured performance, and clean design.'}
              </p>
            </div>

            {/* Technical Summary List */}
            <div className="space-y-3">
              <div
                className={`font-mono text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#71717A]' : 'text-slate-500'
                }`}
              >
                Core Technical Domains
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {technicalSummary.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2 }}
                      className={`group rounded-xl border p-4 transition-all duration-200 ${
                        isDark
                          ? 'border-white/[0.06] bg-[#111316] hover:border-white/[0.15] hover:bg-[#17191D]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                            isDark
                              ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                              : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span
                          className={`font-sans text-sm font-semibold ${
                            isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                          }`}
                        >
                          {item.domain}
                        </span>
                      </div>

                      <div
                        className={`mt-2 font-mono text-xs font-medium ${
                          isDark ? 'text-[#00A3FF]' : 'text-[#0284C7]'
                        }`}
                      >
                        {item.technologies}
                      </div>

                      <p
                        className={`mt-1.5 text-xs leading-relaxed ${
                          isDark ? 'text-[#71717A]' : 'text-slate-500'
                        }`}
                      >
                        {item.highlight}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
