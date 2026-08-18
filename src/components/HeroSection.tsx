import React from 'react';
import { ArrowRight, ArrowUpRight, Terminal, Smartphone, Globe, Code2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Profile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { SystemMapVisual } from './SystemMapVisual';

interface HeroSectionProps {
  profile: Profile;
  onViewProjects: () => void;
  onContact: () => void;
  onOpenControlCenter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  onViewProjects,
  onContact,
  onOpenControlCenter,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Main Hero Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7"
          >
            {/* Small Eyebrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A3FF]" />
              <span>FULL STACK DEVELOPER / ANDROID DEVELOPER</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className={`mt-4 font-sans text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              {profile.name}
            </motion.h1>

            {/* Strong Statement */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`mt-4 font-sans text-xl sm:text-2xl font-normal leading-snug tracking-tight transition-colors ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
              }`}
            >
              I build fast, intelligent digital products with modern web and mobile technologies.
            </motion.p>

            {/* Short Technical Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className={`mt-3 max-w-xl text-sm leading-relaxed ${
                isDark ? 'text-[#71717A]' : 'text-slate-600'
              }`}
            >
              Architecting native Android Kotlin/Compose applications, sub-second Next.js web platforms, and server-side Gemini AI pipelines with strict reliability.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <button
                id="hero-view-projects-btn"
                onClick={onViewProjects}
                className="group flex items-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0092E6] hover:shadow-[0_0_20px_rgba(0,163,255,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF]"
              >
                <span>Explore Projects</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-contact-btn"
                onClick={onContact}
                className={`group flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] ${
                  isDark
                    ? 'border-white/[0.1] bg-[#111316] text-[#F5F5F5] hover:border-white/[0.2] hover:bg-[#17191D]'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <span>Let's Talk</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                id="hero-control-center-badge"
                onClick={onOpenControlCenter}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 font-mono text-xs transition-colors ${
                  isDark
                    ? 'border-white/[0.06] bg-[#0B0C0E]/80 text-[#71717A] hover:border-white/[0.15] hover:text-[#A1A1AA]'
                    : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300'
                }`}
                title="Open Private Portfolio Control Center"
              >
                <Terminal className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span>Control Center</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Interactive Technical Visual (System Map) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="lg:col-span-5"
          >
            <SystemMapVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
