import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Copy,
  ExternalLink,
  Key,
  Check,
  Globe,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onCancel }) => {
  const { login, loginWithGoogle, loginWithMasterKey, signup, resetPassword } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'passkey'>('login');
  const [email, setEmail] = useState('waelkirlous@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'general' | 'unauthorized-domain' | 'operation-not-allowed'>('general');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleSettingsUrl = 'https://console.firebase.google.com/project/vaulted-byway-p6shk/authentication/settings';

  const handleCopyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 3000);
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
        setError('Domain not authorized in Firebase Console (النطاق غير مصرح به).');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorType('operation-not-allowed');
        setError('Google provider is disabled in Firebase Console.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by browser. Please allow popups for this window.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMasterKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = loginWithMasterKey(masterKey);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid Admin Passkey. Hint: Use your name (waelkirlous / kirlous2026).');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType('general');
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

      if (err.code === 'auth/unauthorized-domain') {
        setErrorType('unauthorized-domain');
        msg = 'Domain not authorized in Firebase Console.';
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorType('operation-not-allowed');
        msg = 'Email/Password sign-in is disabled in Firebase Console.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid credentials. If this is your first time, use Admin Passkey or Google Sign-In.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No existing user found for this email.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl transition-all my-8 ${
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
                AUTHENTICATION & ACCESS
              </span>
              <h2 className="text-sm font-bold">Admin Control Center</h2>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {/* Domain Authorization Warning Box */}
          {errorType === 'unauthorized-domain' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4.5 text-xs text-amber-300 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <Globe className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    إضافة النطاق في Firebase Console (Authorized Domain)
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Firebase يمنع تسجيل الدخول حتى يتم إضافة رابط هذا الموقع إلى قائمة <strong>Authorized domains</strong> في لوحة تحكم Firebase الخاصة بك.
                  </p>
                </div>
              </div>

              {/* Hostname Copy Field */}
              <div className="rounded-xl border border-white/[0.1] bg-[#0c1017] p-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-200 select-all truncate">
                  {currentHostname}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHostname}
                  className="flex items-center gap-1 shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>نسخ النطاق</span>
                    </>
                  )}
                </button>
              </div>

              {/* Steps */}
              <div className="text-[11px] text-slate-300 space-y-1.5 pt-1 border-t border-amber-500/20">
                <div className="font-bold text-amber-300">خطوات تفعيل النطاق (30 ثانية فقط):</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>افتح إعدادات Authentication في Firebase Console بالزر أدناه.</li>
                  <li>توجه إلى تبويب <strong>Settings</strong> ثم قسم <strong>Authorized domains</strong>.</li>
                  <li>اضغط <strong>Add domain</strong> والصق النطاق الذي قمت بنسخه أعلاه ثم اضغط <strong>Save</strong>.</li>
                </ol>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={firebaseConsoleSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full sm:w-auto flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <span>فتح إعدادات Firebase Console</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMode('passkey');
                    setError(null);
                  }}
                  className="w-full sm:w-auto rounded-xl border border-white/[0.15] bg-[#17191D] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1E232B] transition-colors"
                >
                  🔑 الدخول السريع برمز المطور
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Admin Passkey Mode */}
          {mode === 'passkey' ? (
            <form onSubmit={handleMasterKeySubmit} className="space-y-4">
              <div className="rounded-xl border border-[#00A3FF]/20 bg-[#00A3FF]/10 p-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-[#00A3FF] font-bold">
                  <Key className="h-4 w-4" />
                  <span>دخول المطور المباشر (Admin Passkey)</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  ادخل رمز المطور الخاص بك للدخول إلى لوحة التحكم فوراً بدون انتظار مصادقة النطاق:
                </p>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                  رمز المطور (Developer Passkey)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={masterKey}
                    onChange={e => setMasterKey(e.target.value)}
                    placeholder="waelkirlous"
                    autoFocus
                    className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs shadow-xs focus:border-[#00A3FF] focus:outline-none transition-colors ${
                      isDark
                        ? 'border-white/[0.08] bg-[#111316] text-white placeholder-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div className="mt-1.5 font-mono text-[10px] text-slate-500">
                  ملاحظة: يمكنك كتابة <code className="text-[#00A3FF]">waelkirlous</code> أو <code className="text-[#00A3FF]">kirlous2026</code>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0092E6]"
              >
                <span>دخول لوحة التحكم</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="w-full text-center text-xs font-mono text-[#A1A1AA] hover:text-white"
              >
                ← العودة إلى تسجيل الدخول عبر Google / Firebase
              </button>
            </form>
          ) : (
            <>
              {/* Primary Recommended: Google Sign In */}
              <div className="mb-4">
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
                      <span>الدخول بحساب Google (waelkirlous@gmail.com)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Developer Passkey Trigger Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('passkey');
                    setError(null);
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border p-2.5 font-mono text-xs transition-colors ${
                    isDark
                      ? 'border-white/[0.08] bg-[#111316] text-[#A1A1AA] hover:text-white hover:border-white/[0.2]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Key className="h-3.5 w-3.5 text-[#00A3FF]" />
                  <span>أو الدخول المباشر برمز المطور (Passkey)</span>
                </button>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-white/[0.08]" />
                <span
                  className={`absolute px-3 font-mono text-[10px] uppercase tracking-wider ${
                    isDark ? 'bg-[#0c1017] text-[#71717A]' : 'bg-white text-slate-400'
                  }`}
                >
                  أو بكلمة المرور
                </span>
              </div>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold">Password Reset Sent</h3>
                  <p className="mt-2 text-xs text-slate-400">
                    تم إرسال رابط إعادة تعيين كلمة المرور إلى <span className="text-white font-mono">{email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setMode('login');
                    }}
                    className="mt-6 rounded-xl bg-[#00A3FF] px-5 py-2 text-xs font-bold text-white hover:bg-[#0092E6]"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-[#A1A1AA]">
                      البريد الإلكتروني للوحة الإدارة
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
                        كلمة المرور
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
                        تأكيد كلمة المرور
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

                  {error && errorType !== 'unauthorized-domain' && (
                    <div className="rounded-xl border border-red-500/25 bg-red-950/30 p-3 text-xs text-red-400 space-y-1">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{error}</span>
                      </div>
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
                        <span>جاري التحقق...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === 'login' && 'تسجيل الدخول بكلمة المرور'}
                          {mode === 'signup' && 'إنشاء حساب إدارة جديد'}
                          {mode === 'reset' && 'إرسال رابط إعادة التعيين'}
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
                      }}
                      className="text-[#00A3FF] hover:underline font-semibold"
                    >
                      إنشاء حساب بريد وكلمة مرور جديد →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setError(null);
                      }}
                      className="hover:text-slate-300"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </>
                )}

                {mode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-[#00A3FF] hover:underline font-semibold"
                  >
                    لديك حساب بالفعل؟ العودة لتسجيل الدخول →
                  </button>
                )}

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-[#00A3FF] hover:underline font-semibold"
                  >
                    العودة لتسجيل الدخول
                  </button>
                )}

                <button
                  type="button"
                  onClick={onCancel}
                  className="mt-2 text-slate-500 hover:text-slate-400 text-[10px]"
                >
                  إلغاء والعودة إلى الموقع العام
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
