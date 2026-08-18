import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Camera,
  Mail,
  User,
  Layers,
  Activity,
  ArrowLeft,
  Bot,
  Plus,
  Shield,
  RefreshCw,
  LogOut,
  Flame,
  Github,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Profile, Message, ActivityLog, SkillCategory, Service } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { seedFirestoreIfEmpty } from '../lib/firestoreService';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { AdminAuthModal } from './admin/AdminAuthModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProjectsManager } from './admin/AdminProjectsManager';
import { AdminProjectEditor } from './admin/AdminProjectEditor';
import { AdminAiStudio } from './admin/AdminAiStudio';
import { AdminScreenshotEngine } from './admin/AdminScreenshotEngine';
import { AdminGitHubImport } from './admin/AdminGitHubImport';
import { AdminMessagesInbox } from './admin/AdminMessagesInbox';
import { AdminProfileEditor } from './admin/AdminProfileEditor';
import { AdminSkillsServices } from './admin/AdminSkillsServices';
import { AdminActivityLogs } from './admin/AdminActivityLogs';
import { AdminAiAssistantModal } from './admin/AdminAiAssistantModal';

interface AdminControlCenterProps {
  onExit: () => void;
  onRefreshPublicData: () => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  onExit,
  onRefreshPublicData,
}) => {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const loadAllData = async () => {
    try {
      await seedFirestoreIfEmpty();
      const [projData, profData, msgData, skillData, srvData, logData] = await Promise.all([
        api.getProjects(),
        api.getProfile(),
        api.getMessages(),
        api.getSkills(),
        api.getServices(),
        api.getActivityLogs(),
      ]);

      setProjects(projData);
      setProfile(profData);
      setMessages(msgData);
      setSkills(skillData);
      setServices(srvData);
      setActivityLogs(logData);
    } catch (e) {
      console.error('Error loading admin data from Firestore', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const handleRefresh = () => {
    loadAllData();
    onRefreshPublicData();
  };

  if (authLoading) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${
        isDark ? 'bg-[#090a0f] text-slate-400' : 'bg-slate-50 text-slate-600'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="font-mono text-xs font-bold tracking-wider">VERIFYING FIREBASE AUTHENTICATION...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, show Firebase Admin Auth Modal
  if (!isAdmin) {
    return (
      <AdminAuthModal
        onSuccess={() => loadAllData()}
        onCancel={onExit}
      />
    );
  }

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'github-import', label: 'GitHub Ingest', icon: Github, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
    { id: 'screenshots', label: 'Screenshots', icon: Camera },
    {
      id: 'messages',
      label: 'Inbox',
      icon: Mail,
      badge: messages.filter(m => m.status === 'unread').length || undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'skills', label: 'Skills & Services', icon: Layers },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  if (loading || !profile) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${
        isDark ? 'bg-[#090a0f] text-slate-400' : 'bg-slate-50 text-slate-600'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="font-mono text-xs font-bold tracking-wider">SYNCING CLOUD FIRESTORE DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="admin-control-center"
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark
          ? 'bg-[#07080c] text-slate-200'
          : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8 transition-colors ${
          isDark
            ? 'border-[#1c2436] bg-[#0c1017]/90 text-white'
            : 'border-slate-200 bg-white/90 text-slate-900 shadow-xs'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              id="exit-to-public-site-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExit}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all ${
                isDark
                  ? 'border-[#232d40] bg-[#121723] text-slate-200 hover:border-amber-500/40 hover:bg-[#182030] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-500/40 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Exit to Public Site</span>
            </motion.button>

            <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold text-amber-500">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>FIRESTORE CONTROL CENTER</span>
              <span className="text-slate-400">/</span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{user?.email || profile.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <motion.button
              id="open-ai-assistant-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAiAssistantOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-500 transition-colors hover:bg-amber-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Assistant</span>
            </motion.button>

            <button
              onClick={handleRefresh}
              className={`rounded-xl border p-2 transition-colors ${
                isDark
                  ? 'border-[#232d40] bg-[#121723] text-slate-400 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
              title="Refresh Firestore Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                await logout();
                onExit();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20"
              title="Sign Out of Firebase Auth"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar Navigation */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row px-4 py-6 sm:px-6 lg:px-8 gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav
            className={`flex flex-row md:flex-col gap-1 overflow-x-auto p-1.5 rounded-2xl border ${
              isDark ? 'border-[#1e2738] bg-[#0c1017]/80' : 'border-slate-200 bg-white/80 shadow-xs'
            }`}
            aria-label="Admin Sections"
          >
            {navTabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-nav-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-slate-950 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminNavPill"
                      className="absolute inset-0 rounded-xl bg-amber-500 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2.5">
                    <IconComp
                      className={`h-4 w-4 ${
                        isActive ? 'text-slate-950' : 'text-amber-500'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`relative z-10 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : tab.badgeColor || (isDark ? 'bg-[#1c2436] text-slate-300' : 'bg-slate-100 text-slate-700')
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  projects={projects}
                  messages={messages}
                  activityLogs={activityLogs}
                  profile={profile}
                  onNavigateTab={setActiveTab}
                  onCreateProject={() => setIsCreatingProject(true)}
                />
              )}

              {activeTab === 'projects' && (
                <AdminProjectsManager
                  projects={projects}
                  onRefresh={handleRefresh}
                  onCreateProject={() => setIsCreatingProject(true)}
                  onEditProject={proj => setEditingProject(proj)}
                  onRunAudit={async projectId => {
                    await api.auditProject(projectId);
                    handleRefresh();
                  }}
                  onCaptureScreenshots={proj => {
                    setActiveTab('screenshots');
                  }}
                  onOpenGitHubImport={() => {
                    setActiveTab('github-import');
                  }}
                />
              )}

              {activeTab === 'github-import' && (
                <AdminGitHubImport
                  onRefreshProjects={handleRefresh}
                  onSelectProjectToEdit={proj => setEditingProject(proj)}
                  existingProjects={projects}
                />
              )}

              {activeTab === 'ai-studio' && (
                <AdminAiStudio
                  projects={projects}
                  onRefreshProjects={handleRefresh}
                  onSelectProjectToEdit={proj => setEditingProject(proj)}
                />
              )}

              {activeTab === 'screenshots' && (
                <AdminScreenshotEngine
                  projects={projects}
                  onRefreshProjects={handleRefresh}
                />
              )}

              {activeTab === 'messages' && (
                <AdminMessagesInbox
                  messages={messages}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'profile' && (
                <AdminProfileEditor
                  profile={profile}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'skills' && (
                <AdminSkillsServices
                  skills={skills}
                  services={services}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'logs' && (
                <AdminActivityLogs
                  logs={activityLogs}
                  onRefresh={handleRefresh}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Create / Edit Project Modal */}
      {(isCreatingProject || editingProject) && (
        <AdminProjectEditor
          project={editingProject}
          onSave={() => {
            setIsCreatingProject(false);
            setEditingProject(null);
            handleRefresh();
          }}
          onClose={() => {
            setIsCreatingProject(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Floating AI Assistant Modal */}
      <AdminAiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
};
