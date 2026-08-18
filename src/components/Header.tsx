import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  profile: Profile;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenControlCenter: () => void;
  onSelectProject?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeSection,
  onNavigate,
  onOpenControlCenter,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'services', label: 'Services' },
    { id: 'process', label: 'Process' },
    { id: 'workflow', label: 'AI Workflow' },
    { id: 'github', label: 'GitHub' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isDark = effectiveTheme === 'dark';

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#0B0C0E]/90 backdrop-blur-md border-b border-white/[0.07] py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2.5 shadow-sm'
          : isDark
          ? 'bg-transparent border-b border-transparent py-4'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity: Name + Clean Availability Status */}
        <button
          id="header-brand-btn"
          onClick={() => handleNavClick('hero')}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] rounded-lg"
          aria-label="Kirlous Wael — Go to Top"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-semibold tracking-wider transition-colors ${
              isDark
                ? 'border-white/[0.12] bg-[#111316] text-[#F5F5F5] group-hover:border-[#00A3FF]/50 group-hover:text-[#38BDF8]'
                : 'border-slate-300 bg-slate-100 text-slate-900 group-hover:border-[#0284C7]'
            }`}
          >
            KW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-sans text-sm font-semibold tracking-tight transition-colors ${
                  isDark
                    ? 'text-[#F5F5F5] group-hover:text-white'
                    : 'text-slate-900 group-hover:text-black'
                }`}
              >
                {profile.name}
              </span>
              <span
                className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"
                title="Available for Engineering Opportunities"
              />
            </div>
            <p
              className={`font-mono text-[11px] leading-tight tracking-tight ${
                isDark ? 'text-[#71717A]' : 'text-slate-500'
              }`}
            >
              Full Stack & Android
            </p>
          </div>
        </button>

        {/* Minimal Floating Navigation (Desktop) */}
        <nav
          id="desktop-nav"
          className={`hidden items-center gap-0.5 rounded-full border px-2 py-1 transition-colors lg:flex ${
            isDark
              ? 'border-white/[0.08] bg-[#111316]/80 backdrop-blur-md'
              : 'border-slate-200 bg-white/90 backdrop-blur-md shadow-xs'
          }`}
          aria-label="Main Navigation"
        >
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative rounded-full px-3 py-1 text-xs font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00A3FF] ${
                  isActive
                    ? isDark
                      ? 'text-[#F5F5F5] font-semibold'
                      : 'text-slate-950 font-semibold'
                    : isDark
                    ? 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className={`absolute inset-0 rounded-full ${
                      isDark
                        ? 'bg-[#17191D] border border-white/[0.1]'
                        : 'bg-slate-100 border border-slate-200 shadow-xs'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Private Control Center */}
          <button
            id="open-control-center-header-btn"
            onClick={onOpenControlCenter}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-medium transition-all ${
              isDark
                ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:border-white/[0.18] hover:text-[#F5F5F5] hover:bg-[#17191D]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title="Private Control Center & CMS"
          >
            <Shield className="h-3.5 w-3.5 text-[#00A3FF]" />
            <span>CMS</span>
          </button>

          {/* Primary Let's Talk CTA */}
          <button
            id="header-contact-btn"
            onClick={() => handleNavClick('contact')}
            className="group flex items-center gap-1 rounded-lg bg-[#00A3FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0092E6] hover:shadow-[0_0_15px_rgba(0,163,255,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF]"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border lg:hidden ${
              isDark
                ? 'border-white/[0.08] bg-[#111316] text-[#F5F5F5]'
                : 'border-slate-200 bg-white text-slate-800'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`border-b px-4 py-4 lg:hidden ${
              isDark
                ? 'border-white/[0.08] bg-[#0B0C0E]/98 backdrop-blur-xl text-[#F5F5F5]'
                : 'border-slate-200 bg-white/98 backdrop-blur-xl text-slate-900 shadow-md'
            }`}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium tracking-tight transition-colors ${
                    activeSection === item.id
                      ? isDark
                        ? 'bg-[#17191D] text-[#00A3FF]'
                        : 'bg-slate-100 text-[#0284C7] font-semibold'
                      : isDark
                      ? 'text-[#A1A1AA] hover:bg-[#111316] hover:text-[#F5F5F5]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div
                className={`mt-2 border-t pt-2 ${
                  isDark ? 'border-white/[0.08]' : 'border-slate-200'
                }`}
              >
                <button
                  id="mobile-control-center-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenControlCenter();
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-medium ${
                    isDark
                      ? 'bg-[#111316] text-[#A1A1AA] hover:text-white'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-[#00A3FF]" />
                  <span>Private Control Center</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
