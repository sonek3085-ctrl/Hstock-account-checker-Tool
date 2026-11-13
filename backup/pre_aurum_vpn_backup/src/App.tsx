import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppUser,
  SocialPlatform,
  CheckMode,
  AccountResult,
  CheckBatch,
  SystemSettings,
  DEFAULT_SETTINGS,
  PLATFORM_INFO
} from './types/hstock';
import { hstockApi } from './services/hstockApi';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { BinanceUsdtDepositModal } from './components/BinanceUsdtDepositModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { VerificationProgress } from './components/VerificationProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { HistoryModal } from './components/HistoryModal';
import { StatsModal } from './components/StatsModal';
import { ShareResultsModal } from './components/ShareResultsModal';
import { SharedResultsView } from './components/SharedResultsView';
import { UserDashboardView } from './components/UserDashboardView';
import { AuthLandingPortal } from './components/AuthLandingPortal';
import {
  Instagram,
  Facebook,
  Video,
  Twitter,
  AtSign,
  Mail,
  CheckCircle2,
  Search,
  Sparkles,
  Upload,
  Trash2,
  Play,
  AlertCircle,
  Zap,
  ShieldCheck,
  Infinity,
  Youtube,
  Github,
  Send,
  LayoutDashboard,
  Share2,
  Wallet,
  History,
  ShieldAlert,
  Copy,
  Layers,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';

export function App() {
  // Check URL for public view-only shared report (?share=<id>)
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('share');
      if (sId) {
        setShareId(sId);
      }
    }
  }, []);

  // View state: 'checker' | 'dashboard'
  const [activeView, setActiveView] = useState<'checker' | 'dashboard'>('checker');

  // Current Authenticated User Session
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);

  // Platform & Check Mode
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [mode, setMode] = useState<CheckMode>('liveness');

  // Input text starts clean so user enters their actual target accounts
  const [inputText, setInputText] = useState<string>('');

  // Results & Verification State
  const [results, setResults] = useState<AccountResult[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentItem?: string;
  } | null>(null);

  // User History
  const [history, setHistory] = useState<CheckBatch[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Error & Alert
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Refs for pause/cancel
  const pauseRef = useRef<boolean>(false);
  const cancelRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);

  // Load initial session, settings, and pending payments count
  useEffect(() => {
    hstockApi.getMe()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          if (user.role === 'admin') {
            hstockApi.getAllPayments().then((list) => {
              setPendingPaymentsCount(list.filter((p) => p.status === 'PENDING').length);
            }).catch(() => {});
          }
        }
      })
      .finally(() => {
        setIsInitialAuthLoading(false);
      });

    hstockApi.getSettings().then(setSettings);
  }, []);

  // Reload history when user changes
  useEffect(() => {
    if (currentUser) {
      hstockApi.getMyHistory().then(setHistory).catch(() => {});
    } else {
      setHistory([]);
    }
  }, [currentUser]);

  const handleRefreshUser = async () => {
    const fresh = await hstockApi.getMe();
    if (fresh) {
      setCurrentUser(fresh);
      if (fresh.role === 'admin') {
        const list = await hstockApi.getAllPayments();
        setPendingPaymentsCount(list.filter((p) => p.status === 'PENDING').length);
      }
    }
  };

  const handleLogout = async () => {
    await hstockApi.logout();
    setCurrentUser(null);
  };

  // Input parsing & duplicate detection
  const rawLines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const uniqueLines = Array.from(new Set(rawLines.map((l) => l.toLowerCase())));
  const duplicateCount = rawLines.length - uniqueLines.length;

  const isAdmin = currentUser?.role === 'admin';
  const count = rawLines.length;
  const isOverLimit = count > 2000;

  // Rate determination
  const pricing = settings.platformPricing || {};
  const platformRates = pricing[platform] || pricing['auto'] || { liveness: settings.rateLiveness, details: settings.rateDetails };
  const unitRate = mode === 'details' ? (platformRates.details || settings.rateDetails) : (platformRates.liveness || settings.rateLiveness);
  const standardCost = +(count * unitRate).toFixed(4);
  const totalCost = isAdmin ? 0 : standardCost;
  const userBalance = currentUser?.balance || 0;
  const hasInsufficientBalance = !isAdmin && count > 0 && userBalance < standardCost;

  const handleLoadSample = () => {
    const samples = PLATFORM_INFO[platform].sample;
    setInputText(samples.join('\n'));
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const existing = inputText.trim() ? inputText.trim() + '\n' : '';
        setInputText(existing + content.trim());
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start checking batch
  const handleStartCheck = useCallback(async () => {
    setErrorBanner(null);

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (rawLines.length === 0) return;
    if (rawLines.length > 2000) {
      setErrorBanner('Maximum 2,000 accounts allowed per single check.');
      return;
    }

    if (!isAdmin && userBalance < standardCost) {
      setIsDepositOpen(true);
      return;
    }

    setIsChecking(true);
    setIsPaused(false);
    pauseRef.current = false;
    cancelRef.current = false;

    try {
      const res = await hstockApi.runBatchCheck({
        accounts: rawLines,
        platform,
        mode
      });

      setCurrentUser(res.user);
      setHistory((prev) => [res.batch, ...prev]);
      setResults((prev) => [...res.batch.results, ...prev]);
    } catch (err: any) {
      setErrorBanner(err.message || 'Verification process failed.');
    } finally {
      setIsChecking(false);
      setIsPaused(false);
      setProgress(null);
    }
  }, [currentUser, isAdmin, mode, platform, rawLines, standardCost, userBalance]);

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(settings.usdtWalletAddress || '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef');
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  const handleUpdateResult = (id: string, newStatus: any, note?: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              details: note || (newStatus === 'ACCOUNT_FOUND' ? 'Verified LIVE by browser probe.' : 'Confirmed NOT FOUND (404) by browser probe.')
            }
          : r
      )
    );
  };

  // If viewing a shared report link
  if (shareId) {
    return (
      <SharedResultsView
        shareId={shareId}
        onExit={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
          }
          setShareId(null);
        }}
      />
    );
  }

  // Session check in progress
  if (isInitialAuthLoading) {
    return (
      <div className="min-h-screen bg-[#080d18] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-300">Connecting Secure SaaS Session...</p>
        </div>
      </div>
    );
  }

  // Mandatory Authentication Gate: Unauthenticated visitors ONLY see Registration & Login portal
  if (!currentUser) {
    return (
      <AuthLandingPortal
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          handleRefreshUser();
        }}
      />
    );
  }

  const platformsList = [
    { id: 'auto', name: 'Auto-Detect', icon: Zap, color: 'from-amber-400 to-orange-500', border: 'border-amber-400 ring-2 ring-amber-400/25 bg-amber-500/10' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-rose-600', border: 'border-pink-500 ring-2 ring-pink-500/25 bg-pink-500/10' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'from-teal-400 to-cyan-500', border: 'border-cyan-400 ring-2 ring-cyan-400/25 bg-cyan-500/10' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-indigo-600', border: 'border-blue-500 ring-2 ring-blue-500/25 bg-blue-500/10' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-rose-700', border: 'border-red-500 ring-2 ring-red-500/25 bg-red-500/10' },
    { id: 'threads', name: 'Threads', icon: AtSign, color: 'from-purple-500 to-pink-500', border: 'border-purple-400 ring-2 ring-purple-400/25 bg-purple-500/10' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'from-sky-400 to-blue-500', border: 'border-sky-400 ring-2 ring-sky-400/25 bg-sky-500/10' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'from-blue-500 to-cyan-400', border: 'border-blue-400 ring-2 ring-blue-400/25 bg-blue-500/10' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'from-slate-400 to-slate-200', border: 'border-slate-300 ring-2 ring-slate-300/25 bg-slate-500/10' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'from-red-500 to-amber-500', border: 'border-red-400 ring-2 ring-red-400/25 bg-red-500/10' }
  ] as const;

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Header */}
      <Header
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenTopUp={() => setIsDepositOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAdmin={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setIsAdminOpen(true);
          }
        }}
        pendingPaymentsCount={pendingPaymentsCount}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          <div className="p-3 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => setActiveView('checker')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                activeView === 'checker'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4 stroke-[2.3]" />
              <span>Account Checker</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setActiveView('dashboard');
                }
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2.3]" />
              <span>User Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Deposit USDT</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                BEP20
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Check History</span>
              </div>
              {history.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full p-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-2.5"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share Results</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="w-full p-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 transition-all cursor-pointer flex items-center justify-between mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Admin Panel</span>
                </div>
                {pendingPaymentsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {pendingPaymentsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Quick USDT BEP20 Wallet Address Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101726] to-[#0c1220] border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                USDT Receiving Wallet
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                BEP20
              </span>
            </div>

            <p className="font-mono text-[11px] text-amber-300 break-all select-all leading-tight bg-slate-950 p-2 rounded-xl border border-slate-800">
              {settings.usdtWalletAddress || '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef'}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Min: $1 &bull; Max: $100</span>
              <button
                type="button"
                onClick={handleCopyWalletAddress}
                className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                {copiedWallet ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full space-y-6">
          
          {/* Error Banner */}
          {errorBanner && (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorBanner}</span>
              </div>
              <button
                onClick={() => setErrorBanner(null)}
                className="p-1 rounded-lg hover:bg-rose-900 text-rose-300 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* VIEW: USER DASHBOARD */}
          {activeView === 'dashboard' && currentUser && (
            <UserDashboardView
              user={currentUser}
              history={history}
              onOpenDeposit={() => setIsDepositOpen(true)}
              onSelectPlatform={(p) => {
                setPlatform(p);
                setActiveView('checker');
              }}
              onViewHistoryBatch={(b) => {
                setResults(b.results);
                setPlatform(b.platform);
                setMode(b.mode);
                setActiveView('checker');
              }}
            />
          )}

          {/* VIEW: ACCOUNT CHECKER */}
          {activeView === 'checker' && (
            <>
              {/* Commercial Hero & Binance USDT Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12192c] via-[#0f1728] to-[#161226] border border-slate-800 p-5 sm:p-7 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        HSTOCK Enterprise Engine
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Binance USDT (BEP20) Blockchain Settlement
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      Multi-Platform Social &amp; Handle Existence Verifier
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Check up to 2,000 accounts per batch across <strong>Instagram, TikTok, Facebook, YouTube, Threads, X (Twitter), Telegram, and GitHub</strong> with zero fabricated mock results.
                    </p>
                  </div>

                  {/* Binance USDT Action Card */}
                  <div className="flex items-center gap-4 bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl shadow-xl shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-black text-2xl shrink-0">
                      ₮
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">USDT (BEP20) Settlement</span>
                      </div>
                      <p className="text-xs font-black text-white">Deposit: $1.00 &ndash; $100.00</p>
                      <button
                        type="button"
                        onClick={() => setIsDepositOpen(true)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        Add Balance via BEP20 &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Platform Selector (8 Platforms + Auto-Detect) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    1. Select Target Social Platform ({platformsList.length} Available)
                  </label>
                  <span className="text-xs text-slate-500">
                    Active: <strong className="text-amber-400 capitalize">{platform}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10 gap-2.5">
                  {platformsList.map((p) => {
                    const Icon = p.icon;
                    const isSelected = platform === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={isChecking}
                        onClick={() => setPlatform(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? `${p.border} shadow-xl shadow-black/40`
                            : 'bg-[#101726] border-slate-800 hover:border-slate-700 hover:bg-[#131c2e]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSelected ? `bg-gradient-to-tr ${p.color} text-white shadow-md` : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {PLATFORM_INFO[p.id]?.tag || 'PRO'}
                          </span>
                        </div>

                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {p.name}
                          </p>
                          <p className="text-[9px] text-slate-500 truncate">
                            {PLATFORM_INFO[p.id]?.description ? 'Verified logic' : 'Real-time probe'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Check Mode & Pricing */}
              <div className="space-y-2.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  2. Choose Verification Service Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Liveness */}
                  <button
                    type="button"
                    disabled={isChecking}
                    onClick={() => setMode('liveness')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      mode === 'liveness'
                        ? 'bg-gradient-to-br from-emerald-950/40 via-[#101927] to-[#0c1220] border-emerald-500 ring-2 ring-emerald-500/25 shadow-xl'
                        : 'bg-[#101726] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            mode === 'liveness' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5 stroke-[2.3]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">✓ Account Existence &amp; Liveness</h3>
                          <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                            Account Found &middot; Available / Not Found (404) &middot; Banned
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-white font-mono">
                          ${(platformRates.liveness || settings.rateLiveness).toFixed(4)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/account</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-300 font-medium">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        Ultra-fast response time
                      </span>
                      <span className="text-slate-500">200 OK / 404 existence</span>
                    </div>
                  </button>

                  {/* Details */}
                  <button
                    type="button"
                    disabled={isChecking}
                    onClick={() => setMode('details')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      mode === 'details'
                        ? 'bg-gradient-to-br from-cyan-950/40 via-[#101927] to-[#0c1220] border-cyan-400 ring-2 ring-cyan-400/25 shadow-xl'
                        : 'bg-[#101726] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            mode === 'details' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Search className="w-5 h-5 stroke-[2.3]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">🔍 Account Details &amp; Telemetry</h3>
                          <p className="text-xs text-cyan-400/95 font-medium mt-0.5">
                            Name &middot; Followers &middot; Posts &middot; Verification
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-white font-mono">
                          ${(platformRates.details || settings.rateDetails).toFixed(4)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/account</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-300 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Public profile telemetry where supported
                      </span>
                      <span className="text-slate-500">Authentic data only</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Account Input Box */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0e1524] border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Accounts (one per line, max 2,000)</span>
                      {duplicateCount > 0 && (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {duplicateCount} duplicates detected
                        </span>
                      )}
                      {isOverLimit && (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Max 2000 limit exceeded
                        </span>
                      )}
                    </label>
                    <p className="text-xs text-slate-400">
                      Enter usernames, @handles, or URLs for {PLATFORM_INFO[platform]?.name || platform}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isChecking}
                      onClick={handleLoadSample}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Sample</span>
                    </button>

                    <button
                      type="button"
                      disabled={isChecking}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload TXT/CSV</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {count > 0 && (
                      <button
                        type="button"
                        disabled={isChecking}
                        onClick={handleClear}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
                        title="Clear input"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 focus-within:border-amber-400 bg-[#080d17]">
                  <textarea
                    rows={7}
                    disabled={isChecking}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={PLATFORM_INFO[platform]?.placeholder || 'Enter usernames or profile URLs...'}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 font-mono p-4 focus:outline-none resize-y min-h-[160px]"
                  />
                </div>

                {/* Bottom Toolbar & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div>
                      Total Accounts: <strong className="text-white font-mono">{count}</strong>
                    </div>
                    <span>&bull;</span>
                    <div>
                      Rate: <strong className="text-white font-mono">${unitRate.toFixed(4)}</strong>
                    </div>
                    <span>&bull;</span>
                    <div>
                      Estimated Cost:{' '}
                      <strong className={`font-mono ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ${totalCost.toFixed(4)} USDT {isAdmin && '(Admin Free)'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasInsufficientBalance && (
                      <button
                        type="button"
                        onClick={() => setIsDepositOpen(true)}
                        className="text-xs text-amber-400 underline font-bold cursor-pointer"
                      >
                        + Add Funds (USDT)
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isChecking || count === 0 || isOverLimit}
                      onClick={handleStartCheck}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{isChecking ? 'Verifying...' : `Start Verification (${count})`}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Results Dashboard */}
              <ResultsDashboard
                results={results}
                isChecking={isChecking}
                onUpdateResult={handleUpdateResult}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onClearResults={() => setResults([])}
              />
            </>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono font-bold text-slate-400">HSTOCK Account Checker</span>
          <span>&bull;</span>
          <span>Binance USDT (BEP20) Settlement</span>
          <span>&bull;</span>
          <span>Cloudflare Edge Protected</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Receiving Wallet: <span className="font-mono text-slate-400">{settings.usdtWalletAddress || '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef'}</span> &bull; Deposit Limits: $1.00 &ndash; $100.00 USDT
        </p>
      </footer>

      {/* Modals */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(u) => {
            setCurrentUser(u);
            handleRefreshUser();
          }}
        />
      )}

      {isDepositOpen && (
        <BinanceUsdtDepositModal
          user={currentUser}
          settings={settings}
          onClose={() => setIsDepositOpen(false)}
          onDepositSubmitted={handleRefreshUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {isAdminOpen && (
        <AdminDashboardModal
          onClose={() => setIsAdminOpen(false)}
          onRefreshData={handleRefreshUser}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal
          history={history as any}
          onClose={() => setIsHistoryOpen(false)}
          onLoadBatch={(b) => {
            setResults(b.results as any);
            setPlatform(b.platform);
            setMode(b.mode);
            setActiveView('checker');
            setIsHistoryOpen(false);
          }}
        />
      )}

      {isStatsOpen && (
        <StatsModal
          history={history as any}
          wallet={{
            balance: currentUser?.balance || 0,
            totalDeposited: currentUser?.totalDeposited || 0,
            totalSpent: currentUser?.totalSpent || 0,
            totalChecks: history.reduce((acc, b) => acc + b.accountsCount, 0)
          }}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {isShareModalOpen && (
        <ShareResultsModal
          currentResults={results}
          platform={platform}
          mode={mode}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

    </div>
  );
}

export default App;
