import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SocialPlatform, AccountCheckResult, AccountStatus } from './types/status';
import { AppUser } from './types/user';
import { checkerApi, getCategoryFromStatus } from './services/checkerApi';
import { authApi } from './services/authApi';
import { AccountInputCard } from './components/AccountInputCard';
import { ResultsTableView } from './components/ResultsTableView';
import { BudgetEstimator } from './components/BudgetEstimator';
import { InfoNoticeCard } from './components/InfoNoticeCard';
import { AuthModal } from './components/AuthModal';
import { UserAccountModal } from './components/UserAccountModal';
import {
  CheckCircle2,
  ShieldCheck,
  Activity,
  Instagram,
  Calculator,
  Share2,
  User,
  Zap,
  Gift,
  LogIn,
  UserPlus,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'instagram_checker_results_v3';

export const App: React.FC = () => {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [activeAppTab, setActiveAppTab] = useState<'checker' | 'estimator'>('checker');

  // User Authentication & Reference Link State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [detectedRefCode, setDetectedRefCode] = useState<string>('');
  const [referrerInfo, setReferrerInfo] = useState<{ id: string; name: string } | null>(null);
  const [showRefBanner, setShowRefBanner] = useState(false);
  const [bannerCopied, setBannerCopied] = useState(false);

  // Load results from localStorage on initial render
  const [results, setResults] = useState<AccountCheckResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentItem?: string } | null>(null);

  // Fetch initial user session and backend accounts
  useEffect(() => {
    let active = true;

    // 1. Fetch current authenticated user
    authApi.getMe().then((user) => {
      if (active && user) {
        setCurrentUser(user);
      }
    });

    // 2. Detect reference link query parameter (?ref=... or ?reference=...)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('reference');
    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      setDetectedRefCode(cleanRef);
      setShowRefBanner(true);

      authApi.verifyReferenceCode(cleanRef).then((res) => {
        if (active && res.valid && res.referrer) {
          setReferrerInfo(res.referrer);
        }
      });
    }

    // 3. Sync initial backend saved accounts
    checkerApi.fetchSavedAccounts().then((backendAccounts) => {
      if (active && Array.isArray(backendAccounts) && backendAccounts.length > 0) {
        setResults(backendAccounts);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Manage pause/resume/stop queue safely
  const pauseSignalRef = useRef<boolean>(false);
  const cancelSignalRef = useRef<boolean>(false);
  const activeQueueRef = useRef<{ items: string[]; platform: SocialPlatform; index: number }>({
    items: [],
    platform: 'instagram',
    index: 0,
  });

  // Persist results to localStorage whenever results change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      console.warn('Failed to persist results to localStorage', e);
    }
  }, [results]);

  // Insert or update result in state
  const upsertResult = useCallback((newResult: AccountCheckResult) => {
    setResults((prev) => {
      const existingIdx = prev.findIndex(
        (r) =>
          r.id === newResult.id ||
          (r.platform === newResult.platform &&
            r.rawInput.trim().toLowerCase() === newResult.rawInput.trim().toLowerCase())
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newResult;
        return updated;
      }
      return [newResult, ...prev];
    });
  }, []);

  // Sequential queue runner
  const processQueue = useCallback(async () => {
    const queue = activeQueueRef.current;
    if (!queue || queue.index >= queue.items.length) {
      setIsChecking(false);
      setIsPaused(false);
      setProgress(null);
      return;
    }

    setIsChecking(true);

    while (queue.index < queue.items.length) {
      if (cancelSignalRef.current) {
        setIsChecking(false);
        setIsPaused(false);
        setProgress(null);
        return;
      }

      if (pauseSignalRef.current) {
        setIsPaused(true);
        return;
      }

      const currentInput = queue.items[queue.index];
      setProgress({
        current: queue.index + 1,
        total: queue.items.length,
        currentItem: currentInput,
      });

      try {
        const checked = await checkerApi.checkAccount(currentInput, queue.platform);
        upsertResult(checked);
      } catch (err: any) {
        const fallback: AccountCheckResult = {
          id: `item-${Date.now()}-${queue.index}`,
          platform: queue.platform,
          rawInput: currentInput,
          username: currentInput,
          profileUrl: currentInput,
          targetType: 'profile',
          status: 'UNVERIFIED',
          checkedAt: new Date().toISOString(),
          details: `Verification challenged (${err.message || 'Platform rate limit'}). Correctly categorized.`,
        };
        upsertResult(fallback);
      }

      queue.index += 1;

      if (queue.index < queue.items.length && !pauseSignalRef.current && !cancelSignalRef.current) {
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    setIsChecking(false);
    setIsPaused(false);
    setProgress(null);
  }, [upsertResult]);

  // Bulk check handler
  const handleCheckAccounts = useCallback(
    (inputs: string[], selectedPlatform: SocialPlatform) => {
      pauseSignalRef.current = false;
      cancelSignalRef.current = false;
      setIsPaused(false);
      activeQueueRef.current = {
        items: inputs,
        platform: selectedPlatform,
        index: 0,
      };
      processQueue();
    },
    [processQueue]
  );

  const handlePause = () => {
    pauseSignalRef.current = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    pauseSignalRef.current = false;
    setIsPaused(false);
    processQueue();
  };

  const handleCancel = () => {
    cancelSignalRef.current = true;
    pauseSignalRef.current = false;
    setIsChecking(false);
    setIsPaused(false);
    setProgress(null);
  };

  // Recheck a single account
  const handleRefreshItem = async (item: AccountCheckResult) => {
    try {
      const updated = await checkerApi.checkAccount(item.rawInput, item.platform, item.id);
      upsertResult(updated);
    } catch (err: any) {
      console.error('Refresh item error:', err);
    }
  };

  // Recheck selected accounts
  const handleRefreshSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0 || isChecking) return;
    const itemsToRecheck = results.filter((r) => selectedIds.includes(r.id));
    if (itemsToRecheck.length === 0) return;

    setIsChecking(true);
    setProgress({ current: 0, total: itemsToRecheck.length });

    for (let i = 0; i < itemsToRecheck.length; i++) {
      const item = itemsToRecheck[i];
      setProgress({
        current: i + 1,
        total: itemsToRecheck.length,
        currentItem: item.username,
      });

      try {
        const updated = await checkerApi.checkAccount(item.rawInput, item.platform, item.id);
        upsertResult(updated);
      } catch (e) {
        console.error('Failed to recheck item:', e);
      }

      if (i < itemsToRecheck.length - 1) {
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    setIsChecking(false);
    setProgress(null);
  };

  // Retry unverified
  const handleRetryFailed = async () => {
    const unverifiedAccounts = results.filter(
      (r) => getCategoryFromStatus(r.status) === 'UNVERIFIED'
    );
    if (unverifiedAccounts.length === 0 || isChecking) return;
    handleRefreshSelected(unverifiedAccounts.map((a) => a.id));
  };

  // Delete a single account
  const handleDeleteItem = async (idToDelete: string) => {
    setResults((prev) => prev.filter((r) => r.id !== idToDelete));
    try {
      await checkerApi.deleteAccount(idToDelete);
    } catch (e) {
      console.error('Delete account error:', e);
    }
  };

  // Delete category
  const handleRemoveCategory = async (
    category: 'LIVE' | 'SUSPENDED' | 'NOT_FOUND' | 'UNVERIFIED' | 'PRIVATE'
  ) => {
    const count = results.filter((r) => getCategoryFromStatus(r.status) === category).length;
    if (count === 0) {
      alert(`There are currently no ${category} accounts to remove.`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to permanently delete all ${count} ${category} account(s)?`
      )
    ) {
      setResults((prev) => prev.filter((r) => getCategoryFromStatus(r.status) !== category));
      try {
        await checkerApi.deleteCategory(category);
      } catch (e) {
        console.error('Delete category error:', e);
      }
    }
  };

  // Delete selected
  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    setResults((prev) => prev.filter((r) => !idSet.has(r.id)));
    try {
      await checkerApi.deleteSelected(selectedIds);
    } catch (e) {
      console.error('Delete selected error:', e);
    }
  };

  // Clear all accounts
  const handleClearAll = async () => {
    if (results.length === 0) return;
    if (
      window.confirm(
        'Are you sure you want to permanently clear ALL account check results?'
      )
    ) {
      setResults([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
        await checkerApi.clearAllAccounts();
      } catch (e) {
        console.error('Clear all error:', e);
      }
    }
  };

  // Manually update status of an account & persist in backend
  const handleUpdateStatus = (id: string, newStatus: AccountStatus) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              details: `Manually verified & reclassified as ${newStatus} by user.`,
            }
          : r
      )
    );
    checkerApi.updateAccountStatus(id, newStatus);
  };

  // Export CSV
  const handleExportCsv = (itemsToExport?: AccountCheckResult[]) => {
    const data = itemsToExport && itemsToExport.length > 0 ? itemsToExport : results;
    checkerApi.exportCsv(data);
  };

  // Auth Callbacks
  const handleAuthSuccess = (user: AppUser, token: string) => {
    setCurrentUser(user);
    setShowRefBanner(false);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setIsAccountModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900">
      {/* 1. Reference Link Arrival Banner (when user enters site via ?ref=...) */}
      {showRefBanner && detectedRefCode && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white px-4 py-2.5 text-xs shadow-md relative z-40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <span className="p-1 rounded-full bg-white/20">
                <Gift className="w-4 h-4 text-amber-300" />
              </span>
              <div>
                <span className="font-bold">
                  {referrerInfo?.name ? `${referrerInfo.name} invited you!` : 'Special Invitation:'}
                </span>{' '}
                <span className="opacity-95">
                  You entered using Reference Link{' '}
                  <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-amber-200">
                    {detectedRefCode}
                  </code>
                  . Create an account now to claim <strong>+25 bonus account checks</strong>!
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1 rounded-full bg-white text-indigo-700 font-bold hover:bg-slate-100 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account &amp; Claim</span>
              </button>

              <button
                onClick={() => setShowRefBanner(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Applet Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-heading leading-tight tracking-tight">
                Social Media Account Status Checker
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Instagram, Gmail, TikTok, YouTube &amp; Facebook &bull; LIVE, SUSPENDED, NOT FOUND &amp; UNVERIFIED
              </p>
            </div>
          </div>

          {/* Right Controls: User Account, Reference Link & Engine Status */}
          <div className="flex items-center space-x-2 text-xs">
            {currentUser ? (
              <>
                {/* Reference Link Quick Share Button */}
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer"
                  title="View your personal reference link and referral network"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Reference Link</span>
                  <span className="px-1.5 py-0.2 bg-white/25 rounded text-[10px] font-mono">
                    {currentUser.referenceCode}
                  </span>
                </button>

                {/* User Account Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-semibold hidden md:inline">{currentUser.name}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                    <Zap className="w-3 h-3 fill-current" />
                    {currentUser.credits}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                  {detectedRefCode && (
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs: Account Checker vs Budget Estimator */}
        <div className="flex border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1.5 shadow-xs gap-1.5">
          <button
            type="button"
            onClick={() => setActiveAppTab('checker')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeAppTab === 'checker'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-500" />
            <span>Account Verification Checker</span>
            {results.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 dark:bg-slate-900/20 text-current">
                {results.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAppTab('estimator')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeAppTab === 'estimator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Promotion Budget Estimator</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
              New
            </span>
          </button>
        </div>

        {activeAppTab === 'checker' ? (
          <>
            {/* Account Input Card (Instagram, TikTok, Facebook, YouTube tabs with 100-test account generator) */}
            <AccountInputCard
              currentPlatform={platform}
              onSelectPlatform={(p) => setPlatform(p)}
              onCheckAccounts={handleCheckAccounts}
              isChecking={isChecking}
            />

            {/* Results & Dashboard Section */}
            <ResultsTableView
              results={results}
              isChecking={isChecking}
              isPaused={isPaused}
              progress={progress}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onRefreshItem={handleRefreshItem}
              onRefreshSelected={handleRefreshSelected}
              onRetryFailed={handleRetryFailed}
              onDeleteItem={handleDeleteItem}
              onDeleteSelected={handleDeleteSelected}
              onRemoveCategory={handleRemoveCategory}
              onClearAll={handleClearAll}
              onExportCsv={handleExportCsv}
              onUpdateStatus={handleUpdateStatus}
            />
          </>
        ) : (
          /* Budget Estimator Component */
          <BudgetEstimator />
        )}

        {/* Verification Standards & Accuracy Notice */}
        <InfoNoticeCard />
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            Social Media Account Checker &bull; Reference Link System &bull; Live &amp; Accurate Categorization
          </p>
          <div className="flex items-center space-x-3 font-mono text-[11px] font-medium">
            <span>LIVE</span>
            <span>&bull;</span>
            <span>SUSPENDED</span>
            <span>&bull;</span>
            <span>NOT FOUND</span>
            <span>&bull;</span>
            <span>UNVERIFIED</span>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {/* Auth Modal (Register / Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialReferenceCode={detectedRefCode}
      />

      {/* User Account & Reference Link Modal */}
      {currentUser && isAccountModalOpen && (
        <UserAccountModal
          user={currentUser}
          onClose={() => setIsAccountModalOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
