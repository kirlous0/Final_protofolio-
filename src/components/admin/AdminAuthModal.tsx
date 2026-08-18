import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Loader2, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onCancel }) => {
  const { login, signup, resetPassword } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('waelkirlous@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onSuccess();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(email, password);
        onSuccess();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid credentials. If this is your first time, create your admin password using "Create Admin Account".';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No existing admin user found for this email. Switch to "Create Admin Account" to set up credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? 'border-[#263246] bg-[#0c1017] text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Header Ribbon */}
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-amber-500 tracking-wider">
                FIREBASE_AUTHENTICATION
              </span>
              <h2 className="text-sm font-bold">Admin Control Center</h2>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {resetSent ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-bold">Password Reset Sent</h3>
              <p className="mt-2 text-xs text-slate-400">
                A password reset link has been dispatched to <span className="text-white font-mono">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="mt-6 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-semibold mb-1">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="waelkirlous@gmail.com"
                    className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-amber-500 focus:outline-none transition-colors ${
                      isDark
                        ? 'border-[#242f42] bg-[#121824] text-white placeholder-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block font-mono text-xs font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-amber-500 focus:outline-none transition-colors ${
                        isDark
                          ? 'border-[#242f42] bg-[#121824] text-white placeholder-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block font-mono text-xs font-semibold mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-amber-500 focus:outline-none transition-colors ${
                        isDark
                          ? 'border-[#242f42] bg-[#121824] text-white placeholder-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying with Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to Control Center'}
                      {mode === 'signup' && 'Create Admin Account'}
                      {mode === 'reset' && 'Send Password Reset Email'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Toggle Modes */}
          <div className="mt-6 flex flex-col items-center gap-2 border-t pt-4 text-center font-mono text-[11px] text-slate-400">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-amber-500 hover:underline font-semibold"
                >
                  First time? Set up admin credentials →
                </button>
                <button
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                  }}
                  className="hover:text-slate-300"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-amber-500 hover:underline font-semibold"
              >
                Already registered? Back to Sign In →
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-amber-500 hover:underline font-semibold"
              >
                Back to Sign In
              </button>
            )}

            <button
              onClick={onCancel}
              className="mt-2 text-slate-500 hover:text-slate-400"
            >
              Cancel and return to public portfolio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
