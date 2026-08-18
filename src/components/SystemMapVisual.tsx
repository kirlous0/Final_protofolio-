import React, { useState } from 'react';
import { Smartphone, Globe, Server, Database, Cloud, Cpu, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface Node {
  id: string;
  label: string;
  sublabel: string;
  category: string;
  icon: any;
  x: number; // percentage
  y: number; // percentage
  connections: string[];
  specs: string[];
}

export const SystemMapVisual: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('frontend');
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const nodes: Node[] = [
    {
      id: 'frontend',
      label: 'Web Client',
      sublabel: 'React / Next.js',
      category: 'Client Tier',
      icon: Globe,
      x: 18,
      y: 28,
      connections: ['backend', 'mobile'],
      specs: ['TypeScript', 'Tailwind CSS', 'Sub-100ms FCP', 'App Router'],
    },
    {
      id: 'mobile',
      label: 'Native Android',
      sublabel: 'Kotlin & Compose',
      category: 'Client Tier',
      icon: Smartphone,
      x: 18,
      y: 72,
      connections: ['backend', 'database'],
      specs: ['Jetpack Compose', 'Kotlin Coroutines', 'Offline Room DB', 'MVI Architecture'],
    },
    {
      id: 'backend',
      label: 'API & Orchestration',
      sublabel: 'Node / Express',
      category: 'Core Service',
      icon: Server,
      x: 50,
      y: 48,
      connections: ['ai', 'database', 'cloud'],
      specs: ['REST & WebSockets', 'SSRF Guards', 'Rate Limiting', 'Zod Contracts'],
    },
    {
      id: 'ai',
      label: 'AI Intelligence',
      sublabel: 'Gemini Engine',
      category: 'Cognitive Layer',
      icon: Cpu,
      x: 82,
      y: 24,
      connections: ['backend'],
      specs: ['Structured Outputs', 'Visual Audits', 'Streaming Responses', 'Zero-Hallucination'],
    },
    {
      id: 'database',
      label: 'Data Persistence',
      sublabel: 'Firestore & PostgreSQL',
      category: 'Storage Tier',
      icon: Database,
      x: 82,
      y: 76,
      connections: ['backend'],
      specs: ['ACID Transactions', 'Security Rules', 'Optimistic Sync', 'Realtime Listeners'],
    },
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
        isDark
          ? 'border-white/[0.08] bg-[#111316]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          : 'border-slate-200 bg-white/95 backdrop-blur-md shadow-md'
      }`}
    >
      {/* Top Header Label */}
      <div
        className={`flex items-center justify-between border-b pb-3.5 ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#00A3FF] animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF]">
            SYSTEM_TOPOLOGY_MAP
          </span>
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-wider ${
            isDark ? 'text-[#71717A]' : 'text-slate-400'
          }`}
        >
          Interactive Topology
        </span>
      </div>

      {/* Interactive System Canvas */}
      <div className="relative my-4 h-64 sm:h-72 w-full select-none">
        {/* Connection Rails SVG */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {nodes.map(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              const isConnectedToActive =
                node.id === activeNodeId || target.id === activeNodeId;

              return (
                <g key={`${node.id}-${target.id}`}>
                  <line
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke={
                      isConnectedToActive
                        ? '#00A3FF'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)'
                    }
                    strokeWidth={isConnectedToActive ? '1.5' : '1'}
                    strokeDasharray={isConnectedToActive ? '4 4' : 'none'}
                    className="transition-colors duration-300"
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const Icon = node.icon;
          const isActive = node.id === activeNodeId;

          return (
            <motion.div
              key={node.id}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setActiveNodeId(node.id)}
                className={`group flex items-center gap-2 rounded-xl border p-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] ${
                  isActive
                    ? isDark
                      ? 'border-[#00A3FF] bg-[#17191D] shadow-[0_0_16px_rgba(0,163,255,0.25)]'
                      : 'border-[#0284C7] bg-white shadow-md'
                    : isDark
                    ? 'border-white/[0.08] bg-[#111316] hover:border-white/[0.2] hover:bg-[#17191D]'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? 'border-[#00A3FF]/40 bg-[#00A3FF]/15 text-[#00A3FF]'
                      : isDark
                      ? 'border-white/[0.08] bg-[#17191D] text-[#A1A1AA]'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="hidden sm:block pr-1">
                  <div
                    className={`font-sans text-xs font-semibold leading-tight ${
                      isActive
                        ? isDark
                          ? 'text-[#F5F5F5]'
                          : 'text-slate-900'
                        : isDark
                        ? 'text-[#A1A1AA]'
                        : 'text-slate-700'
                    }`}
                  >
                    {node.label}
                  </div>
                  <div
                    className={`font-mono text-[10px] leading-tight ${
                      isDark ? 'text-[#71717A]' : 'text-slate-400'
                    }`}
                  >
                    {node.sublabel}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Node Specs Ribbon */}
      <div
        className={`rounded-xl border p-3 transition-colors ${
          isDark
            ? 'border-white/[0.06] bg-[#0B0C0E]/90'
            : 'border-slate-100 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-sans text-xs font-semibold ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              {activeNode.label}
            </span>
            <span className="font-mono text-[10px] text-[#00A3FF] font-medium">
              [{activeNode.category}]
            </span>
          </div>
          <span
            className={`font-mono text-[10px] ${
              isDark ? 'text-[#71717A]' : 'text-slate-400'
            }`}
          >
            Verified Specs
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {activeNode.specs.map((spec, sIdx) => (
            <span
              key={sIdx}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA]'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-[#00A3FF]" />
              <span>{spec}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
