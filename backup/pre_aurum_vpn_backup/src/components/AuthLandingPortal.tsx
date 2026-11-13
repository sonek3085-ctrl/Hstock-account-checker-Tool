import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  CloudLightning,
  Sparkles,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AppUser } from '../types/hstock';
import { hstockApi } from '../services/hstockApi';

interface AuthLandingPortalProps {
  onAuthSuccess: (user: AppUser) => void;
  onOpenSharedReport?: (shareId: string) => void;
}

export const AuthLandingPortal: React.FC<AuthLandingPortalProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP / Verification state
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInfoMsg, setOtpInfoMsg] = useState<string | null>(null);

  // Cloudflare Turnstile simulation / check state
  const [turnstilePassed, setTurnstilePassed] = useState(true);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fast testing fills
  const handleFillAdmin = () => {
    setEmail('usmanchandio079@gmail.com');
    setPassword('AdminUsman2026!');
    setActiveTab('login');
    setError(null);
  };

  const handleFillClient = () => {
    setEmail('client@hstock.com');
    setPassword('client123');
    setActiveTab('login');
    setError(null);
  };

  // Request 6-digit verification code
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError(null);
    setOtpSending(true);
    try {
      const res = await hstockApi.sendOtp(email.trim(), activeTab === 'register' ? 'email_verification' : 'forgot_password');
      setIsOtpSent(true);
      setOtpInfoMsg(res.message || 'Verification code sent to your email.');
      if (res.devOtp) {
        setOtpCode(res.devOtp); // Auto-fill for seamless user testing
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your registered email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await hstockApi.login(email.trim(), password);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Optional OTP verify check if OTP was sent
      if (isOtpSent && otpCode.trim()) {
        try {
          await hstockApi.verifyOtp(email.trim(), otpCode.trim());
          setOtpVerified(true);
        } catch (otpErr: any) {
          setError(otpErr.message || 'Invalid verification code.');
          setLoading(false);
          return;
        }
      }

      const res = await hstockApi.register(name.trim(), email.trim(), password, phone.trim() || undefined);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otpCode.trim() || !password) {
      setError('Please enter your email, verification code, and new password.');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await hstockApi.resetPasswordWithOtp(email.trim(), otpCode.trim(), password);
      setSuccess('Password reset successfully! Please sign in with your new credentials.');
      setActiveTab('login');
      setPassword('');
      setOtpCode('');
      setIsOtpSent(false);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Security & Cloudflare Banner */}
      <div className="border-b border-slate-800/80 bg-[#0a0f1d] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-400 font-bold text-[11px]">CLOUDFLARE WAF ACTIVE</span>
            <span>&bull;</span>
            <span className="text-[11px]">256-Bit SSL Encrypted SaaS Portal</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Ray ID: <strong className="text-slate-300">5cb39-iad</strong></span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">Binance USDT (BEP20) Settlement</span>
          </div>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10">
        
        {/* Left Side: Brand Story & SaaS Value */}
        <div className="flex-1 max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-rose-500/30 text-white shrink-0 ring-1 ring-white/20">
              <ShieldCheck className="w-8 h-8 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                  HSTOCK
                </h1>
                <span className="text-xs font-sans font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  AURUM DIGITAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Professional Commercial Account Verification Platform
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Multi-Platform Social Account Verification SaaS
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Verify Instagram, TikTok, Facebook, YouTube, Threads, X (Twitter), Telegram, and GitHub account existence with high-speed official API probes.
            </p>
          </div>

          {/* Key Security Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Private Tenant Workspace</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every user receives an isolated dashboard. Your balance, history, and uploaded account lists are strictly private.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>Zero Fake Results Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Genuine HTTP status telemetry. If platform verification is unavailable or challenged, results display <strong className="text-amber-300">UNKNOWN</strong>, never fake LIVE.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Binance USDT (BEP20)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Instant blockchain deposits verified directly on BNB Smart Chain. Deposit limits strictly $1.00 &ndash; $100.00 USDT.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <CloudLightning className="w-4 h-4" />
                <span>Protected Cloud Infrastructure</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cloudflare Turnstile bot detection and real-time WAF security safeguard your API queries and wallet transactions.
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Buttons for Testing */}
          <div className="p-4 rounded-2xl bg-[#090e1b] border border-slate-800 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Quick Test Credentials &bull; Instant Access
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>👑 Fill Admin (Muhammad Usman)</span>
              </button>
              <button
                type="button"
                onClick={handleFillClient}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>👤 Fill Client (Demo User)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="w-full max-w-md bg-[#0d1424] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
          
          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('forgot');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'forgot'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Forgot
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Cloudflare Turnstile Human Verification Badge */}
          <div className="p-3 rounded-2xl bg-[#080d17] border border-cyan-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="turnstile_check"
                checked={turnstilePassed}
                onChange={(e) => setTurnstilePassed(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="turnstile_check" className="text-slate-300 text-xs cursor-pointer font-medium select-none">
                Verify you are human
              </label>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
              <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloudflare Turnstile</span>
            </div>
          </div>

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-3.5 py-3 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Password *</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-10 py-3 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !turnstilePassed}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Email Address *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsOtpSent(false);
                      }}
                      placeholder="name@example.com"
                      className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !email.includes('@')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {otpSending ? 'Sending...' : isOtpSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>

              {/* 6-Digit Email Verification Code */}
              {isOtpSent && (
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300">Enter 6-Digit Verification Code</span>
                    <span className="text-[10px] text-cyan-400 font-mono">10 min expiry</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#080d18] text-center text-sm font-mono tracking-widest text-white px-3 py-2 rounded-xl border border-cyan-500/60 focus:outline-none"
                  />
                  {otpInfoMsg && (
                    <p className="text-[10px] text-cyan-200/90 font-mono">{otpInfoMsg}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Mobile / WhatsApp (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03131664235"
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Confirm *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !turnstilePassed}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create My Account &amp; Wallet</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address to receive a secure 6-digit verification code to reset your password.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Email Address *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !email.includes('@')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {otpSending ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">6-Digit Verification Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#080d18] text-center text-sm font-mono tracking-widest text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
                {otpInfoMsg && (
                  <p className="text-[10px] text-cyan-200/90 font-mono">{otpInfoMsg}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">New Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#080d18] text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password & Sign In'}
              </button>
            </form>
          )}

          {/* Privacy & Guarantee Notice */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Official Hstock Platform</span>
            <span>&bull;</span>
            <span className="text-amber-400/90">USDT BEP20 Guaranteed</span>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-mono font-bold text-slate-400">
          HSTOCK ACCOUNT CHECKER &bull; AURUM DIGITAL
        </p>
        <p className="text-[11px] text-slate-600">
          All user workspaces, balances, and batch lists are cryptographically protected &bull; Receiving Wallet: 0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef
        </p>
      </footer>

    </div>
  );
};
