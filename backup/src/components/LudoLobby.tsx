import React, { useState } from 'react';
import { PlayerProfile, GameMode, AppLanguage } from '../types/ludo';
import {
  Crown,
  Coins,
  Tv,
  Gift,
  Users,
  Swords,
  Share2,
  Volume2,
  VolumeX,
  Shield,
  Sparkles,
  Info,
  KeyRound,
  ArrowRight,
  User,
  Music,
  Bot,
} from 'lucide-react';
import { playLudoSound } from '../utils/ludoRules';
import { OttomanMusicPlayer } from './OttomanMusicPlayer';
import { RoyalGeometricBackground } from './RoyalGeometricBackground';

interface LudoLobbyProps {
  player: PlayerProfile;
  onSelectMode: (mode: GameMode, maxPlayers: 2 | 4) => void;
  onStartBotGame: (maxPlayers: 2 | 4) => void;
  onCreatePrivateRoom: (maxPlayers: 2 | 4) => void;
  onJoinPrivateRoom: (code: string) => void;
  onClaimDailyBonus: () => void;
  onWatchAd: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  canClaimDaily: boolean;
  dailyHoursLeft?: number;
  adCooldownSec?: number;
}

export const LudoLobby: React.FC<LudoLobbyProps> = ({
  player,
  onSelectMode,
  onStartBotGame,
  onCreatePrivateRoom,
  onJoinPrivateRoom,
  onClaimDailyBonus,
  onWatchAd,
  onOpenProfile,
  onOpenAdmin,
  soundEnabled,
  onToggleSound,
  language,
  onToggleLanguage,
  canClaimDaily,
  dailyHoursLeft,
  adCooldownSec = 0,
}) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);

  const t = {
    en: {
      tagline: 'ROYAL ONLINE MULTIPLAYER',
      online2p: '2 Players Live Battle',
      online2pSub: 'Matchmaking with real live online players',
      online4p: '4 Players Royal Clash',
      online4pSub: '4-color live multiplayer challenge',
      privateRoom: 'Play with Friends',
      privateRoomSub: 'Create private room or join via link / code',
      botMode: 'Play vs Computer (Bot Practice)',
      botModeSub: 'Single player practice against Ludo AI bots',
      dailyBonus: 'Daily Login Reward',
      dailyBonusSub: 'Claim +1,000 free virtual coins',
      watchAd: 'Watch Video Sponsor',
      watchAdSub: 'Earn +500 free virtual coins',
      disclaimer: 'Virtual coins are for entertainment only with zero monetary value. No real-money wagering.',
      create2P: 'Create 2-Player Room',
      create4P: 'Create 4-Player Room',
      joinViaCode: 'Join via Code / Link',
      rules: 'Ludo Rules & Topology',
    },
    ur: {
      tagline: 'شاہی آن لائن ملٹی پلیئر لوڈو',
      online2p: '2 کھلاڑیوں کا لائیو مقابلہ',
      online2pSub: 'حقیقی آن لائن کھلاڑیوں کے ساتھ میچ میکنگ',
      online4p: '4 کھلاڑیوں کی شاہی جنگ',
      online4pSub: 'روایتی 4 رنگوں والا لائیو لوڈو مقابلہ',
      privateRoom: 'دوستوں کے ساتھ کھیلیں',
      privateRoomSub: 'پرائیویٹ روم بنائیں یا لنک/کوڈ سے شامل ہوں',
      botMode: 'کمپیوٹر کے خلاف کھیلیں (بوٹس پریکٹس)',
      botModeSub: 'بغیر انتظار کے فوری لوڈو بوٹس کے ساتھ پریکٹس کریں',
      dailyBonus: 'روزانہ کا انعام',
      dailyBonusSub: 'مفت +1,000 ورچوئل کوائنز حاصل کریں',
      watchAd: 'سپانسر ویڈیو دیکھیں',
      watchAdSub: 'مفت +500 ورچوئل کوائنز حاصل کریں',
      disclaimer: 'ورچوئل کوائنز صرف تفریح کے لیے ہیں جن کی کوئی حقیقی نقدی قیمت نہیں۔',
      create2P: '2 کھلاڑیوں کا روم بنائیں',
      create4P: '4 کھلاڑیوں کا روم بنائیں',
      joinViaCode: 'کوڈ / لنک سے شامل ہوں',
      rules: 'لوڈو کے اصول اور رہنمائی',
    },
  }[language];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-screen pb-10 px-4 text-white relative overflow-hidden">
      {/* Subtle Rotating Royal Geometric Pattern Background */}
      <RoyalGeometricBackground />

      {/* Lobby Content Container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* =========================================
            TOP NAVBAR
        ========================================= */}
        <header className="py-4 flex items-center justify-between border-b border-amber-500/20">
        {/* Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#12141e] border border-amber-500/30 hover:border-amber-400 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-base border border-amber-500/40">
            {player.avatar === 'king' ? '🤴' : player.avatar === 'queen' ? '👸' : player.avatar === 'tiger' ? '🐯' : '👑'}
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-white max-w-[80px] truncate">
              {player.name}
            </span>
            <span className="block text-[9px] text-amber-400 font-mono">
              ID: {player.id.slice(-4)}
            </span>
          </div>
        </button>

        {/* Center / Right utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Virtual Coin Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-950/60 to-black border border-amber-500/50 shadow-md cursor-pointer hover:scale-105 transition"
            title="View Coin Ledger"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black font-mono text-amber-300">
              {player.coins.toLocaleString()}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-full bg-[#12141e] border border-slate-800 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2 py-1 rounded-lg bg-[#12141e] border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-amber-400 transition cursor-pointer"
          >
            {language === 'en' ? 'اردو' : 'EN'}
          </button>
        </div>
      </header>

      {/* =========================================
          HERO BRANDING
      ========================================= */}
      <section className="text-center my-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border border-white shadow-xl shadow-amber-500/20 mb-3">
          <Crown className="w-8 h-8 text-black drop-shadow" />
        </div>
        <h1 className="font-heading font-black text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300">
          AURUM LUDO
        </h1>
        <p className="text-[11px] font-bold tracking-widest uppercase text-amber-500/90 mt-1">
          {t.tagline}
        </p>
      </section>

      {/* =========================================
          OTTOMAN SULTAN ABDUL HAMID MUSIC BANNER
      ========================================= */}
      <section className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#191114] to-amber-950/60 border border-amber-500/40 shadow-xl relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-600 to-yellow-500 flex items-center justify-center text-lg shadow-md border border-amber-400/40 shrink-0">
            🇹🇷
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                Imperial Sound
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-heading font-black text-xs text-amber-200">
              Payitaht: Abdülhamid
            </h3>
            <p className="text-[9px] text-slate-400">
              Turkish March & Imperial Mehter
            </p>
          </div>
        </div>

        <OttomanMusicPlayer />
      </section>

      {/* =========================================
          GAME MODES GRID
      ========================================= */}
      <section className="space-y-3 mb-6">
        {/* 2 Players Online */}
        <button
          onClick={() => {
            playLudoSound('SAFE');
            onSelectMode('2_PLAYER', 2);
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#141624] via-[#10121d] to-[#171a2b] border border-amber-500/40 hover:border-amber-400 transition-all hover:scale-[1.01] active:scale-[0.99] text-left flex items-center justify-between shadow-lg shadow-black/40 group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-amber-300 transition">
                {t.online2p}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.online2pSub}
              </p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition">
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        {/* 4 Players Online */}
        <button
          onClick={() => {
            playLudoSound('SAFE');
            onSelectMode('4_PLAYER', 4);
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#171927] via-[#12141f] to-[#141624] border border-emerald-500/40 hover:border-emerald-400 transition-all hover:scale-[1.01] active:scale-[0.99] text-left flex items-center justify-between shadow-lg shadow-black/40 group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-emerald-300 transition">
                {t.online4p}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.online4pSub}
              </p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition">
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        {/* Private Room with Friends */}
        <div className="p-4 rounded-2xl bg-[#0f1019] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-amber-400" />
            <div>
              <h4 className="font-heading font-bold text-xs text-white">
                {t.privateRoom}
              </h4>
              <p className="text-[11px] text-slate-400">
                {t.privateRoomSub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCreatePrivateRoom(2)}
              className="py-2.5 px-3 rounded-xl bg-[#161824] hover:bg-[#1e2133] border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              {t.create2P}
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {t.joinViaCode}
            </button>
          </div>
        </div>

        {/* Solo Bot Practice Mode */}
        <button
          onClick={() => {
            playLudoSound('SAFE');
            onStartBotGame(2);
          }}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#11131c] to-[#181b28] border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-heading font-bold text-xs text-white group-hover:text-amber-300 transition">
                  {t.botMode}
                </h4>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  OFFLINE AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {t.botModeSub}
              </p>
            </div>
          </div>
          <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-400 group-hover:text-black transition">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </section>

      {/* =========================================
          REWARDS & MONETIZATION
      ========================================= */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        {/* Daily Bonus Card */}
        <button
          onClick={onClaimDailyBonus}
          disabled={!canClaimDaily}
          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
            canClaimDaily
              ? 'bg-gradient-to-br from-amber-950/40 to-[#12141f] border-amber-500/50 hover:border-amber-400 cursor-pointer shadow-lg shadow-amber-500/10'
              : 'bg-[#0e0f16] border-slate-800 opacity-70 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Gift className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              +1,000
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{t.dailyBonus}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {canClaimDaily ? 'Ready to claim' : `In ${dailyHoursLeft || 1}h`}
            </p>
          </div>
        </button>

        {/* Rewarded Ad Card */}
        <button
          onClick={onWatchAd}
          disabled={adCooldownSec > 0}
          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
            adCooldownSec === 0
              ? 'bg-gradient-to-br from-indigo-950/40 to-[#12141f] border-indigo-500/40 hover:border-indigo-400 cursor-pointer shadow-lg shadow-indigo-500/10'
              : 'bg-[#0e0f16] border-slate-800 opacity-70 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Tv className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              +500
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{t.watchAd}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {adCooldownSec === 0 ? 'Watch 5s ad' : `Wait ${adCooldownSec}s`}
            </p>
          </div>
        </button>
      </section>

      {/* =========================================
          LEGAL & FAIR PLAY NOTICE
      ========================================= */}
      <section className="p-3 rounded-2xl bg-[#090a0f] border border-slate-800/80 mb-6 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {t.disclaimer}
        </p>
      </section>

      {/* =========================================
          FOOTER & ADMIN PORTAL LINK
      ========================================= */}
      <footer className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => setShowRulesModal(true)}
          className="flex items-center gap-1 hover:text-white transition cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          {t.rules}
        </button>

        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 text-amber-500/80 hover:text-amber-400 transition cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Admin Portal
        </button>
      </footer>
      </div>

      {/* =========================================
          JOIN PRIVATE ROOM DIALOG
      ========================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-[#0f111a] border border-amber-500/40 p-5 text-white">
            <h3 className="font-heading font-bold text-sm text-white mb-1">
              Enter 6-Digit Room Code
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Ask your friend for their AURUM LUDO invitation code.
            </p>

            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 583921"
              className="w-full tracking-widest text-center text-lg font-mono font-bold bg-[#141724] border border-slate-700 rounded-xl py-2.5 text-amber-300 focus:outline-none focus:border-amber-400 mb-4"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (joinCode.length === 6) {
                    setShowJoinModal(false);
                    onJoinPrivateRoom(joinCode);
                  }
                }}
                disabled={joinCode.length !== 6}
                className="py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black disabled:opacity-50"
              >
                Join Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RULES MODAL
      ========================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e1018] border border-amber-500/40 p-5 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Official AURUM LUDO Rules
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 pt-3">
              <div>
                <strong className="text-white">1. Starting Tokens:</strong> Rolling a 6 moves a token out of the yard onto the starting square (Cell 1 for Red, 14 Green, 27 Yellow, 40 Blue).
              </div>
              <div>
                <strong className="text-white">2. Safe Star Squares:</strong> 8 squares marked with ⭐ (1, 9, 14, 22, 27, 35, 40, 48) are secure zones where tokens cannot be captured.
              </div>
              <div>
                <strong className="text-white">3. Token Captures:</strong> Landing on an opponent's token outside safe squares sends them back to their yard and awards an extra turn!
              </div>
              <div>
                <strong className="text-white">4. Extra Turns:</strong> Awarded on rolling a 6, capturing an opponent, or getting a token safely into the Home triangle (Max three consecutive sixes).
              </div>
              <div>
                <strong className="text-white">5. Exact Finish:</strong> Tokens must reach Home on the exact required roll. First player with all 4 tokens home wins!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
