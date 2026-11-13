import React, { useState, useEffect } from 'react';
import { PlayerProfile, LeaderboardEntry, RankTier } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  Shield,
  X,
  TrendingUp,
  Percent,
  Sparkles,
  User,
} from 'lucide-react';

interface GlobalLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: PlayerProfile;
}

export const GlobalLeaderboardModal: React.FC<GlobalLeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
}) => {
  const [period, setPeriod] = useState<'weekly' | 'alltime'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ludoApi.getLeaderboard(period);
      setLeaderboard(data.topPlayers);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // Helper for tier badge color and label
  const getTierInfo = (tier: RankTier) => {
    switch (tier) {
      case 'SULTAN_GRANDMASTER':
        return { label: 'Sultan Grandmaster', bg: 'from-amber-600 via-yellow-400 to-amber-600', text: 'text-amber-300', icon: '👑' };
      case 'DIAMOND':
        return { label: 'Diamond Pasha', bg: 'from-cyan-600 to-blue-500', text: 'text-cyan-300', icon: '💎' };
      case 'GOLD':
        return { label: 'Imperial Gold', bg: 'from-yellow-600 to-amber-500', text: 'text-yellow-400', icon: '🥇' };
      case 'SILVER':
        return { label: 'Royal Silver', bg: 'from-slate-400 to-slate-200', text: 'text-slate-300', icon: '🥈' };
      case 'BRONZE':
      default:
        return { label: 'Bronze Warrior', bg: 'from-amber-800 to-orange-700', text: 'text-amber-500', icon: '🥉' };
    }
  };

  // Level & XP math
  const xp = currentPlayer.xp || 350;
  const level = currentPlayer.level || Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = level * level * 100;
  const currentLevelBaseXp = (level - 1) * (level - 1) * 100;
  const xpInLevel = Math.max(0, xp - currentLevelBaseXp);
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  const winRate =
    currentPlayer.stats.matchesPlayed > 0
      ? Math.round((currentPlayer.stats.wins / currentPlayer.stats.matchesPlayed) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#131520] via-[#0b0d14] to-[#07080c] border border-amber-500/40 p-5 shadow-2xl shadow-amber-500/10 text-white flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white tracking-wide uppercase">
                Royal Leaderboard
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                Empire High Command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls: "Weekly Leaderboard" vs "All-Time Rankings" */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090b12] rounded-xl my-3 border border-slate-800">
          <button
            onClick={() => setPeriod('weekly')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              period === 'weekly'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Weekly Cup</span>
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              period === 'alltime'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>All-Time Rankings</span>
          </button>
        </div>

        {/* ========================================================
            "Player Profile Dashboard UI" & "XP Progress Bar"
        ======================================================== */}
        <div className="p-3 rounded-2xl bg-[#0f111a] border border-amber-500/20 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-bold text-lg shadow-md">
                👑
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {currentPlayer.name}
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Lv. {level}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {currentPlayer.coins.toLocaleString()} Coins
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3" /> {winRate}% Win Rate
              </span>
              <span className="text-[9px] text-slate-400">
                {currentPlayer.stats.wins}W / {currentPlayer.stats.matchesPlayed}M
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
              <span>XP Progress</span>
              <span>{xpInLevel} / {xpNeeded} XP ({xpPercent}%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Podium Top 3 Players */}
        <div className="grid grid-cols-3 gap-2 mb-3 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="p-2.5 rounded-2xl bg-[#11131e] border border-slate-700 text-center flex flex-col items-center">
              <span className="text-lg">🥈</span>
              <span className="text-[10px] font-bold text-white truncate max-w-[80px]">
                {top3[1].name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono text-slate-300 mt-0.5">
                {top3[1].coins.toLocaleString()}
              </span>
              <span className="text-[8px] text-slate-500">2nd</span>
            </div>
          )}

          {/* 1st Place Champion */}
          {top3[0] && (
            <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/70 to-[#161208] border border-amber-400 text-center flex flex-col items-center shadow-lg shadow-amber-500/20 scale-105 -translate-y-1">
              <span className="text-2xl animate-bounce">👑</span>
              <span className="text-xs font-black text-amber-300 truncate max-w-[90px]">
                {top3[0].name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 mt-0.5">
                {top3[0].coins.toLocaleString()}
              </span>
              <span className="text-[8px] text-amber-300 uppercase tracking-widest font-black">
                Grand Sultan
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="p-2.5 rounded-2xl bg-[#11131e] border border-amber-900 text-center flex flex-col items-center">
              <span className="text-lg">🥉</span>
              <span className="text-[10px] font-bold text-white truncate max-w-[80px]">
                {top3[2].name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono text-amber-600 mt-0.5">
                {top3[2].coins.toLocaleString()}
              </span>
              <span className="text-[8px] text-slate-500">3rd</span>
            </div>
          )}
        </div>

        {/* "Player Ranking Table" (Remaining Players List) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {remaining.map((p) => {
            const tier = getTierInfo(p.tier);
            const isMe = p.playerId === currentPlayer.id;

            return (
              <div
                key={p.playerId}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                  isMe
                    ? 'bg-amber-500/20 border-amber-400/60 shadow-sm'
                    : 'bg-[#0f111a] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                    #{p.rank}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                    {tier.icon}
                  </div>
                  <div>
                    <span className="font-bold text-white block truncate max-w-[110px]">
                      {p.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {p.wins} Wins · {p.winRate}% WR
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-400 block">
                    {p.coins.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    {p.tier.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
