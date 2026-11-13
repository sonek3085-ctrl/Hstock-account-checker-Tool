import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart3,
  DollarSign,
  UserCog,
  Mail,
  Phone,
  Lock,
  Save,
  FileSpreadsheet
} from 'lucide-react';
import { AppUser, CheckBatch, WalletTransaction, PaymentRequest, SocialPlatform } from '../types/hstock';
import { hstockApi } from '../services/hstockApi';

interface UserDashboardViewProps {
  user: AppUser;
  history: CheckBatch[];
  onOpenDeposit: () => void;
  onSelectPlatform: (platform: SocialPlatform) => void;
  onViewHistoryBatch: (batch: CheckBatch) => void;
  onProfileUpdated?: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  history,
  onOpenDeposit,
  onSelectPlatform,
  onViewHistoryBatch,
  onProfileUpdated
}) => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Profile Management state
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setProfileName(user.name || '');
    setProfilePhone(user.phone || '');
  }, [user.name, user.phone]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      hstockApi.getMyPayments().catch(() => []),
      hstockApi.getMyTransactions().catch(() => [])
    ])
      .then(([p, t]) => {
        setPayments(p);
        setTransactions(t);
      })
      .finally(() => setLoading(false));
  }, [user.balance, history.length]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!profileName.trim()) {
      setProfileMsg({ type: 'error', text: 'Full name cannot be empty.' });
      return;
    }

    if (newPassword || currentPassword) {
      if (!currentPassword) {
        setProfileMsg({ type: 'error', text: 'Enter your current password to set a new password.' });
        return;
      }
      if (newPassword.length < 6) {
        setProfileMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setProfileMsg({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await hstockApi.updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        ...(newPassword ? { currentPassword, newPassword } : {})
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setProfileMsg({ type: 'success', text: res.message || 'Profile updated successfully.' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const totalChecks = history.reduce((acc, b) => acc + (b.accountsCount || 0), 0);
  const totalLive = history.reduce((acc, b) => acc + (b.liveCount || 0), 0);
  const totalDead = history.reduce((acc, b) => acc + (b.deadCount || 0), 0);
  const successRate = totalChecks > 0 ? ((totalLive / totalChecks) * 100).toFixed(1) : '100';

  const userBalance = typeof user.balance === 'number' ? user.balance : (Number((user as any)?.walletBalance) || 0);
  const userDeposited = typeof user.totalDeposited === 'number' ? user.totalDeposited : 0;
  const userSpent = typeof user.totalSpent === 'number' ? user.totalSpent : 0;

  // Account Recovery Code State
  const [activeRecoveryCode, setActiveRecoveryCode] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);

  const handleSendRecoveryCode = async () => {
    setRecoveryLoading(true);
    setRecoveryMsg(null);
    try {
      const res = await hstockApi.sendRecoveryCode(user.email);
      setActiveRecoveryCode(res.recoveryCode || null);
      setRecoveryMsg(`Recovery code generated and sent to ${user.email} (Valid for 15 minutes).`);
    } catch (err: any) {
      setRecoveryMsg(err.message || 'Failed to dispatch recovery code.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCopyRecoveryCode = () => {
    if (!activeRecoveryCode) return;
    navigator.clipboard.writeText(activeRecoveryCode);
    setRecoveryCopied(true);
    setTimeout(() => setRecoveryCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Wallet Balance Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12192c] via-[#0f1728] to-[#181329] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Individual Client Wallet
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                BEP20 Settlement Active
              </span>
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                Available Wallet Balance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  ${userBalance.toFixed(4)}
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">USDT</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xl">
              Pay-as-you-go verification balance. Charges are deducted transparently per verified check. Admin-guaranteed zero charge for unreachable checks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenDeposit}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Funds (USDT BEP20)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Security & Recovery Code Dispatch Card */}
      <div className="p-5 rounded-2xl bg-[#0f1728] border border-amber-500/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Emergency Account Recovery Code</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  15-Min TTL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate and send a 6-digit cryptographic recovery code to <strong className="text-slate-200">{user.email}</strong> to reset credentials or verify account ownership.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendRecoveryCode}
            disabled={recoveryLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{recoveryLoading ? 'Generating Code...' : 'Send Recovery Code'}</span>
          </button>
        </div>

        {recoveryMsg && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            {recoveryMsg}
          </p>
        )}

        {activeRecoveryCode && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Active Recovery Code:</span>
              <span className="font-mono text-xl font-black text-amber-300 tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/30">
                {activeRecoveryCode}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">(Valid for 15 mins)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRecoveryCode}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
              >
                {recoveryCopied ? '✓ Copied' : 'Copy Code'}
              </button>
              <a
                href={`https://wa.me/923131664235?text=${encodeURIComponent(
                  `Hello Support, my HSTOCK registered email is ${user.email}. My recovery code is: ${activeRecoveryCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                WhatsApp Backup
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0e1524] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Deposited</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ${userDeposited.toFixed(2)}
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Lifetime USDT credited</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1524] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
              ${userSpent.toFixed(4)}
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Verified batch deductions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1524] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Checks Run</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {totalChecks.toLocaleString()}
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Across 8 platforms</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1524] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Found / Live Rate</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {successRate}%
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{totalLive} live accounts</span>
        </div>
      </div>

      {/* Account Checking Platform Fast Launchers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Account Checking Modules
          </h3>
          <span className="text-[11px] text-slate-500">Select any platform to launch verifier</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {(
            [
              { id: 'instagram', name: 'Instagram', tag: 'IG Pro', color: 'from-pink-500 to-rose-600' },
              { id: 'tiktok', name: 'TikTok', tag: 'TT Fast', color: 'from-teal-400 to-cyan-500' },
              { id: 'facebook', name: 'Facebook', tag: 'FB Graph', color: 'from-blue-600 to-indigo-600' },
              { id: 'youtube', name: 'YouTube', tag: 'YT Channel', color: 'from-red-600 to-rose-700' },
              { id: 'threads', name: 'Threads', tag: 'Threads', color: 'from-purple-500 to-pink-500' },
              { id: 'twitter', name: 'X (Twitter)', tag: 'X Live', color: 'from-sky-400 to-blue-500' },
              { id: 'telegram', name: 'Telegram', tag: 'TG Direct', color: 'from-blue-500 to-cyan-400' },
              { id: 'github', name: 'GitHub', tag: 'GH API', color: 'from-slate-400 to-slate-200' }
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlatform(p.id)}
              className="p-3 rounded-2xl bg-[#0e1524] border border-slate-800 hover:border-slate-700 hover:bg-[#121a2c] text-left transition-all cursor-pointer flex flex-col justify-between h-20 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  {p.name}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {p.tag}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Start Check</span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Recent Checking Batches & Recent Deposits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Checking History */}
        <div className="p-5 rounded-3xl bg-[#0e1524] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Recent Checking Batches</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">{history.length} batches</span>
          </div>

          {history.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-1">
              <Layers className="w-8 h-8 mx-auto text-slate-700" />
              <p>No account check batches yet.</p>
              <p className="text-[11px] text-slate-600">Start by entering usernames on any platform.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {history.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onViewHistoryBatch(b)}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase font-mono text-[11px]">
                        {b.platform}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {b.accountsCount} accounts &bull; {b.mode}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {new Date(b.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {b.liveCount} live
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ${b.cost.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent USDT Deposits */}
        <div className="p-5 rounded-3xl bg-[#0e1524] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Recent USDT Deposits</h4>
            </div>
            <button
              type="button"
              onClick={onOpenDeposit}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              + Deposit
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-1">
              <Wallet className="w-8 h-8 mx-auto text-slate-700" />
              <p>No deposit history found.</p>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="text-xs text-amber-400 underline font-semibold mt-1 cursor-pointer"
              >
                Deposit USDT (BEP20) now
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {payments.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        ${p.amountUsd.toFixed(2)} USDT
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {p.network || 'BEP20'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      TX: {p.transactionId.slice(0, 12)}...
                    </p>
                  </div>

                  <a
                    href={`https://bscscan.com/tx/${p.transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-cyan-300"
                    title="View on BscScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Wallet Transaction Ledger & My Profile Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Wallet Transaction History Ledger */}
        <div className="p-5 rounded-3xl bg-[#0e1524] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Transaction History Ledger</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">{transactions.length} entries</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 text-xs">Loading ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-1">
              <Receipt className="w-8 h-8 mx-auto text-slate-700" />
              <p>No wallet transactions recorded yet.</p>
              <p className="text-[11px] text-slate-600">Deposits and account verification charges appear here.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {transactions.slice(0, 20).map((t) => {
                const isCredit = t.type === 'DEPOSIT' || t.type === 'REFUND' || (t.type === 'ADMIN_ADJUSTMENT' && t.balanceAfter >= t.balanceBefore);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            isCredit
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {t.type}
                        </span>
                        <span className="text-[11px] text-slate-300 truncate">{t.description}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(t.timestamp).toLocaleString()} &bull; Bal: ${t.balanceBefore.toFixed(4)} &rarr; ${t.balanceAfter.toFixed(4)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right font-mono font-bold">
                      <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                        {isCredit ? '+' : '-'}${Math.abs(t.amountUsd).toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Profile & Account Settings */}
        <form onSubmit={handleSaveProfile} className="p-5 rounded-3xl bg-[#0e1524] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Profile &amp; Account Information</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {user.emailVerified !== false ? '✓ Email Verified' : 'Pending Verification'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Registered Email</span>
              <span className="text-slate-200 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {user.email}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Account Status</span>
              <span className="text-emerald-400 font-mono font-bold mt-0.5 block">
                {user.role.toUpperCase()} &bull; {(user.status || 'active').toUpperCase()}
              </span>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                placeholder="Your Full Name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">WhatsApp / Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-white pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Change Password (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6)"
                className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-mono">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
