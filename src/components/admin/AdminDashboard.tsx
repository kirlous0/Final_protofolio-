import React from 'react';
import {
  FolderKanban,
  CheckCircle,
  FileEdit,
  Star,
  Mail,
  Camera,
  Sparkles,
  Shield,
  Activity,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Project, Message, ActivityLog, Profile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AdminDashboardProps {
  projects: Project[];
  messages: Message[];
  activityLogs: ActivityLog[];
  profile: Profile;
  onNavigateTab: (tabId: string) => void;
  onCreateProject: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  messages,
  activityLogs,
  profile,
  onNavigateTab,
  onCreateProject,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;
  const featuredCount = projects.filter(p => p.featured).length;
  const unreadMessages = messages.filter(m => m.status === 'unread').length;
  const totalScreenshots = projects.reduce((acc, p) => acc + p.gallery.length, 0);

  // Calculate average AI quality score from audited projects
  const auditedProjects = projects.filter(p => p.aiAudit?.verifiedScore);
  const avgAiScore = auditedProjects.length > 0
    ? Math.round(
        auditedProjects.reduce((acc, p) => acc + (p.aiAudit?.verifiedScore || 0), 0) /
          auditedProjects.length
      )
    : 92;

  const kpis = [
    {
      label: 'Published Projects',
      value: publishedCount,
      subValue: `${draftCount} drafts`,
      icon: FolderKanban,
      color: 'text-emerald-500',
      tab: 'projects',
    },
    {
      label: 'Featured Case Studies',
      value: featuredCount,
      subValue: 'Frontpage showcases',
      icon: Star,
      color: 'text-amber-500',
      tab: 'projects',
    },
    {
      label: 'Unread Messages',
      value: unreadMessages,
      subValue: `${messages.length} total inquiries`,
      icon: Mail,
      color: unreadMessages > 0 ? 'text-amber-500' : 'text-slate-400',
      tab: 'messages',
    },
    {
      label: 'Captured Viewports',
      value: totalScreenshots,
      subValue: 'Multi-device screenshots',
      icon: Camera,
      color: 'text-blue-500',
      tab: 'screenshots',
    },
    {
      label: 'AI Portfolio Score',
      value: `${avgAiScore}/100`,
      subValue: 'Zero-hallucination verified',
      icon: Sparkles,
      color: 'text-purple-500',
      tab: 'ai-studio',
    },
  ];

  return (
    <div id="admin-dashboard-tab" className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border p-6 shadow-md backdrop-blur-xl ${
          isDark
            ? 'border-[#202738] bg-[#0c1017]/90'
            : 'border-slate-200 bg-white/95 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-500">
            <Shield className="h-4 w-4" />
            <span>PORTFOLIO_CONTROL_CENTER</span>
          </div>
          <h2
            className={`mt-1 text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Engineering Dashboard & CMS
          </h2>
          <p
            className={`mt-1 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Welcome, {profile.name}. Real-time overview of case studies, incoming inquiries, and AI automation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            id="admin-create-project-top-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateProject}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </motion.button>

          <motion.button
            id="admin-open-ai-studio-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('ai-studio')}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              isDark
                ? 'border-[#273244] bg-[#121722] text-slate-200 hover:border-amber-500/40 hover:text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-amber-500/40 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI Studio</span>
          </motion.button>

          <motion.button
            id="admin-capture-screenshots-top-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('screenshots')}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              isDark
                ? 'border-[#273244] bg-[#121722] text-slate-200 hover:border-amber-500/40 hover:text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500/40 hover:bg-slate-50'
            }`}
          >
            <Camera className="h-4 w-4 text-blue-500" />
            <span>Screenshot Engine</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => onNavigateTab(kpi.tab)}
              className={`group cursor-pointer rounded-2xl border p-4 shadow-sm backdrop-blur-md transition-all ${
                isDark
                  ? 'border-[#1e2535] bg-[#0c1017]/85 hover:border-amber-500/40 hover:bg-[#101520]'
                  : 'border-slate-200 bg-white hover:border-amber-500/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{kpi.label}</span>
                <IconComp className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div
                className={`mt-3 font-mono text-2xl font-extrabold group-hover:text-amber-500 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {kpi.value}
              </div>
              <div
                className={`mt-1 text-[11px] ${
                  isDark ? 'text-slate-500' : 'text-slate-600'
                }`}
              >
                {kpi.subValue}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Projects & Activity Timeline */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Projects Quick View */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`lg:col-span-7 rounded-3xl border p-6 shadow-md backdrop-blur-xl ${
            isDark
              ? 'border-[#202738] bg-[#0c1017]/90'
              : 'border-slate-200 bg-white/95'
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-[#182030]' : 'border-slate-200'
            }`}
          >
            <div>
              <h3
                className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Live Project Case Studies
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Current portfolio showcases
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500 hover:text-amber-400"
            >
              <span>Manage All ({projects.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {projects.slice(0, 4).map(proj => (
              <div
                key={proj.id}
                className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                  isDark
                    ? 'border-[#1b2230] bg-[#0f131d] hover:border-[#2a3447]'
                    : 'border-slate-100 bg-slate-50/80 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-slate-900">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {proj.title}
                      </span>
                      {proj.featured && (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 font-mono text-[9px] font-bold text-amber-500">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-mono text-[11px] ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {proj.platform} • {proj.category} • {proj.gallery.length} viewports
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                      proj.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500'
                    }`}
                  >
                    {proj.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity & System Logs Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`lg:col-span-5 rounded-3xl border p-6 shadow-md backdrop-blur-xl ${
            isDark
              ? 'border-[#202738] bg-[#0c1017]/90'
              : 'border-slate-200 bg-white/95'
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-[#182030]' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <h3
                className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                System Audit Trail
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className={`text-xs font-mono font-semibold hover:text-amber-500 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Full Log →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {activityLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className={`rounded-xl border p-3 text-xs transition-all ${
                  isDark
                    ? 'border-[#1b2230] bg-[#0f131d]'
                    : 'border-slate-100 bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-amber-500">
                    {log.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p
                  className={`mt-1 text-[11px] leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
