import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Loader2, CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onCancel }) => {
  const { login, loginWithGoogle, signup, resetPassword } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('waelkirlous@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setErrorDetail(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let msg = err.message || 'Google sign-in failed';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Pop-up was blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google provider is not enabled in Firebase Console.';
        setErrorDetail('Please enable Google under Firebase Console > Authentication > Sign-in method.');
      }
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorDetail(null);
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
      console.error('Auth Error:', err);
      let msg = err.message || 'Authentication error';
      let detail: string | null = null;

      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in Firebase Console.';
        detail = 'Use the "Continue with Google" button above, or enable "Email/Password" under Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid credentials. If this is your first time, create your admin password using "Create Admin Account" or use Google Sign-In.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No existing admin user found for this email. Switch to "Create Admin Account" to set up credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in.';
      }

      setError(msg);
      setErrorDetail(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? 'border-white/[0.08] bg-[#0c1017] text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Header Ribbon */}
        <div className="border-b border-white/[0.06] bg-[#111316] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A3FF] text-white font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-[#00A3FF] tracking-wider uppercase block">
                FIREBASE_AUTHENTICATION
              </span>
              <h2 className="text-sm font-bold">Admin Control Center</h2>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {/* Primary Recommended: Google Sign In */}
          <div className="mb-5">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className={`flex w-full items-center justify-center gap-3 rounded-xl border p-3 text-xs font-semibold shadow-xs transition-all ${
                isDark
                  ? 'border-white/[0.12] bg-[#17191D] text-white hover:border-[#00A3FF] hover:bg-[#1E232B]'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#00A3FF]" />
                  <span>Connecting to Google Auth...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google (Instant Sign In)</span>
                </>
              )}
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-white/[0.08]" />
            <span
              className={`absolute px-3 font-mono text-[10px] uppercase tracking-wider ${
                isDark ? 'bg-[#0c1017] text-[#71717A]' : 'bg-white text-slate-400'
              }`}
            >
              Or with Password
            </span>
          </div>

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
                className="mt-6 rounded-xl bg-[#00A3FF] px-5 py-2 text-xs font-bold text-white hover:bg-[#0092E6]"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="waelkirlous@gmail.com"
                    className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                      isDark
                        ? 'border-white/[0.08] bg-[#111316] text-white placeholder-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                        isDark
                          ? 'border-white/[0.08] bg-[#111316] text-white placeholder-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                        isDark
                          ? 'border-white/[0.08] bg-[#111316] text-white placeholder-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-950/30 p-3 text-xs text-red-400 space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{error}</span>
                  </div>
                  {errorDetail && (
                    <div className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                      💡 {errorDetail}
                    </div>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0092E6] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In with Password'}
                      {mode === 'signup' && 'Create Admin Account'}
                      {mode === 'reset' && 'Send Password Reset Email'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Toggle Modes */}
          <div className="mt-5 flex flex-col items-center gap-1.5 border-t border-white/[0.06] pt-3.5 text-center font-mono text-[11px] text-slate-400">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setErrorDetail(null);
                  }}
                  className="text-[#00A3FF] hover:underline font-semibold"
                >
                  Create new email/password account →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                    setErrorDetail(null);
                  }}
                  className="hover:text-slate-300"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setErrorDetail(null);
                }}
                className="text-[#00A3FF] hover:underline font-semibold"
              >
                Already registered? Back to Sign In →
              </button>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setErrorDetail(null);
                }}
                className="text-[#00A3FF] hover:underline font-semibold"
              >
                Back to Sign In
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="mt-2 text-slate-500 hover:text-slate-400 text-[10px]"
            >
              Cancel and return to public site
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
