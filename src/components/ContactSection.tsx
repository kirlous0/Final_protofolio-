import React, { useState } from 'react';
import { Mail, Copy, Check, Send, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { Profile } from '../types';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface ContactSectionProps {
  profile: Profile;
  selectedServicePreload?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  selectedServicePreload,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: selectedServicePreload || 'Full-Stack Web Platform',
    subject: selectedServicePreload ? `Inquiry regarding ${selectedServicePreload}` : '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.sendMessage(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        projectType: 'Full-Stack Web Platform',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to deliver message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 relative z-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Direct Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5"
          >
            <div className="font-mono text-xs font-semibold tracking-wider text-[#00A3FF] uppercase">
              08 / CONTACT
            </div>
            <h2
              className={`mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl transition-colors ${
                isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
              }`}
            >
              Initiate Technical Collaboration
            </h2>
            <p
              className={`mt-4 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
              }`}
            >
              Whether you are hiring for a senior engineering role, planning a native Android mobile application, or designing a scalable web platform, let's connect.
            </p>

            {/* Direct Email Card */}
            <div
              className={`mt-8 rounded-2xl border p-5 transition-colors ${
                isDark ? 'border-white/[0.08] bg-[#111316]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      isDark
                        ? 'border-white/[0.08] bg-[#17191D] text-[#00A3FF]'
                        : 'border-slate-200 bg-slate-100 text-[#0284C7]'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider block ${
                        isDark ? 'text-[#71717A]' : 'text-slate-400'
                      }`}
                    >
                      Direct Email
                    </span>
                    <p
                      className={`font-mono text-xs font-semibold select-all ${
                        isDark ? 'text-[#F5F5F5]' : 'text-slate-900'
                      }`}
                    >
                      {profile.email}
                    </p>
                  </div>
                </div>

                <button
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-all ${
                    isDark
                      ? 'border-white/[0.08] bg-[#17191D] text-[#A1A1AA] hover:text-white hover:border-white/[0.2]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Signals & Presence */}
            <div className="mt-6 space-y-2.5 font-mono text-xs text-[#71717A]">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span className={isDark ? 'text-[#A1A1AA]' : 'text-slate-700'}>
                  Location: {profile.location} (Remote / Global Sync)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span className={isDark ? 'text-[#A1A1AA]' : 'text-slate-700'}>
                  Response Target: Within 24 hours
                </span>
              </div>
            </div>

            {/* Social Channels */}
            <div className="mt-8 flex items-center gap-3">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:text-white hover:border-white/[0.2]'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
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
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:text-white hover:border-white/[0.2]'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
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
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:text-white hover:border-white/[0.2]'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label="Twitter Profile"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-7"
          >
            <div
              className={`rounded-2xl border p-6 sm:p-8 transition-colors ${
                isDark
                  ? 'border-white/[0.08] bg-[#111316]'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              {success ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3
                    className={`mt-4 font-sans text-lg font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Message Delivered
                  </h3>
                  <p
                    className={`mt-2 text-xs ${
                      isDark ? 'text-[#A1A1AA]' : 'text-slate-600'
                    }`}
                  >
                    Thank you. Your inquiry has been stored securely and dispatched to Kirlous Wael.
                  </p>
                  <button
                    id="send-another-message-btn"
                    onClick={() => setSuccess(false)}
                    className="mt-6 rounded-xl bg-[#00A3FF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0092E6]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className={`block font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Sarah Jenkins"
                        className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                          isDark
                            ? 'border-white/[0.08] bg-[#0B0C0E] text-white placeholder-slate-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className={`block font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="sarah@company.com"
                        className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                          isDark
                            ? 'border-white/[0.08] bg-[#0B0C0E] text-white placeholder-slate-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-type"
                        className={`block font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        Inquiry Scope
                      </label>
                      <select
                        id="contact-type"
                        value={formData.projectType}
                        onChange={e =>
                          setFormData({ ...formData, projectType: e.target.value })
                        }
                        className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                          isDark
                            ? 'border-white/[0.08] bg-[#0B0C0E] text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-900'
                        }`}
                      >
                        <option value="Full-Time Senior Role">
                          Full-Time Senior Engineering Role
                        </option>
                        <option value="Native Android App">
                          Native Android App (Kotlin / Compose)
                        </option>
                        <option value="Full-Stack Web Platform">
                          Full-Stack Web Platform (React / Next.js)
                        </option>
                        <option value="Server-Side AI Pipeline">
                          Server-Side AI Pipeline (Gemini API)
                        </option>
                        <option value="Technical Consulting">
                          Technical Architecture & Consulting
                        </option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className={`block font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                        }`}
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        value={formData.subject}
                        onChange={e =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="e.g., Senior Engineering Opportunity"
                        className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                          isDark
                            ? 'border-white/[0.08] bg-[#0B0C0E] text-white placeholder-slate-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className={`block font-mono text-[11px] font-semibold uppercase tracking-wider ${
                        isDark ? 'text-[#A1A1AA]' : 'text-slate-700'
                      }`}
                    >
                      Requirements & Details *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={e =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Describe your technical objectives, stack constraints, or timeline..."
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                        isDark
                          ? 'border-white/[0.08] bg-[#0B0C0E] text-white placeholder-slate-600'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] py-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0092E6] hover:shadow-[0_0_20px_rgba(0,163,255,0.25)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Delivering Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
