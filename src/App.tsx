import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrustStrip } from './components/TrustStrip';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailView } from './components/ProjectDetailView';
import { EngineeringSection } from './components/EngineeringSection';
import { AiWorkflowSection } from './components/AiWorkflowSection';
import { GitHubSection } from './components/GitHubSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminControlCenter } from './components/AdminControlCenter';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './lib/authContext';
import { seedFirestoreIfEmpty } from './lib/firestoreService';
import { Profile, Project, SkillCategory, Service } from './types';
import { api } from './lib/api';

function PortfolioApp() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);
  const [selectedServicePreload, setSelectedServicePreload] = useState<string | undefined>(undefined);

  const loadInitialData = async () => {
    try {
      await seedFirestoreIfEmpty();
      const [profData, projData, skillData, srvData] = await Promise.all([
        api.getProfile(),
        api.getProjects({ publishedOnly: true }),
        api.getSkills(),
        api.getServices(),
      ]);

      setProfile(profData);
      setProjects(projData);
      setSkills(skillData);
      setServices(srvData);
    } catch (e) {
      console.error('Failed to load portfolio data from Cloud Firestore', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleNavigate = (sectionId: string) => {
    setSelectedProjectSlug(null);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForContact = (serviceTitle: string) => {
    setSelectedServicePreload(serviceTitle);
    handleNavigate('contact');
  };

  if (loading || !profile) {
    return (
      <div
        className={`flex h-screen w-full items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-[#0B0C0E] text-[#71717A]' : 'bg-slate-50 text-slate-600'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00A3FF] border-t-transparent" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#A1A1AA]">
            CONNECTING TO CLOUD FIRESTORE...
          </span>
        </div>
      </div>
    );
  }

  // If in Admin Control Center Mode
  if (isControlCenterOpen) {
    return (
      <AdminControlCenter
        onExit={() => setIsControlCenterOpen(false)}
        onRefreshPublicData={loadInitialData}
      />
    );
  }

  // Selected project for detailed case study
  const activeProject = selectedProjectSlug
    ? projects.find(p => p.slug === selectedProjectSlug)
    : null;

  return (
    <div
      className={`min-h-screen font-sans relative transition-colors duration-300 ${
        isDark ? 'bg-[#0B0C0E] text-[#F5F5F5]' : 'bg-[#FAFAFA] text-slate-900'
      }`}
    >
      {/* Background Animated Particles & Ambient Fluid Glow */}
      <AnimatedBackground />

      {/* Top Main Navigation Header */}
      <Header
        profile={profile}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenControlCenter={() => setIsControlCenterOpen(true)}
      />

      {activeProject ? (
        /* Dedicated Project Case Study View */
        <ProjectDetailView
          project={activeProject}
          allProjects={projects}
          onBack={() => setSelectedProjectSlug(null)}
          onSelectProject={slug => {
            setSelectedProjectSlug(slug);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onContact={() => handleNavigate('contact')}
        />
      ) : (
        /* Standard Single-Page Architecture Showcase */
        <main className="relative z-10">
          <HeroSection
            profile={profile}
            onViewProjects={() => handleNavigate('projects')}
            onContact={() => handleNavigate('contact')}
            onOpenControlCenter={() => setIsControlCenterOpen(true)}
          />

          <TrustStrip />

          <AboutSection profile={profile} />

          <ProjectsSection
            projects={projects}
            onSelectProject={slug => {
              setSelectedProjectSlug(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          <SkillsSection categories={skills} />

          <ServicesSection
            services={services}
            onSelectServiceForContact={handleSelectServiceForContact}
          />

          <EngineeringSection />

          <AiWorkflowSection />

          <GitHubSection githubUrl={profile.github || profile.githubUrl || 'https://github.com/waelkirlous'} />

          <ContactSection
            profile={profile}
            selectedServicePreload={selectedServicePreload}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        profile={profile}
        onNavigate={handleNavigate}
        onOpenControlCenter={() => setIsControlCenterOpen(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
