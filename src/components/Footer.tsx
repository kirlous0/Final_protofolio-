import React from 'react';
import { Github, Linkedin, Twitter, Mail, Shield, ArrowUp } from 'lucide-react';
import { Profile } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  profile: Profile;
  onNavigate: (sectionId: string) => void;
  onOpenControlCenter: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  onNavigate,
  onOpenControlCenter,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-footer"
      className={`border-t py-12 text-xs relative z-10 transition-colors duration-300 ${
        isDark
          ? 'border-white/[0.06] bg-[#07080A] text-[#71717A]'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand & Identity */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs font-semibold ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] text-[#00A3FF]'
                    : 'border-slate-300 bg-white text-[#0284C7]'
                }`}
              >
                KW
              </div>
              <span
                className={`font-sans text-sm font-semibold ${
                  isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                }`}
              >
                {profile.name}
              </span>
            </div>
            <p className="text-xs max-w-md leading-relaxed">
              Full Stack Web Developer & Android Developer specializing in reactive web platforms, native Jetpack Compose applications, and server-side Gemini AI systems.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                  aria-label="GitHub Profile"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                  aria-label="Twitter Profile"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              <a
                href={`mailto:${profile.email}`}
                className="hover:text-[#00A3FF] transition-colors"
                aria-label="Email Kirlous"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <span
              className={`font-mono text-xs font-semibold uppercase tracking-wider block ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Navigation
            </span>
            <div className="flex flex-col space-y-1.5 font-sans">
              {[
                { id: 'hero', label: 'Overview' },
                { id: 'about', label: 'About & Focus' },
                { id: 'projects', label: 'Selected Work' },
                { id: 'skills', label: 'Skills & Stack' },
                { id: 'services', label: 'Services' },
                { id: 'process', label: 'Process' },
                { id: 'workflow', label: 'AI Workflow' },
                { id: 'contact', label: 'Contact' },
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-left text-xs transition-colors ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-950'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Appearance & Admin */}
          <div className="md:col-span-3 space-y-3">
            <span
              className={`font-mono text-xs font-semibold uppercase tracking-wider block ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Appearance & CMS
            </span>

            <ThemeToggle variant="segmented" />

            <div className="pt-2">
              <button
                id="footer-open-control-center-btn"
                onClick={onOpenControlCenter}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                  isDark
                    ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:border-white/[0.2] hover:text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span>Control Center</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-between border-t pt-5 font-mono text-[11px] ${
            isDark ? 'border-white/[0.04] text-[#71717A]' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div>
            © {new Date().getFullYear()} {profile.name}. All systems operational.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span>Quiet Power Design System</span>
            <button
              id="footer-back-to-top-btn"
              onClick={scrollToTop}
              className={`flex items-center gap-1 transition-colors ${
                isDark ? 'text-[#A1A1AA] hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>Top</span>
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
