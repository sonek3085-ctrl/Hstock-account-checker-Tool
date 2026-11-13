import React, { useState, useEffect } from 'react';
import { ludoApi } from '../services/ludoApi';
import { PlayerProfile, LudoSettings } from '../types/ludo';
import {
  ShieldAlert,
  Users,
  Coins,
  Tv,
  Gamepad2,
  Search,
  Sliders,
  LogOut,
  X,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface LudoAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LudoAdminDashboard: React.FC<LudoAdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('aurum_admin_token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [activeTab, setActiveTab] = useState<'STATS' | 'PLAYERS' | 'MATCHES' | 'SETTINGS'>('STATS');
  const [stats, setStats] = useState<any>(null);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<LudoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Adjustment Modal
  const [adjustingPlayer, setAdjustingPlayer] = useState<PlayerProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      loadDashboardData();
    }
  }, [isOpen, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const adminToken = await ludoApi.adminLogin(password);
      sessionStorage.setItem('aurum_admin_token', adminToken);
      setToken(adminToken);
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('aurum_admin_token');
    setToken(null);
  };

  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [statsData, playersData, matchesData] = await Promise.all([
        ludoApi.getAdminStats(token),
        ludoApi.getAdminPlayers(token, searchQuery),
        ludoApi.getAdminMatches(token),
      ]);
      setStats(statsData);
      setPlayers(playersData);
      setMatches(matchesData);
      if (statsData.settings) setSettings(statsData.settings);
    } catch (err: any) {
      if (err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const list = await ludoApi.getAdminPlayers(token, searchQuery);
      setPlayers(list);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinAdjustment = async () => {
    if (!token || !adjustingPlayer) return;
    setIsAdjusting(true);
    try {
      await ludoApi.adjustPlayerCoins(token, adjustingPlayer.id, adjustAmount, adjustReason || 'Admin adjustment');
      setAdjustingPlayer(null);
      setAdjustReason('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Adjustment failed');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;
    try {
      await ludoApi.updateAdminSettings(token, settings);
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-[#0b0c12] border border-amber-500/40 shadow-2xl text-white flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-800 bg-[#10121a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-heading font-black text-base text-white tracking-wide">
                AURUM LUDO Admin Panel
              </h2>
              <p className="text-[11px] text-slate-400">
                Authoritative Game Engine & Virtual Economy Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!token ? (
          /* Login Gate */
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Administrator Access
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Enter your secure admin key to manage players, virtual currency, and match telemetry.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password (e.g. aass1100$)"
                  className="w-full bg-[#13151f] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !password}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs tracking-wider uppercase rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? 'Verifying...' : 'Unlock Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Tab Bar */}
            <div className="flex border-b border-slate-800 bg-[#090a10] px-4 text-xs font-bold">
              {[
                { id: 'STATS', label: 'Overview', icon: Tv },
                { id: 'PLAYERS', label: 'Players & Coins', icon: Users },
                { id: 'MATCHES', label: 'Match History', icon: Gamepad2 },
                { id: 'SETTINGS', label: 'Game Settings', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Main Tabs */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {activeTab === 'STATS' && stats && (
                <div className="space-y-5">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-[#12141e] border border-slate-800">
                      <span className="text-[11px] text-slate-400">Total Players</span>
                      <p className="text-xl font-heading font-black text-white mt-1">
                        {stats.totalUsers}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-slate-800">
                      <span className="text-[11px] text-slate-400">Active Rooms</span>
                      <p className="text-xl font-heading font-black text-emerald-400 mt-1">
                        {stats.activeRooms}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-slate-800">
                      <span className="text-[11px] text-slate-400">Completed Games</span>
                      <p className="text-xl font-heading font-black text-amber-400 mt-1">
                        {stats.completedMatches}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-slate-800">
                      <span className="text-[11px] text-slate-400">Rewarded Ads</span>
                      <p className="text-xl font-heading font-black text-cyan-400 mt-1">
                        {stats.rewardedAdsWatched}
                      </p>
                    </div>
                  </div>

                  {/* Economy Summary */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-[#12141e] border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-amber-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Total Virtual Coins Circulating
                        </h4>
                        <p className="text-xs text-slate-400">
                          Entertainment credits across all active accounts
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-mono font-black text-amber-300">
                      {stats.totalCoinsCirculating?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'PLAYERS' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search players by name or ID..."
                        className="w-full bg-[#12141f] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={loadDashboardData}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </form>

                  {/* Player List */}
                  <div className="space-y-2">
                    {players.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-[#12141f] border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                            {p.avatar === 'king' ? '🤴' : p.avatar === 'queen' ? '👸' : p.avatar === 'tiger' ? '🐯' : '👑'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              {p.name}
                              <span className="text-[10px] text-slate-400 font-mono">({p.id})</span>
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>Matches: {p.stats?.matchesPlayed || 0}</span>
                              <span>Wins: {p.stats?.wins || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            {p.coins.toLocaleString()}
                          </span>

                          <button
                            onClick={() => setAdjustingPlayer(p)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-black text-[11px] font-bold text-slate-300 transition cursor-pointer"
                          >
                            Adjust Coins
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'MATCHES' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 pb-1">
                    Recent Multiplayer Games ({matches.length})
                  </div>
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#12141f] border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                          {m.mode}
                        </span>
                        <p className="text-xs font-bold text-white mt-1">
                          Room: {m.roomId}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(m.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">
                          Winner: {m.winners?.[0]?.color} Dynasty
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {m.players?.length || 2} Players
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'SETTINGS' && settings && (
                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Starting Coins
                      </label>
                      <input
                        type="number"
                        value={settings.startingCoins}
                        onChange={(e) => setSettings({ ...settings, startingCoins: Number(e.target.value) })}
                        className="w-full bg-[#12141f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Daily Bonus Coins
                      </label>
                      <input
                        type="number"
                        value={settings.dailyBonusCoins}
                        onChange={(e) => setSettings({ ...settings, dailyBonusCoins: Number(e.target.value) })}
                        className="w-full bg-[#12141f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Rewarded Ad Coins
                      </label>
                      <input
                        type="number"
                        value={settings.rewardedAdCoins}
                        onChange={(e) => setSettings({ ...settings, rewardedAdCoins: Number(e.target.value) })}
                        className="w-full bg-[#12141f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Turn Timeout (Seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.turnTimeoutSeconds}
                        onChange={(e) => setSettings({ ...settings, turnTimeoutSeconds: Number(e.target.value) })}
                        className="w-full bg-[#12141f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black rounded-xl hover:opacity-90 transition shadow-lg cursor-pointer"
                  >
                    Save Economy Settings
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Coin Adjustment Modal Sub-dialog */}
        {adjustingPlayer && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#141622] border border-amber-500/50 p-5 text-white shadow-2xl">
              <h4 className="font-heading font-bold text-sm text-white mb-1">
                Adjust Virtual Coins for {adjustingPlayer.name}
              </h4>
              <p className="text-[11px] text-slate-400 mb-4">
                Current Balance: {adjustingPlayer.coins.toLocaleString()} Coins
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Amount (+ to credit, - to debit)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full bg-[#0d0e14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Audit Reason</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Test credit, Tournament bonus"
                    className="w-full bg-[#0d0e14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setAdjustingPlayer(null)}
                    className="py-2 rounded-xl bg-slate-800 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCoinAdjustment}
                    disabled={isAdjusting}
                    className="py-2 rounded-xl bg-amber-400 text-black text-xs font-black"
                  >
                    {isAdjusting ? 'Processing...' : 'Apply Adjustment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
