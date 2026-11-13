import React, { useState, useEffect } from 'react';
import { X, Play, ShieldCheck, CheckCircle2, Coins, Sparkles, Volume2 } from 'lucide-react';
import { playLudoSound } from '../utils/ludoRules';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardComplete: () => void;
  rewardAmount: number;
}

const AD_SPONSORS = [
  {
    title: 'Aurum Royale Grand Arena',
    subtitle: 'Step into the premier online battlegrounds with real-time multiplayer',
    tag: 'SPONSORED PROMOTION',
    icon: '👑',
    gradient: 'from-amber-600 via-yellow-500 to-amber-700',
  },
  {
    title: 'Diamond Club Championship',
    subtitle: 'Roll the golden dice and conquer the royal Ludo leaderboards',
    tag: 'FEATURED GAME',
    icon: '💎',
    gradient: 'from-blue-600 via-indigo-500 to-purple-600',
  },
  {
    title: 'TikBoost Media Agency',
    subtitle: 'Top-tier organic reach, video optimization, and creator growth strategies',
    tag: 'EXCLUSIVE SPONSOR',
    icon: '🚀',
    gradient: 'from-rose-600 via-pink-500 to-amber-600',
  },
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardComplete,
  rewardAmount,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [sponsorIndex, setSponsorIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(5);
      setIsCompleted(false);
      setSponsorIndex(Math.floor(Math.random() * AD_SPONSORS.length));

      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            playLudoSound('SAFE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sponsor = AD_SPONSORS[sponsorIndex];
  const progressPercent = ((5 - secondsLeft) / 5) * 100;

  const handleClaim = () => {
    if (!isCompleted) return;
    onRewardComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0e1017] border border-amber-500/40 p-5 shadow-2xl shadow-amber-500/10 text-white flex flex-col items-center">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {sponsor.tag}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> AdMob Verified
            </span>
          </div>

          {/* Close button only accessible if user wants to exit early (forfeit reward) or when finished */}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCompleted ? 'Close' : 'Cancel and forfeit reward'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ad Video Banner Simulation */}
        <div
          className={`w-full aspect-[4/3] rounded-xl my-4 bg-gradient-to-br ${sponsor.gradient} p-6 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden`}
        >
          {/* Ad Sound & Countdown Indicator */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/80">
              <Volume2 className="w-4 h-4" />
            </span>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-amber-300 border border-amber-400/30">
              {isCompleted ? 'Reward Ready' : `Reward in ${secondsLeft}s`}
            </span>
          </div>

          {/* Central Logo/Icon */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl mb-2 shadow-lg">
              {sponsor.icon}
            </div>
            <h3 className="font-heading font-black text-lg text-white drop-shadow">
              {sponsor.title}
            </h3>
            <p className="text-xs text-white/85 mt-1 max-w-[220px]">
              {sponsor.subtitle}
            </p>
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-full z-10">
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Decorative backdrop shimmer */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Claim / Completion Action */}
        <div className="w-full text-center">
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 px-4 rounded-xl font-heading font-black text-sm tracking-wide bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black hover:opacity-95 active:scale-98 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              Claim +{rewardAmount.toLocaleString()} Free Virtual Coins
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              Watching video sponsor... ({secondsLeft}s)
            </div>
          )}

          <p className="text-[10px] text-slate-400 mt-2">
            Coins are virtual in-game entertainment rewards with zero cash value.
          </p>
        </div>
      </div>
    </div>
  );
};
