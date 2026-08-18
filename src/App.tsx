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
import {
  initialProfile,
  initialProjects,
  initialSkillCategories,
  initialServices,
} from './data/initialData';
import { Profile, Project, SkillCategory, Service } from './types';
import { api } from './lib/api';

function PortfolioApp() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [skills, setSkills] = useState<SkillCategory[]>(initialSkillCategories);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isDataSyncing, setIsDataSyncing] = useState(true);

  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);
  const [selectedServicePreload, setSelectedServicePreload] = useState<string | undefined>(undefined);

  const loadInitialData = async () => {
    try {
      // Trigger background seed non-blockingly
      seedFirestoreIfEmpty().catch(() => {});

      const [profData, projData, skillData, srvData] = await Promise.all([
        api.getProfile(),
        api.getProjects({ publishedOnly: true }),
        api.getSkills(),
        api.getServices(),
      ]);

      if (profData) setProfile(profData);
      if (projData && projData.length > 0) setProjects(projData);
      if (skillData && skillData.length > 0) setSkills(skillData);
      if (srvData && srvData.length > 0) setServices(srvData);
    } catch (e) {
      console.warn('[Portfolio] Running with resilient local dataset:', e);
    } finally {
      setIsDataSyncing(false);
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
