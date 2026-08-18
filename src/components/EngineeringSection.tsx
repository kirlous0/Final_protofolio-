import React from 'react';
import { Search, Compass, Code, TestTube, Zap, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const EngineeringSection: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const steps = [
    {
      number: '01',
      title: 'Understand',
      icon: Search,
      focus: 'Domain & Constraints',
      description: 'Audit user requirements, scalability targets, offline sync needs, and system boundaries before writing code.',
    },
    {
      number: '02',
      title: 'Design',
      icon: Compass,
      focus: 'Architecture & Schema',
      description: 'Establish normalized Firestore/SQL schemas, type-safe API contracts, and clean state machines.',
    },
    {
      number: '03',
      title: 'Build',
      icon: Code,
      focus: 'Clean Implementation',
      description: 'Develop with reactive Jetpack Compose / React 18, modular separation of concerns, and zero memory leaks.',
    },
    {
      number: '04',
      title: 'Test',
      icon: TestTube,
      focus: 'Verification & Edge Cases',
      description: 'Verify race conditions, network failures, input boundaries, and security rules across all tiers.',
    },
    {
      number: '05',
      title: 'Optimize',
      icon: Zap,
      focus: 'Speed & Profiling',
      description: 'Profile render cycles, bundle sizes, battery consumption, and database query index efficiency.',
    },
    {
      number: '06',
      title: 'Deploy',
      icon: Rocket,
      focus: 'Automated Delivery',
      description: 'CI/CD pipeline execution with zero-downtime rollouts, automated visual audits, and health monitoring.',
    },
  ];

  return (
    <section id="process" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
            05 / HOW_I_BUILD
          </div>
          <h2
            className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
              isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
            }`}
          >
            Engineering Methodology & Lifecycle
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
            }`}
          >
            A disciplined engineering process ensuring deterministic outcomes, fast iteration cycles, and resilient production code.
          </p>
        </motion.div>

        {/* Process Flow Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#00A3FF]">
                    {step.number}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                      isDark
                        ? 'border-white/[0.08] bg-[#17191D] text-[#A1A1AA]'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <h3
                  className={`mt-4 font-sans text-lg font-bold ${
                    isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                  }`}
                >
                  {step.title}
                </h3>

                <div
                  className={`font-mono text-[11px] mt-0.5 ${
                    isDark ? 'text-[#00A3FF]' : 'text-[#0284C7]'
                  }`}
                >
                  {step.focus}
                </div>

                <p
                  className={`mt-2.5 text-xs leading-relaxed ${
                    isDark ? 'text-[#71717A]' : 'text-slate-600'
                  }`}
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
