import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  AlertCircle,
  Loader2,
  ArrowRight,
  Copy,
  Key,
  Check,
  Globe,
  Sparkles,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onCancel }) => {
  const { login, loginWithGoogle, loginWithMasterKey, quickDeveloperAccess, signup, resetPassword } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [mode, setMode] = useState<'passkey' | 'google' | 'email' | 'reset'>('passkey');
  const [email, setEmail] = useState('waelkirlous@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'general' | 'unauthorized-domain' | 'operation-not-allowed'>('general');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 3000);
  };

  const handleQuickAccess = () => {
    quickDeveloperAccess();
    onSuccess();
  };

  const handleMasterKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = loginWithMasterKey(masterKey);
    if (success) {
      onSuccess();
    } else {
      setError('رمز المرور غير صحيح. يرجى التحقق وإعادة المحاولة.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setErrorType('general');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorType('unauthorized-domain');
        setError('Domain not authorized in Firebase Console.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorType('operation-not-allowed');
        setError('Google sign-in provider is not enabled in Firebase Console.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup closed before completing.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl transition-all my-8 ${
          isDark
            ? 'border-white/[0.08] bg-[#0B0C0E] text-white'
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
                ADMIN ACCESS CONTROL
              </span>
              <h2 className="text-sm font-bold">Kirlous Wael — Control Center</h2>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Top Mode Tabs */}
          <div className="flex rounded-xl bg-[#111316] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setMode('passkey');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'passkey'
                  ? 'bg-[#00A3FF] text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>دخول المطور (Passkey)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('google');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'google'
                  ? 'bg-[#00A3FF] text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Google Account</span>
            </button>
          </div>

          {/* PRIMARY: Passkey / Quick Access Mode */}
          {mode === 'passkey' && (
            <div className="space-y-4">
              {/* Instant 1-Click Access for Kirlous */}
              <button
                type="button"
                onClick={handleQuickAccess}
                className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      دخول مباشر وفوري للمطور
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      waelkirlous@gmail.com
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-400">
                  <span>دخول</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="absolute px-3 font-mono text-[10px] uppercase tracking-wider bg-[#0B0C0E] text-slate-500">
                  أو كتابة رمز المرور
                </span>
              </div>

              {/* Passkey Input Form (Clean without secret hints) */}
              <form onSubmit={handleMasterKeySubmit} className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                    Developer Passkey
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={masterKey}
                      onChange={e => setMasterKey(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                        isDark
                          ? 'border-white/[0.08] bg-[#111316] text-white placeholder-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-950/30 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0092E6]"
                >
                  <span>التحقق والدخول إلى لوحة التحكم</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* SECONDARY: Google / Firebase Provider */}
          {mode === 'google' && (
            <div className="space-y-4">
              {/* Domain Authorization Info */}
              {errorType === 'unauthorized-domain' && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <p className="text-[11px] text-slate-300">
                      Firebase يتطلب إضافة نطاق الموقع في Console. يمكنك استخدام <strong>رمز المطور (Passkey)</strong> بالأعلى للدخول فوراً بدون أي إعدادات!
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.1] bg-[#0c1017] p-2.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-200 truncate">{currentHostname}</span>
                    <button
                      type="button"
                      onClick={handleCopyHostname}
                      className="flex items-center gap-1 shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                    >
                      {copiedDomain ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDomain ? 'تم النسخ' : 'نسخ النطاق'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-[#17191D] p-3 text-xs font-semibold text-white shadow-xs hover:border-[#00A3FF] hover:bg-[#1E232B] transition-all"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#00A3FF]" />
                    <span>Connecting to Google...</span>
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
                    <span>Google Sign-In</span>
                  </>
                )}
              </button>

              <div className="rounded-xl border border-white/[0.06] bg-[#111316] p-3 text-center">
                <button
                  type="button"
                  onClick={() => setMode('passkey')}
                  className="font-mono text-xs text-[#00A3FF] hover:underline"
                >
                  ← العودة لاستخدام الدخول الفوري السريع
                </button>
              </div>
            </div>
          )}

          {/* Footer Cancel */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Kirlous Wael Portfolio v2.0</span>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors"
            >
              إلغاء والعودة
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
