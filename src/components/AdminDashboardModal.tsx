import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Search,
  Settings,
  AlertCircle,
  Eye,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Zap,
  Key,
  Globe,
  RefreshCw,
  Play,
  CloudLightning,
  ShieldAlert,
  Activity,
  Lock,
  Server,
  Sliders,
  Check,
  BarChart3,
  Database,
  DownloadCloud,
  UploadCloud,
  LifeBuoy,
  MessageSquare,
  HelpCircle,
  Send,
  FileText,
  ExternalLink,
  Ban,
  UserCheck,
  Copy,
  Link2,
  Layers,
  Trash2
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';
import {
  PaymentRequest,
  AppUser,
  CheckBatch,
  SystemSettings,
  ApiIntegrationStatus,
  CloudflareTrafficStats,
  AdminReportData,
  SupportTicket,
  WalletTransaction,
  UserShareLink,
  DEFAULT_PLATFORM_PRICING,
  SocialPlatform
} from '../types/hstock';

type EnrichedAdminUser = AppUser & {
  batchesCount?: number;
  totalAccountsChecked?: number;
  pendingDeposits?: number;
};

interface AdminDashboardModalProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'activity' | 'settings' | 'api-keys' | 'cloudflare'>('payments');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cloudflare State
  const [cfStats, setCfStats] = useState<CloudflareTrafficStats | null>(null);
  const [cfLoading, setCfLoading] = useState(false);
  const [cfTesting, setCfTesting] = useState(false);
  const [cfTestResult, setCfTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; rayId?: string } | null>(null);
  const [cfConfig, setCfConfig] = useState({
    cloudflareEnabled: true,
    cloudflareZoneId: '',
    cloudflareApiToken: '',
    cloudflareTurnstileSiteKey: '',
    cloudflareTurnstileSecretKey: '',
    cloudflareSecurityLevel: 'medium' as 'off' | 'low' | 'medium' | 'high' | 'under_attack',
    cloudflareBotFightMode: true,
    rateLimitPerMin: 120
  });

  // Data
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<EnrichedAdminUser[]>([]);
  const [activityData, setActivityData] = useState<{
    batches: (CheckBatch & { userName?: string; userEmail?: string })[];
    transactions: WalletTransaction[];
  }>({ batches: [], transactions: [] });
  const [settings, setSettings] = useState<SystemSettings>({
    usdtWalletAddress: '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef',
    usdtNetwork: 'BNB Smart Chain (BEP20)',
    minDepositUsd: 1.0,
    maxDepositUsd: 100.0,
    usdtTokenContract: '0x55d398326f99059fF775485246999027B3197955',
    bscRpcUrl: 'https://bsc-dataseed.binance.org/',
    rateLiveness: 0.0025,
    rateDetails: 0.0035,
    youtubeApiKey: '',
    metaGraphToken: '',
    threadsToken: '',
    githubToken: ''
  });

  // API Integrations state
  const [integrations, setIntegrations] = useState<ApiIntegrationStatus[]>([]);
  const [apiKeys, setApiKeys] = useState({
    youtubeApiKey: '',
    metaGraphToken: '',
    threadsToken: '',
    githubToken: ''
  });
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});

  // Filters
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Screenshot Preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Adjust Balance modal
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<EnrichedAdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('5.00');
  const [balanceAction, setBalanceAction] = useState<'add' | 'set'>('add');

  // Individual User Details modal
  const [selectedUserDetails, setSelectedUserDetails] = useState<{
    user: AppUser;
    batches: CheckBatch[];
    payments: PaymentRequest[];
    transactions: WalletTransaction[];
  } | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  // Sharing link copy feedback & User Share Link Generator Tool state
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const publicShareUrl = 'https://ais-pre-u7hxfyproosaslinazv3h3-753235474353.asia-southeast1.run.app';
  const [shareLinks, setShareLinks] = useState<UserShareLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkCode, setNewLinkCode] = useState('');
  const [newLinkBanner, setNewLinkBanner] = useState('Official HSTOCK Store — Verify Email, Deposit USDT (BEP20), View Stored Balance & Check Records.');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [paymentsList, usersList, settingsData, integrationsList, cfStatus, activity, linksList] = await Promise.all([
        hstockApi.getAllPayments(),
        hstockApi.getAdminUsers(),
        hstockApi.getAdminSettings(),
        hstockApi.getApiIntegrations().catch(() => []),
        hstockApi.getCloudflareStatus().catch(() => null),
        hstockApi.getAdminActivity().catch(() => ({ batches: [], transactions: [] })),
        hstockApi.getAdminShareLinks().catch(() => [])
      ]);
      setPayments(paymentsList);
      setUsers(usersList);
      setSettings(settingsData);
      setIntegrations(integrationsList);
      setActivityData(activity);
      setShareLinks(linksList);
      if (cfStatus) {
        setCfStats(cfStatus);
      }
      setApiKeys({
        youtubeApiKey: settingsData.youtubeApiKey || '',
        metaGraphToken: settingsData.metaGraphToken || '',
        threadsToken: settingsData.threadsToken || '',
        githubToken: settingsData.githubToken || ''
      });
      setCfConfig({
        cloudflareEnabled: settingsData.cloudflareEnabled !== false,
        cloudflareZoneId: settingsData.cloudflareZoneId || '',
        cloudflareApiToken: settingsData.cloudflareApiToken || '',
        cloudflareTurnstileSiteKey: settingsData.cloudflareTurnstileSiteKey || '',
        cloudflareTurnstileSecretKey: settingsData.cloudflareTurnstileSecretKey || '',
        cloudflareSecurityLevel: settingsData.cloudflareSecurityLevel || 'medium',
        cloudflareBotFightMode: settingsData.cloudflareBotFightMode !== false,
        rateLimitPerMin: settingsData.rateLimitPerMin || 120
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCf = async () => {
    setCfLoading(true);
    try {
      const stats = await hstockApi.getCloudflareStatus();
      setCfStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh Cloudflare status');
    } finally {
      setCfLoading(false);
    }
  };

  const handleSaveCloudflareConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save-cf');
    setError(null);
    try {
      const res = await hstockApi.updateCloudflareConfig(cfConfig);
      setSettings(res.settings);
      const stats = await hstockApi.getCloudflareStatus();
      setCfStats(stats);
      setSuccessMsg('Cloudflare Security & Traffic Management policies saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update Cloudflare settings');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestCloudflare = async () => {
    setCfTesting(true);
    setCfTestResult(null);
    setError(null);
    try {
      const res = await hstockApi.testCloudflare();
      setCfTestResult({
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs,
        rayId: res.rayId
      });
      await handleRefreshCf();
    } catch (err: any) {
      setCfTestResult({
        success: false,
        message: err.message || 'Connection test failed'
      });
    } finally {
      setCfTesting(false);
    }
  };

  const handleTestApi = async (platformId: string) => {
    setTestingPlatform(platformId);
    setError(null);
    try {
      const res = await hstockApi.testApiIntegration(platformId);
      setTestResults((prev) => ({
        ...prev,
        [platformId]: {
          success: res.success,
          message: res.message,
          latencyMs: res.latencyMs
        }
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [platformId]: {
          success: false,
          message: err.message || 'Test failed',
          latencyMs: 0
        }
      }));
    } finally {
      setTestingPlatform(null);
    }
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save-keys');
    setError(null);
    try {
      const updated = await hstockApi.updateApiKeys(apiKeys);
      setSettings(updated);
      const freshIntegrations = await hstockApi.getApiIntegrations();
      setIntegrations(freshIntegrations);
      setSuccessMsg('API credentials updated successfully! Active engines will use official credentials.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save API keys');
    } finally {
      setActionLoading(null);
    }
  };

  // Approve Deposit & Credit Balance
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await hstockApi.approvePayment(id);
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? res.payment : p))
      );
      setSuccessMsg(`Deposit of $${res.payment.amountUsd.toFixed(2)} USDT approved and credited to ${res.user.name}'s wallet!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Re-verify on BNB Smart Chain
  const handleVerifyBsc = async (id: string) => {
    setActionLoading(`verify-${id}`);
    setError(null);
    try {
      const res = await hstockApi.verifyTxOnBlockchain(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? res.payment : p)));
      setSuccessMsg(`Blockchain check: ${res.verification?.message || res.payment.blockchainStatus}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Verification check failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Deposit
  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (e.g. Invalid TXID, Transaction reverted, Funds not received):', 'Invalid TXID / Transfer not verified on BNB Smart Chain');
    if (reason === null) return;

    setActionLoading(id);
    setError(null);
    try {
      const res = await hstockApi.rejectPayment(id, reason);
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? res : p))
      );
      setSuccessMsg('Deposit marked as REJECTED.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Adjust User Balance
  const handleSaveUserBalance = async () => {
    if (!selectedUserForBalance) return;
    const num = parseFloat(adjustAmount);
    if (isNaN(num)) return;

    try {
      const updatedUser = await hstockApi.adjustUserBalance(selectedUserForBalance.id, num, balanceAction);
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
      setSelectedUserForBalance(null);
      setSuccessMsg(
        balanceAction === 'set'
          ? `Set ${updatedUser.name}'s wallet balance to $${updatedUser.balance.toFixed(4)} USDT!`
          : `Adjusted ${updatedUser.name}'s balance (${num >= 0 ? '+' : ''}$${num.toFixed(4)})!`
      );
      setTimeout(() => setSuccessMsg(null), 3500);
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update balance');
    }
  };

  // Inspect Individual User Details
  const handleViewUserDetails = async (u: EnrichedAdminUser) => {
    setUserDetailsLoading(true);
    setError(null);
    try {
      const details = await hstockApi.getAdminUserDetails(u.id);
      setSelectedUserDetails(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Suspend or Activate User Account
  const handleToggleUserStatus = async (u: EnrichedAdminUser) => {
    const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
    setActionLoading(`status-${u.id}`);
    setError(null);
    try {
      const updated = await hstockApi.updateAdminUserStatus(u.id, nextStatus);
      setUsers((prev) => prev.map((usr) => (usr.id === updated.id ? { ...usr, ...updated } : usr)));
      setSuccessMsg(`Account for ${updated.name} is now ${updated.status.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPublicShareUrl = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 2500);
  };

  const handleCreateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim()) {
      setError('Please enter a label for this customer share link.');
      return;
    }
    setActionLoading('create-share-link');
    setError(null);
    try {
      const created = await hstockApi.createAdminShareLink({
        label: newLinkLabel.trim(),
        code: newLinkCode.trim() || undefined,
        bannerText: newLinkBanner.trim() || undefined
      });
      setShareLinks((prev) => [created, ...prev]);
      setNewLinkLabel('');
      setNewLinkCode('');
      setSuccessMsg(`Created Customer-Locked Share Link: ${publicShareUrl}/?ref=${created.code}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleShareLink = async (link: UserShareLink) => {
    setActionLoading(`toggle-link-${link.id}`);
    setError(null);
    try {
      const updated = await hstockApi.toggleAdminShareLink(link.id, !link.isActive);
      setShareLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: any) {
      setError(err.message || 'Failed to update share link');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteShareLink = async (link: UserShareLink) => {
    setActionLoading(`del-link-${link.id}`);
    setError(null);
    try {
      await hstockApi.deleteAdminShareLink(link.id);
      setShareLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete share link');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyGeneratedLink = (link: UserShareLink) => {
    const fullUrl = `${publicShareUrl}/?ref=${link.code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2500);
  };

  const handleDownloadSourceZip = async () => {
    setActionLoading('download-source-zip');
    setError(null);
    try {
      const blob = await hstockApi.downloadSourceZip();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hstock-account-checker-source.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg('Complete project source code ZIP downloaded!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to download source ZIP archive');
    } finally {
      setActionLoading(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await hstockApi.updateSettings(settings);
      setSettings(updated);
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter !== 'ALL' && p.status !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.transactionId.toLowerCase().includes(q) ||
        (p.fromAddress && p.fromAddress.toLowerCase().includes(q)) ||
        p.userName.toLowerCase().includes(q) ||
        p.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const approvedTotalUsd = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((acc, p) => acc + (p.amountUsd || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#0c1220] rounded-3xl border border-amber-500/30 shadow-2xl p-5 sm:p-7 space-y-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 font-mono font-bold">
              <span>₮</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 font-mono">
                <span>HSTOCK ADMIN CONTROLLER</span>
                <span className="text-[10px] font-sans font-bold bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Master Console
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Binance USDT (BEP20) deposit verification, user wallet controls, and system architecture.
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

        {/* Global Notifications */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Deposits</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Revenue</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ${approvedTotalUsd.toFixed(2)} USDT
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Users</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-white font-mono">{users.length}</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Receiving Wallet</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono font-bold text-amber-300 truncate" title={settings.usdtWalletAddress}>
                0xe7d3...f8ef
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">BEP20</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 min-w-[130px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Deposits ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[120px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex-1 min-w-[130px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity &amp; Share</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 min-w-[120px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'api-keys' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloudflare')}
            className={`flex-1 min-w-[120px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cloudflare' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>Cloudflare</span>
          </button>
        </div>

        {/* TAB 1: Binance USDT (BEP20) Deposit Approvals */}
        {activeTab === 'payments' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      paymentFilter === st ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'PENDING' ? `Pending (${pendingCount})` : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search TXID, Name, Email..."
                  className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs space-y-1">
                <Receipt className="w-10 h-10 mx-auto text-slate-700" />
                <p>No USDT deposit requests found matching filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((p) => {
                  const isPending = p.status === 'PENDING';
                  const isApproved = p.status === 'APPROVED';
                  const isRejected = p.status === 'REJECTED';
                  const isConfirmedOnChain = p.blockchainStatus === 'CONFIRMED';

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              ${p.amountUsd.toFixed(2)} USDT
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {p.network || 'BEP20'}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {p.userName} ({p.userEmail})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                            <span className="text-amber-300">
                              TXID: {p.transactionId.slice(0, 14)}...{p.transactionId.slice(-10)}
                            </span>
                            <span>&bull;</span>
                            <span className="text-slate-400 font-sans">
                              {new Date(p.createdAt).toLocaleString()}
                            </span>
                            {p.confirmations !== undefined && (
                              <>
                                <span>&bull;</span>
                                <span className="text-emerald-400">
                                  {p.confirmations} block confirmations
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {p.blockchainStatus && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                isConfirmedOnChain
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : p.blockchainStatus === 'MISMATCH' || p.blockchainStatus === 'FAILED'
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              BSC: {p.blockchainStatus}
                            </span>
                          )}

                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Approved &amp; Credited
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Rejected: {p.rejectionReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://bscscan.com/tx/${p.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <span>View on BscScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleVerifyBsc(p.id)}
                            disabled={actionLoading === `verify-${p.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionLoading === `verify-${p.id}` ? 'animate-spin' : ''}`} />
                            <span>Verify on BSC</span>
                          </button>
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(p.id)}
                              disabled={actionLoading === p.id}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={actionLoading === p.id}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{actionLoading === p.id ? 'Approving...' : 'Approve & Credit Balance'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Users Management */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                Total Registered Users: <strong className="text-white font-mono">{users.length}</strong>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#080d17]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101726] border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User &amp; Verification</th>
                    <th className="py-3 px-4">Role / Status</th>
                    <th className="py-3 px-4">Checks Run</th>
                    <th className="py-3 px-4">Wallet Balance</th>
                    <th className="py-3 px-4">Deposited / Spent</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {users
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-850">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{u.name}</span>
                          {u.emailVerified !== false && (
                            <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans block">{u.email}</span>
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                            u.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded block w-fit ${
                            u.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {(u.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300">
                        {u.totalAccountsChecked || 0} accts
                        <span className="text-[10px] text-slate-500 block">
                          {u.batchesCount || 0} batches
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        ${(typeof u.balance === 'number' ? u.balance : ((u as any).walletBalance || 0)).toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span>${(u.totalDeposited || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Spent: ${(u.totalSpent || 0).toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewUserDetails(u)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                            title="View Full User Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForBalance(u);
                              setBalanceAction('add');
                              setAdjustAmount('5.00');
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Balance
                          </button>

                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              disabled={actionLoading === `status-${u.id}`}
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                u.status === 'suspended'
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300'
                              }`}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Platform Activity Monitoring & Public Sharing / Custom Domain */}
        {activeTab === 'activity' && (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Public Website Sharing Link & Custom Domain Config */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#12192c] via-[#0f1728] to-[#171228] border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-black text-white">Live Public Website URL &amp; Sharing</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Share this permanent public link with customers. Visitors only see email-verified registration &amp; login, personal wallet dashboard, and paid checking &mdash; never source code or Admin settings.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadSourceZip}
                    disabled={actionLoading === 'download-source-zip'}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>{actionLoading === 'download-source-zip' ? 'Preparing ZIP...' : 'Download Source (.zip)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPublicShareUrl}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPublicLink ? '✓ Copied Link!' : 'Copy Share Link'}</span>
                  </button>
                  <a
                    href={publicShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                  >
                    <span>Open Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-mono text-amber-300 break-all select-all flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {publicShareUrl}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  HTTPS Active &bull; Chrome Ready
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <span className="font-bold text-white block">Custom Domain Option (Connect Your Own Brand Domain):</span>
                <p className="text-slate-400 leading-relaxed">
                  To attach a custom domain (e.g. <code className="text-amber-300">checker.yourdomain.com</code>), map a DNS <strong className="text-white">CNAME</strong> record in Cloudflare (Proxied / Orange Cloud ON) or Google Cloud Run Domain Mappings pointing to <code className="text-cyan-300">ais-pre-u7hxfyproosaslinazv3h3-753235474353.asia-southeast1.run.app</code> with SSL Full (Strict).
                </p>
              </div>
            </div>

            {/* User Access Share Link Generator Tool (Customer-Locked) */}
            <div className="p-5 rounded-2xl bg-[#0b1220] border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-400" />
                    <span>Customer Share Link Generator Tool (Read-Only / Paid Mode)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create trackable share links for users. Visitors can register (OTP verified), sign in, view Store Banners &amp; stored balance, and keep personal check records &mdash; they <strong className="text-rose-300">cannot</strong> edit the website or run free checks.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                  Zero Free Checks Enforced
                </span>
              </div>

              <form onSubmit={handleCreateShareLink} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Link Label *</label>
                  <input
                    type="text"
                    required
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="e.g. WhatsApp VIP Clients"
                    className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Custom Code (Opt.)</label>
                  <input
                    type="text"
                    value={newLinkCode}
                    onChange={(e) => setNewLinkCode(e.target.value.toUpperCase())}
                    placeholder="AUTO"
                    className="w-full bg-slate-900 text-xs text-amber-300 font-mono px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-5 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Store Banner Announcement</label>
                  <input
                    type="text"
                    value={newLinkBanner}
                    onChange={(e) => setNewLinkBanner(e.target.value)}
                    placeholder="Store banner text shown to users..."
                    className="w-full bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={actionLoading === 'create-share-link'}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                    <span>{actionLoading === 'create-share-link' ? 'Creating...' : 'Create Link'}</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {shareLinks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No custom share links generated yet.</p>
                ) : (
                  shareLinks.map((link) => {
                    const linkUrl = `${publicShareUrl}/?ref=${link.code}`;
                    return (
                      <div key={link.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white">{link.label}</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              link.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {link.isActive ? 'ACTIVE • CUSTOMER LOCKED' : 'PAUSED'}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                              {link.clicks || 0} opens &bull; {link.registrations || 0} registered
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-amber-300 truncate select-all">
                            {linkUrl}
                          </p>
                          {link.bannerText && (
                            <p className="text-[10px] text-slate-400 truncate">
                              Banner: {link.bannerText}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyGeneratedLink(link)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedLinkId === link.id ? '✓ Copied!' : 'Copy'}</span>
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Use HSTOCK Account Checker here (Register, Deposit & Check Live Accounts): ${linkUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            disabled={actionLoading === `toggle-link-${link.id}`}
                            onClick={() => handleToggleShareLink(link)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] cursor-pointer"
                          >
                            {link.isActive ? 'Pause' : 'Enable'}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === `del-link-${link.id}`}
                            onClick={() => handleDeleteShareLink(link)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete share link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Account Checking Activity Across All Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#080d17] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Recent Account Checking Batches ({activityData.batches.length})
                  </h5>
                  <button
                    type="button"
                    onClick={loadAllAdminData}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {activityData.batches.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No checking activity recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {activityData.batches.slice(0, 30).map((b) => (
                      <div key={b.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                              {b.platform}
                            </span>
                            <span className="font-bold text-amber-300 truncate">{b.userName || b.userId}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {b.userEmail} &bull; {b.accountsCount} accts ({b.mode}) &bull; {new Date(b.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-emerald-400 font-bold block">{b.liveCount} live</span>
                          <span className="text-[10px] text-slate-400">${(b.cost || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Wallet Transactions */}
              <div className="p-4 rounded-2xl bg-[#080d17] border border-slate-800 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Global Wallet &amp; Deposit Ledger ({activityData.transactions.length})
                </h5>

                {activityData.transactions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No transactions recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {activityData.transactions.slice(0, 30).map((t) => {
                      const isCredit = t.type === 'DEPOSIT' || t.type === 'REFUND' || (t.type === 'ADMIN_ADJUSTMENT' && t.balanceAfter >= t.balanceBefore);
                      return (
                        <div key={t.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isCredit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                {t.type}
                              </span>
                              <span className="font-bold text-white truncate">{t.userName}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {t.description} &bull; {new Date(t.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <span className={`font-bold block ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isCredit ? '+' : '-'}${Math.abs(t.amountUsd).toFixed(4)}
                            </span>
                            <span className="text-[10px] text-slate-500">Bal: ${t.balanceAfter.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: System Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300">My Binance Receiving Wallet Address (USDT BEP20) *</label>
                <input
                  type="text"
                  required
                  value={settings.usdtWalletAddress}
                  onChange={(e) => setSettings({ ...settings, usdtWalletAddress: e.target.value.trim() })}
                  className="w-full bg-slate-900 text-xs text-amber-300 font-mono px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  placeholder="0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef"
                />
                <p className="text-[11px] text-slate-500">
                  All user deposits must be sent directly to this address. Verification engine probes BNB Smart Chain for incoming USDT transfers.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Settlement Network *</label>
                <input
                  type="text"
                  required
                  value={settings.usdtNetwork}
                  onChange={(e) => setSettings({ ...settings, usdtNetwork: e.target.value })}
                  className="w-full bg-slate-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  placeholder="BNB Smart Chain (BEP20)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Minimum Deposit Limit (USDT) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  required
                  value={settings.minDepositUsd}
                  onChange={(e) => setSettings({ ...settings, minDepositUsd: parseFloat(e.target.value) || 1.0 })}
                  className="w-full bg-slate-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Maximum Deposit Limit (USDT) *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  required
                  value={settings.maxDepositUsd}
                  onChange={(e) => setSettings({ ...settings, maxDepositUsd: parseFloat(e.target.value) || 100.0 })}
                  className="w-full bg-slate-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Account Liveness Rate (USD per check) *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={settings.rateLiveness}
                  onChange={(e) => setSettings({ ...settings, rateLiveness: parseFloat(e.target.value) || 0.0025 })}
                  className="w-full bg-slate-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Account Details Rate (USD per check) *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={settings.rateDetails}
                  onChange={(e) => setSettings({ ...settings, rateDetails: parseFloat(e.target.value) || 0.0035 })}
                  className="w-full bg-slate-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: API Integrations & Real-Time Verification Engine */}
        {activeTab === 'api-keys' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Overview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Live Telemetry Engine
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">
                  Official API Integrations &amp; Real Telemetry Probes
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real authentication for Meta Graph API v19.0, YouTube Data API v3, Threads API, and GitHub REST API. When tokens are provided, the checker calls official endpoints directly with full rate limits. When omitted, high-speed permitted public endpoints verify live accounts without mock data.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAllAdminData}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* API Keys Configuration Form */}
            <form onSubmit={handleSaveApiKeys} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h5 className="text-xs font-black uppercase tracking-wider text-white">
                    Official API Credentials &amp; Access Tokens
                  </h5>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Stored securely in persistent backend config
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YouTube Data API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      YouTube Data API v3 Key
                    </label>
                    <span className="text-[10px] text-slate-400">Google Cloud Console</span>
                  </div>
                  <input
                    type="password"
                    value={apiKeys.youtubeApiKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, youtubeApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Enables exact subscriber counts, video totals, and official channel statistics.
                  </p>
                </div>

                {/* Meta Graph API Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Meta Graph API v19.0 Token
                    </label>
                    <span className="text-[10px] text-slate-400">developers.facebook.com</span>
                  </div>
                  <input
                    type="password"
                    value={apiKeys.metaGraphToken}
                    onChange={(e) => setApiKeys({ ...apiKeys, metaGraphToken: e.target.value })}
                    placeholder="EAAB..."
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Authenticates Facebook and Instagram Graph queries directly through Meta servers.
                  </p>
                </div>

                {/* Threads API Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Threads API Token
                    </label>
                    <span className="text-[10px] text-slate-400">graph.threads.net</span>
                  </div>
                  <input
                    type="password"
                    value={apiKeys.threadsToken}
                    onChange={(e) => setApiKeys({ ...apiKeys, threadsToken: e.target.value })}
                    placeholder="THQ..."
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Direct validation with Meta's official Threads Graph endpoint.
                  </p>
                </div>

                {/* GitHub Personal Access Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      GitHub Personal Access Token
                    </label>
                    <span className="text-[10px] text-slate-400">github.com/settings/tokens</span>
                  </div>
                  <input
                    type="password"
                    value={apiKeys.githubToken}
                    onChange={(e) => setApiKeys({ ...apiKeys, githubToken: e.target.value })}
                    placeholder="ghp_..."
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Raises rate limits from 60 to 5,000 requests/hour for bulk developer checks.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Leave blank to use permitted public network verifiers without tokens.
                </span>
                <button
                  type="submit"
                  disabled={actionLoading === 'save-keys'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{actionLoading === 'save-keys' ? 'Saving Credentials...' : 'Save API Credentials'}</span>
                </button>
              </div>
            </form>

            {/* Live Verification Engines & Test Suite */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Live Platform Engines &amp; 1-Click Verification Test
                </h5>
                <span className="text-[10px] text-slate-500">
                  Tests actual round-trip latency to each live service
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integrations.map((item) => {
                  const testRes = testResults[item.id];
                  const isTesting = testingPlatform === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#090f1c] border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h6 className="text-xs font-black text-white">{item.name}</h6>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  item.isKeyConfigured
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                }`}
                              >
                                {item.mode === 'AUTHENTICATED_API' ? 'Authenticated API' : 'Permitted Public API'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                              {item.officialApi}
                            </p>
                          </div>

                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ONLINE
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Test feedback banner if tested */}
                      {testRes && (
                        <div
                          className={`p-2.5 rounded-xl text-[11px] flex items-center justify-between gap-2 ${
                            testRes.success
                              ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/50 border border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <span className="truncate">{testRes.message}</span>
                          <span className="font-mono font-bold shrink-0">{testRes.latencyMs}ms</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Sample Target: <strong className="text-slate-300 font-mono">@{item.testSample}</strong>
                        </span>

                        <button
                          type="button"
                          disabled={isTesting}
                          onClick={() => handleTestApi(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isTesting
                              ? 'bg-slate-800 text-slate-400 cursor-wait'
                              : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isTesting ? 'Pinging Service...' : 'Test Connection'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Cloudflare Security & Traffic Management */}
        {activeTab === 'cloudflare' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Header / Hero Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <CloudLightning className="w-3 h-3" />
                    Cloudflare Edge Security &amp; Traffic WAF
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">
                  Edge Shield, Bot Fight Mode &amp; Traffic Throttling
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real-time security headers, sliding-window IP rate limiting, Bot Fight protection against automated scrapers, and Cloudflare Turnstile token verification for authenticated sessions.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={cfLoading}
                  onClick={handleRefreshCf}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cfLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Stats</span>
                </button>

                <button
                  type="button"
                  disabled={cfTesting}
                  onClick={handleTestCloudflare}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{cfTesting ? 'Testing Edge...' : 'Test Cloudflare WAF'}</span>
                </button>
              </div>
            </div>

            {/* Test result feedback */}
            {cfTestResult && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
                  cfTestResult.success
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cfTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{cfTestResult.message}</span>
                </div>
                {cfTestResult.rayId && (
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                    Ray: {cfTestResult.rayId} ({cfTestResult.latencyMs}ms)
                  </span>
                )}
              </div>
            )}

            {/* Live Edge Traffic Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Live Edge Traffic &amp; WAF Shield Telemetry
                </h5>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {cfStats?.status || 'ACTIVE'} &bull; Shielded
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Requests</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-white font-mono">
                      {cfStats?.totalRequests ?? 0}
                    </span>
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Inbound HTTP traffic</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">WAF Proxied</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {cfStats?.proxiedRequests ?? 0}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Cloudflare inspected</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bot Fight Blocked</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-rose-400 font-mono">
                      {cfStats?.blockedRequests ?? 0}
                    </span>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Malicious scrapers / bots</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate-Limited (429)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {cfStats?.rateLimitedRequests ?? 0}
                    </span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Abuse threshold tripped</span>
                </div>
              </div>

              {/* Edge Telemetry Footer */}
              <div className="p-3.5 rounded-2xl bg-[#090f1e] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Current Client IP:</span>
                  <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {cfStats?.clientIp || '127.0.0.1'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Detected Country:</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded text-[11px]">
                    {cfStats?.detectedCountry || 'US'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Latest CF-Ray:</span>
                  <span className="font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded text-[11px] truncate max-w-xs">
                    {cfStats?.lastRayId || 'cf-ray-simulated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cloudflare Traffic Management & WAF Form */}
            <form onSubmit={handleSaveCloudflareConfig} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <h5 className="text-xs font-black uppercase tracking-wider text-white">
                    Traffic Policies &amp; Cloudflare WAF Configuration
                  </h5>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Applied in real-time to active server middleware
                </span>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090e1b] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={cfConfig.cloudflareEnabled}
                    onChange={(e) => setCfConfig({ ...cfConfig, cloudflareEnabled: e.target.checked })}
                    className="mt-1 rounded text-orange-500 focus:ring-orange-400 h-4 w-4 bg-slate-800 border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Enable Cloudflare Edge Proxy &amp; Headers
                    </span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">
                      Injects CF-Ray, Server: cloudflare, nosniff, and SAMEORIGIN protection on all HTTP responses.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090e1b] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={cfConfig.cloudflareBotFightMode}
                    onChange={(e) => setCfConfig({ ...cfConfig, cloudflareBotFightMode: e.target.checked })}
                    className="mt-1 rounded text-orange-500 focus:ring-orange-400 h-4 w-4 bg-slate-800 border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Bot Fight Mode (Anti-Scraper Shield)
                    </span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">
                      Instantly rejects unauthorized python-requests, curl, wget, and headless automated scraping bots.
                    </span>
                  </div>
                </label>
              </div>

              {/* Rate Limiting & Security Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Security Level
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">
                      Current: {cfConfig.cloudflareSecurityLevel.toUpperCase()}
                    </span>
                  </div>
                  <select
                    value={cfConfig.cloudflareSecurityLevel}
                    onChange={(e) => setCfConfig({ ...cfConfig, cloudflareSecurityLevel: e.target.value as any })}
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-orange-400 focus:outline-none font-mono"
                  >
                    <option value="off">Off (No Edge Filtering)</option>
                    <option value="low">Low (Basic Bad-Reputation Filter)</option>
                    <option value="medium">Medium (Standard Protection)</option>
                    <option value="high">High (Strict Threat Protection)</option>
                    <option value="under_attack">Under Attack! (Aggressive Challenge)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    Controls automated threat scores and challenge frequency for incoming API callers.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Sliding Rate Limit (Requests / Min / IP)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {cfConfig.rateLimitPerMin} req/min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={20}
                      max={500}
                      step={10}
                      value={cfConfig.rateLimitPerMin}
                      onChange={(e) => setCfConfig({ ...cfConfig, rateLimitPerMin: parseInt(e.target.value) || 120 })}
                      className="flex-1 accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={cfConfig.rateLimitPerMin}
                      onChange={(e) => setCfConfig({ ...cfConfig, rateLimitPerMin: parseInt(e.target.value) || 120 })}
                      className="w-20 bg-[#080d18] text-xs text-white px-2.5 py-2 rounded-xl border border-slate-700 text-center font-mono focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Protects Account Checker APIs from denial-of-service abuse and rapid automated spamming.
                  </p>
                </div>
              </div>

              {/* Cloudflare Zone & API Token Credentials */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    Cloudflare API &amp; Turnstile Credentials (Optional Production Hook)
                  </h6>
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>dash.cloudflare.com</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Cloudflare Zone ID</label>
                    <input
                      type="text"
                      value={cfConfig.cloudflareZoneId}
                      onChange={(e) => setCfConfig({ ...cfConfig, cloudflareZoneId: e.target.value })}
                      placeholder="e.g. 023e105f4ecef8ad9ca31a8372d0c353"
                      className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:border-orange-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">From Cloudflare domain dashboard Overview.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Cloudflare API Token (Bearer)</label>
                    <input
                      type="password"
                      value={cfConfig.cloudflareApiToken}
                      onChange={(e) => setCfConfig({ ...cfConfig, cloudflareApiToken: e.target.value })}
                      placeholder="e.g. c_token_..."
                      className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:border-orange-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Zone.Zone Read + Zone.WAF Edit permissions.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Turnstile Site Key (Client)</label>
                    <input
                      type="text"
                      value={cfConfig.cloudflareTurnstileSiteKey}
                      onChange={(e) => setCfConfig({ ...cfConfig, cloudflareTurnstileSiteKey: e.target.value })}
                      placeholder="0x4AAAAAA..."
                      className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:border-orange-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Used for friction-free human verification.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Turnstile Secret Key (Server)</label>
                    <input
                      type="password"
                      value={cfConfig.cloudflareTurnstileSecretKey}
                      onChange={(e) => setCfConfig({ ...cfConfig, cloudflareTurnstileSecretKey: e.target.value })}
                      placeholder="0x4AAAAAA..."
                      className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:border-orange-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Validated via challenges.cloudflare.com/turnstile/v0/siteverify.</p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Settings are immediately persisted and enforce active edge shielding.
                </span>

                <button
                  type="submit"
                  disabled={actionLoading === 'save-cf'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{actionLoading === 'save-cf' ? 'Saving Policies...' : 'Save Cloudflare Policies'}</span>
                </button>
              </div>
            </form>

            {/* Synergistic Meta Graph API & 302 Barrier Prevention Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <h5 className="text-xs font-black uppercase tracking-wider text-white">
                  Zero Fake Results &amp; Meta Graph API v19.0 Integration
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-300 block">1. No 302 Misinterpretation</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    HTTP 302 redirects to <code className="text-amber-200">/login/?next=...</code> are classified strictly as <strong className="text-amber-300">API_BLOCKED</strong> (Login Wall) &mdash; never false LIVE or false SUSPENDED.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-300 block">2. Official Meta Graph API</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    With a Meta Graph Token set in API Keys, queries route through <code className="text-blue-200">/v19.0/instagram_oembed</code> and <code className="text-blue-200">/v19.0/oembed_page</code> with official authorization.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-300 block">3. Preserved Working Engines</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    TikTok oEmbed, Twitter/X profile validation, and YouTube Data API v3 continue operating smoothly with high accuracy and zero simulated results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Adjust User Balance Modal */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#101726] p-6 rounded-3xl border border-cyan-500/40 w-full max-w-sm space-y-4">
            <h4 className="text-sm font-bold text-white">
              Manage Balance: {selectedUserForBalance.name}
            </h4>
            <p className="text-xs text-slate-400">
              Current Balance: <strong className="text-emerald-400">${((typeof selectedUserForBalance.balance === 'number' ? selectedUserForBalance.balance : ((selectedUserForBalance as any).walletBalance || 0))).toFixed(4)}</strong>
            </p>

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setBalanceAction('add')}
                className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer ${
                  balanceAction === 'add' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Add / Deduct (+/-)
              </button>
              <button
                type="button"
                onClick={() => setBalanceAction('set')}
                className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer ${
                  balanceAction === 'set' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Set Exact ($)
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">
                {balanceAction === 'set' ? 'New Exact Balance ($)' : 'Amount to Add/Deduct ($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="5.00"
                className="w-full bg-slate-900 text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserBalance}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {balanceAction === 'set' ? 'Set Balance' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual User Details Inspector Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
          <div className="bg-[#0e1524] p-6 rounded-3xl border border-amber-500/30 w-full max-w-2xl max-h-[88vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{selectedUserDetails.user.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    ${selectedUserDetails.user.balance.toFixed(4)} USDT
                  </span>
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUserDetails.user.email} &bull; {selectedUserDetails.user.phone || 'No phone'} &bull; Joined {new Date(selectedUserDetails.user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Deposited</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">${selectedUserDetails.user.totalDeposited.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Spent</span>
                  <span className="font-mono font-bold text-slate-200 text-base">${selectedUserDetails.user.totalSpent.toFixed(4)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Check Batches</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">{selectedUserDetails.batches.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-300 uppercase text-[11px]">Deposits ({selectedUserDetails.payments.length})</h5>
                {selectedUserDetails.payments.length === 0 ? (
                  <p className="text-slate-500 text-xs">No deposits submitted.</p>
                ) : (
                  selectedUserDetails.payments.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-white">${p.amountUsd.toFixed(2)} USDT</span>
                        <span className="text-[10px] text-slate-400 block font-mono">TX: {p.transactionId.slice(0, 20)}...</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' : p.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>{p.status}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-300 uppercase text-[11px]">Recent Check Batches ({selectedUserDetails.batches.length})</h5>
                {selectedUserDetails.batches.length === 0 ? (
                  <p className="text-slate-500 text-xs">No checking batches run yet.</p>
                ) : (
                  selectedUserDetails.batches.slice(0, 10).map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-cyan-300 uppercase">{b.platform} ({b.accountsCount} accts)</span>
                        <span className="text-[10px] text-slate-500 block">{new Date(b.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="font-mono text-emerald-400">{b.liveCount} live &bull; ${b.cost.toFixed(4)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-black">
            <img src={previewImage} alt="Payment Screenshot" className="max-w-full max-h-[85vh] object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
