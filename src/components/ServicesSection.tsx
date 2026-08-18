import React from 'react';
import { Globe, Smartphone, Cpu, Server, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Service } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ServicesSectionProps {
  services: Service[];
  onSelectServiceForContact: (serviceTitle: string) => void;
}

const iconMap: Record<string, any> = {
  Globe,
  Smartphone,
  Cpu,
  Server,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForContact,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <section id="services" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
            04 / SERVICES_OFFERING
          </div>
          <h2
            className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
              isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
            }`}
          >
            Engineering & Technical Consulting
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
            }`}
          >
            High-impact software architecture, native Android mobile applications, and scalable full-stack web platforms built for speed and durability.
          </p>
        </motion.div>

        {/* 4 Large Editorial Service Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((srv, idx) => {
            const IconComp = iconMap[srv.icon] || Globe;
            return (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                className={`flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-300 ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.18]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        isDark
                          ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                          : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                      }`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3
                        className={`font-sans text-lg font-bold ${
                          isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                        }`}
                      >
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  <p
                    className={`mt-3.5 text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                    }`}
                  >
                    {srv.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="mt-5 space-y-2">
                    <div
                      className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        isDark ? 'text-[#71717A]' : 'text-slate-400'
                      }`}
                    >
                      Key Deliverables
                    </div>
                    {srv.deliverables.map((del, dIdx) => (
                      <div
                        key={dIdx}
                        className={`flex items-start gap-2 text-xs leading-relaxed ${
                          isDark ? 'text-[#F5F5F5]' : 'text-slate-700'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#00A3FF] mt-0.5" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Chips */}
                  <div
                    className={`mt-5 flex flex-wrap gap-1.5 pt-4 border-t ${
                      isDark ? 'border-white/[0.06]' : 'border-slate-100'
                    }`}
                  >
                    {srv.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                          isDark
                            ? 'border-white/[0.06] bg-[#0B0C0E] text-[#71717A]'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={`mt-6 pt-4 border-t ${
                    isDark ? 'border-white/[0.06]' : 'border-slate-100'
                  }`}
                >
                  <button
                    id={`service-inquire-btn-${srv.id}`}
                    onClick={() => onSelectServiceForContact(srv.title)}
                    className="group flex items-center gap-1.5 text-xs font-semibold text-[#00A3FF] transition-colors hover:text-[#38BDF8]"
                  >
                    <span>Inquire About This Service</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
