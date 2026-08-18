import React from 'react';
import { Smartphone, Globe, Server, Database, Cloud, Cpu, Terminal, Shield, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SkillCategory } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

const iconMap: Record<string, any> = {
  Smartphone,
  Globe,
  Server,
  Database,
  Cloud,
  Cpu,
  Terminal,
  Shield,
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({ categories }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <section id="skills" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
            03 / TECHNICAL_PROFICIENCY
          </div>
          <h2
            className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
              isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
            }`}
          >
            Engineering Stack & Core Systems
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
            }`}
          >
            Verified technical competencies grouped by domain. Engineered for durability, zero-leak memory patterns, and deterministic state.
          </p>
        </motion.div>

        {/* Skills Grouped by Domain Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, cIdx) => {
            const FirstIcon = iconMap[category.skills[0]?.iconName] || Terminal;

            return (
              <motion.div
                key={category.id || cIdx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: cIdx * 0.05, duration: 0.35 }}
                className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.15]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 border-b pb-3.5 border-white/[0.06]">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                      isDark
                        ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                        : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                    }`}
                  >
                    <FirstIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3
                      className={`font-sans text-base font-bold ${
                        isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                      }`}
                    >
                      {category.title}
                    </h3>
                  </div>
                </div>

                {category.description && (
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isDark ? 'text-[#71717A]' : 'text-slate-500'
                    }`}
                  >
                    {category.description}
                  </p>
                )}

                {/* Skills List in Domain */}
                <div className="mt-4 space-y-2.5">
                  {category.skills.map((skill, sIdx) => (
                    <div
                      key={sIdx}
                      className={`group/item rounded-xl border p-3 transition-colors ${
                        isDark
                          ? 'border-white/[0.04] bg-[#0B0C0E]/60 hover:bg-[#17191D]'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-sans text-xs font-semibold ${
                            isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                          }`}
                        >
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] rounded px-1.5 py-0.5 border ${
                              isDark
                                ? 'border-white/[0.08] bg-[#111316] text-[#71717A]'
                                : 'border-slate-200 bg-white text-slate-500'
                            }`}
                          >
                            {skill.level}
                          </span>
                          {skill.experienceYears && (
                            <span
                              className={`font-mono text-[10px] ${
                                isDark ? 'text-[#71717A]' : 'text-slate-400'
                              }`}
                            >
                              {skill.experienceYears}y
                            </span>
                          )}
                        </div>
                      </div>

                      {skill.highlight && (
                        <p
                          className={`mt-1 text-[11px] leading-relaxed ${
                            isDark ? 'text-[#71717A]' : 'text-slate-500'
                          }`}
                        >
                          {skill.highlight}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
