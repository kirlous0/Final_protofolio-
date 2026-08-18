import React, { useState } from 'react';
import { Save, User, MapPin, Mail, Globe, Github, Linkedin, Twitter, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Profile } from '../../types';
import { api } from '../../lib/api';

interface AdminProfileEditorProps {
  profile: Profile;
  onRefresh: () => void;
}

export const AdminProfileEditor: React.FC<AdminProfileEditorProps> = ({
  profile,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateProfile(formData);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-profile-tab" className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile, Bio & Social Credentials</h2>
        <p className="text-xs text-slate-400">
          Manage your verified professional identity, contact channels, and engineering narrative.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#202738] bg-[#0c1017] p-6 sm:p-8 space-y-6">
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Profile credentials updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Full Legal / Professional Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Professional Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs font-medium text-slate-300">
            Hero Tagline / Executive Summary
          </label>
          <textarea
            rows={2}
            value={formData.tagline}
            onChange={e => setFormData({ ...formData, tagline: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono text-xs font-medium text-slate-300">
            Full Engineering Journey / Extended Bio
          </label>
          <textarea
            rows={4}
            value={formData.longBio}
            onChange={e => setFormData({ ...formData, longBio: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Direct Contact Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Twitter / X URL
            </label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#182030]">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
