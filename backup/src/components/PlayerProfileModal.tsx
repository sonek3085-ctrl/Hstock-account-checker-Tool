import React, { useState, useEffect } from 'react';
import { PlayerProfile, CoinTransaction } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import {
  X,
  Trophy,
  Coins,
  Swords,
  Trash2,
  Edit2,
  Check,
  History,
  Shield,
  User,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onUpdatePlayer: (updated: PlayerProfile) => void;
  onLogout: () => void;
  onAccountDeleted: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'king', emoji: '🤴', label: 'King' },
  { id: 'queen', emoji: '👸', label: 'Queen' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
];

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
  onLogout,
  onAccountDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'LEDGER'>('PROFILE');
  const [name, setName] = useState(player.name);
  const [selectedAvatar, setSelectedAvatar] = useState(player.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(player.name);
      setSelectedAvatar(player.avatar);
      setShowDeleteConfirm(false);
      loadTransactions();
    }
  }, [isOpen, player]);

  const loadTransactions = async () => {
    setIsLoadingTxns(true);
    try {
      const list = await ludoApi.getTransactions(player.id);
      setTransactions(list);
    } catch {
      // Fallback
    } finally {
      setIsLoadingTxns(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const updated = await ludoApi.updateProfile(player.id, {
        name: name.trim(),
        avatar: selectedAvatar,
      });
      onUpdatePlayer(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await ludoApi.deleteAccount(player.id);
      onAccountDeleted();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] rounded-3xl bg-[#0c0d14] border border-amber-500/40 shadow-2xl text-white flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 px-5 border-b border-slate-800/80 flex items-center justify-between bg-[#10121a]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <User className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading font-black text-sm tracking-wide text-white">
                Player Profile & Wallet
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                ID: {player.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 border-b border-slate-800/80 bg-[#090a0f] text-xs font-bold">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'PROFILE'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile & Stats
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-3 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'LEDGER'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Coin Ledger ({transactions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'PROFILE' ? (
            <>
              {/* Virtual Coin Balance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
                    Virtual In-Game Coins
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <span className="text-2xl font-heading font-black text-white">
                      {player.coins.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Non-redeemable
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">Zero cash value</p>
                </div>
              </div>

              {/* Edit Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={16}
                    className="flex-1 bg-[#12141c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !name.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Choose Royal Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => {
                        setSelectedAvatar(av.id);
                        ludoApi.updateProfile(player.id, { avatar: av.id }).then(onUpdatePlayer);
                      }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition border ${
                        selectedAvatar === av.id
                          ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                          : 'bg-[#12141c] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Battle Statistics
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#12141c] border border-slate-800">
                    <span className="text-[10px] text-slate-400">Total Matches</span>
                    <p className="text-base font-bold text-white mt-0.5">
                      {player.stats?.matchesPlayed || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#12141c] border border-slate-800">
                    <span className="text-[10px] text-slate-400">Victories</span>
                    <p className="text-base font-bold text-amber-400 mt-0.5">
                      {player.stats?.wins || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#12141c] border border-slate-800">
                    <span className="text-[10px] text-slate-400">Tokens Captured</span>
                    <p className="text-base font-bold text-rose-400 mt-0.5">
                      {player.stats?.tokensCaptured || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#12141c] border border-slate-800">
                    <span className="text-[10px] text-slate-400">Win Rate</span>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">
                      {player.stats?.matchesPlayed
                        ? `${Math.round(((player.stats.wins || 0) / player.stats.matchesPlayed) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Actions: Logout & Delete */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#161822] hover:bg-[#1f2230] text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Switch / Switch to Guest Account
                </button>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account & Associated Data
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/50 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Permanent Data Erasure
                    </div>
                    <p className="text-[11px] text-slate-400">
                      This will irreversibly remove your player profile, match history, and coin ledger.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 text-xs text-slate-300 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* LEDGER TAB */
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1">
                <span>Recent Coin Transactions</span>
                <span className="font-mono text-amber-400">{player.coins.toLocaleString()} Coins</span>
              </div>

              {isLoadingTxns ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Loading ledger records...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No coin transactions recorded yet.
                </div>
              ) : (
                transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3 rounded-xl bg-[#12141c] border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {txn.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-400">
                          {txn.id}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black font-mono ${
                          txn.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {txn.amount >= 0 ? `+${txn.amount}` : txn.amount}
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Bal: {txn.balanceAfter.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
