import React from 'react';
import { Smartphone, Globe, Cpu, Database, Cloud, Code2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TrustStrip: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const capabilities = [
    { label: 'FULL STACK WEB', icon: Globe, detail: 'React / Next.js / TypeScript' },
    { label: 'NATIVE ANDROID', icon: Smartphone, detail: 'Kotlin / Jetpack Compose / MVI' },
    { label: 'AI INTEGRATIONS', icon: Cpu, detail: 'Gemini Models / Structured Workflows' },
    { label: 'API & ORCHESTRATION', icon: Code2, detail: 'Node.js / Express / REST' },
    { label: 'CLOUD & DATABASE', icon: Database, detail: 'Firestore / PostgreSQL / Storage' },
  ];

  return (
    <div
      id="trust-strip"
      className={`border-y transition-colors duration-300 ${
        isDark
          ? 'border-white/[0.06] bg-[#0B0C0E]/60 backdrop-blur-sm'
          : 'border-slate-200 bg-slate-50/70 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 items-center">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-[#111316]' : 'hover:bg-white'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] text-[#00A3FF]'
                      : 'border-slate-200 bg-white text-[#0284C7]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-mono text-xs font-semibold tracking-tight truncate ${
                      isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`font-mono text-[10px] truncate ${
                      isDark ? 'text-[#71717A]' : 'text-slate-500'
                    }`}
                  >
                    {item.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
