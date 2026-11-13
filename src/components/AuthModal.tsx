import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Key,
  Mail,
  User,
  Phone,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Lock
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';
import { AppUser } from '../types/hstock';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  onOpenLegal?: (tab: 'terms' | 'privacy' | 'refund') => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'verify';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  onOpenLegal,
  initialMode = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot' | 'verify'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password & email verification states
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [signupOtpVerified, setSignupOtpVerified] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Submit Login or Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email');
        if (!signupOtpVerified) throw new Error('Please verify your email OTP code first.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const res = await hstockApi.register(name, email, password, phone, otpCode);
        onSuccess(res.user);
        onClose();
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password');
        const res = await hstockApi.login(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Verify signup OTP before unlocking password
  const handleVerifySignupOtp = async () => {
    if (!email.trim() || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit email verification code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await hstockApi.verifyOtp(email.trim(), otpCode.trim());
      setSignupOtpVerified(true);
      setSuccessMsg(res.message || 'Email verified! You can now create your password.');
    } catch (err: any) {
      setSignupOtpVerified(false);
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for Forgot Password or Email Verification
  const handleRequestOtp = async (type: 'forgot_password' | 'email_verification') => {
    if (!email.trim()) {
      setError('Please enter your email address to receive the verification code.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await hstockApi.sendOtp(email.trim(), type);
      setOtpSent(true);
      setSuccessMsg(res.message);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check email.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await hstockApi.resetPassword(email.trim(), otpCode.trim(), newPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setTab('login');
        setPassword(newPassword);
        setOtpSent(false);
        setOtpCode('');
        setDevOtpHint(null);
        setSuccessMsg('Password updated! Please log in with your new password.');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please verify your code.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Email Verification
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await hstockApi.verifyEmail(email.trim(), otpCode.trim());
      setSuccessMsg('Email verified successfully!');
      setTimeout(() => {
        onSuccess(res.user);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0e1626] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2">
                <span>HSTOCK PORTAL</span>
                <span className="text-[10px] font-sans font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Secure
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {tab === 'login' && 'Sign in to access your checker wallet'}
                {tab === 'signup' && 'Create an account to start checking'}
                {tab === 'forgot' && 'Reset your account password securely'}
                {tab === 'verify' && 'Verify your email address with OTP'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch for Login / Signup */}
        {(tab === 'login' || tab === 'signup') && (
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'signup' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back button for Forgot / Verify */}
        {(tab === 'forgot' || tab === 'verify') && (
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
              setSuccessMsg(null);
              setOtpSent(false);
              setDevOtpHint(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN / SIGNUP FORM */}
        {(tab === 'login' || tab === 'signup') && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Muhammad Usman"
                      className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Mobile / WhatsApp (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03131664235"
                      className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Email Address *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={tab === 'signup' && signupOtpVerified}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpSent(false);
                      setSignupOtpVerified(false);
                      setDevOtpHint(null);
                    }}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none disabled:opacity-70"
                  />
                </div>
                {tab === 'signup' && !signupOtpVerified && (
                  <button
                    type="button"
                    disabled={loading || !email.includes('@')}
                    onClick={() => handleRequestOtp('email_verification')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {tab === 'signup' && otpSent && !signupOtpVerified && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                {devOtpHint && (
                  <div className="flex items-center justify-between text-xs text-cyan-200 bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30">
                    <span>Verification Code:</span>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono tracking-widest">{devOtpHint}</strong>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpHint)}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold cursor-pointer"
                      >
                        Fill
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 bg-slate-950 text-center text-xs font-mono tracking-widest text-white px-3 py-2 rounded-xl border border-cyan-500/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifySignupOtp}
                    disabled={loading || otpCode.length < 6}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {(tab === 'login' || (tab === 'signup' && signupOtpVerified)) && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Password *</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setError(null);
                        setSuccessMsg(null);
                        setOtpSent(false);
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {tab === 'signup' && (
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('terms')}
                  className="text-amber-400 hover:underline"
                >
                  Terms of Service
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('privacy')}
                  className="text-amber-400 hover:underline"
                >
                  Privacy Policy
                </button>
                , and{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('refund')}
                  className="text-amber-400 hover:underline"
                >
                  Refund Policy
                </button>
                .
              </p>
            )}

            {(tab === 'login' || signupOtpVerified) && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-orange-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {tab === 'login' ? <LogIn className="w-4 h-4 text-slate-950" /> : <UserPlus className="w-4 h-4 text-slate-950" />}
                <span>{loading ? 'Please wait...' : tab === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
              </button>
            )}
          </form>
        )}

        {/* 2. FORGOT PASSWORD (OTP FLOW) */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {!otpSent ? (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Registered Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    We will dispatch a secure 6-digit account recovery code valid for 15 minutes to reset your password.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading || !email.trim()}
                  onClick={() => handleRequestOtp('forgot_password')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Sending Recovery Code...' : 'Send 6-Digit Recovery Code'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {devOtpHint && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300">Active Recovery Code:</span>
                      <strong className="font-mono text-amber-100 text-base tracking-widest px-2.5 py-0.5 rounded bg-slate-950 border border-amber-500/30">
                        {devOtpHint}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(devOtpHint);
                          navigator.clipboard.writeText(devOtpHint);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer"
                      >
                        Auto-Fill & Copy Code
                      </button>
                      <a
                        href={`https://wa.me/923131664235?text=${encodeURIComponent(
                          `Hello, my account recovery code is ${devOtpHint} for email ${email}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] ml-auto"
                      >
                        WhatsApp Backup
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Enter 6-Digit Recovery Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-900 text-sm text-center tracking-widest text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-900 text-xs text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-900 text-xs text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRequestOtp('forgot_password')}
                    disabled={loading}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. EMAIL VERIFICATION FLOW */}
        {tab === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Email Address to Verify</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-950 text-xs text-slate-400 px-3.5 py-2 rounded-xl border border-slate-800 font-mono"
              />
            </div>

            {devOtpHint && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <span>Verification Code:</span>
                <strong className="font-mono text-amber-200 text-sm tracking-widest">{devOtpHint}</strong>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">6-Digit Verification Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-slate-900 text-sm text-center tracking-widest text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleRequestOtp('email_verification')}
                disabled={loading}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{loading ? 'Verifying...' : 'Verify Email Address'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
