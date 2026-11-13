import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, CalendarDayReward, SpinWheelPrize } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import { playLudoSound } from '../utils/ludoRules';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  X,
  Check,
  Lock,
  Clock,
  RotateCw,
  Coins,
  Crown,
  Trophy,
  Flame,
} from 'lucide-react';

interface DailyRewardsSpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onUpdatePlayer: (updated: PlayerProfile) => void;
}

export const DailyRewardsSpinModal: React.FC<DailyRewardsSpinModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'SPIN'>('CALENDAR');
  const [calendarDays, setCalendarDays] = useState<CalendarDayReward[]>([]);
  const [streak, setStreak] = useState(1);
  const [canClaimCalendar, setCanClaimCalendar] = useState(true);
  const [calendarHoursLeft, setCalendarHoursLeft] = useState(0);

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [spinCooldownHours, setSpinCooldownHours] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinWheelPrize | null>(null);
  const [isRewardPopupOpen, setIsRewardPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [claimedAmount, setClaimedAmount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch Calendar Data
  useEffect(() => {
    if (isOpen && player) {
      loadCalendar();
      checkSpinCooldown();
    }
  }, [isOpen, player?.id]);

  const loadCalendar = async () => {
    try {
      const res = await ludoApi.getDailyCalendar(player.id);
      setCalendarDays(res.days);
      setStreak(res.streak);
      setCanClaimCalendar(res.canClaim);
      setCalendarHoursLeft(res.hoursLeft);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  };

  const checkSpinCooldown = () => {
    if (player.lastSpinAt) {
      const hoursSince = (Date.now() - new Date(player.lastSpinAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 12) {
        setSpinCooldownHours(Math.ceil(12 - hoursSince));
      } else {
        setSpinCooldownHours(0);
      }
    } else {
      setSpinCooldownHours(0);
    }
  };

  // Draw 8-Segment Golden Lucky Spin Wheel on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    const segments = [
      { label: '250', sub: 'COINS', bg: '#111827', text: '#f9fafb' },
      { label: '500', sub: 'COINS', bg: '#854d0e', text: '#fef3c7' },
      { label: '1,000', sub: 'COINS', bg: '#064e3b', text: '#ecfdf5' },
      { label: '1,500', sub: 'COINS', bg: '#1e3a8a', text: '#eff6ff' },
      { label: '2,500', sub: 'COINS', bg: '#581c87', text: '#faf5ff' },
      { label: 'EMERALD', sub: 'DICE', bg: '#047857', text: '#a7f3d0' },
      { label: '5,000', sub: 'COINS', bg: '#991b1b', text: '#fee2e2' },
      { label: '10,000', sub: 'JACKPOT', bg: '#ca8a04', text: '#000000' },
    ];

    const numSegs = segments.length;
    const arc = (2 * Math.PI) / numSegs;

    // Draw Wheel Segments
    for (let i = 0; i < numSegs; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = segments[i].bg;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Golden Segment Divider Borders
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Segment Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = segments[i].text;
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(segments[i].label, radius - 22, 0);

      ctx.font = '8px "Space Mono", monospace';
      ctx.fillStyle = segments[i].text === '#000000' ? '#111827' : '#fef08a';
      ctx.fillText(segments[i].sub, radius - 22, 12);
      ctx.restore();
    }

    // Outer Golden Ring with Studs
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center Gold Crown Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b18';
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', centerX, centerY);
  }, []);

  // Claim Daily Calendar Day
  const handleClaimCalendar = async () => {
    try {
      const res = await ludoApi.claimDailyCalendarDay(player.id);
      onUpdatePlayer(res.player);
      setCalendarDays(res.days);
      setStreak(res.streak);
      setCanClaimCalendar(false);
      setCalendarHoursLeft(24);
      setClaimedAmount(res.rewardAmount);
      setPopupMessage(res.message);
      setIsRewardPopupOpen(true);
      playLudoSound('SAFE');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#eab308', '#f59e0b', '#fbbf24', '#ffffff'],
      });
    } catch (err: any) {
      alert(err.message || 'Daily check-in error');
    }
  };

  // Trigger Lucky Spin Animation
  const handleSpinWheel = async () => {
    if (isSpinning || spinCooldownHours > 0) return;
    setIsSpinning(true);

    try {
      const res = await ludoApi.spinLuckyWheel(player.id);

      // Calculate target angle: 8 segments = 45 deg each
      // Top indicator points at 270 degrees
      const segAngle = 360 / 8;
      const targetDeg = 360 * 5 + (360 - res.prizeIndex * segAngle - segAngle / 2);

      setSpinDeg(targetDeg);

      // Play tick sound effects during spin
      let ticks = 0;
      const tickInterval = setInterval(() => {
        playLudoSound('MOVE');
        ticks++;
        if (ticks > 14) clearInterval(tickInterval);
      }, 250);

      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(res.prize);
        setClaimedAmount(res.prize.coins);
        setPopupMessage(`Congratulations! You won ${res.prize.label}!`);
        setIsRewardPopupOpen(true);
        setSpinCooldownHours(12);
        onUpdatePlayer(res.player);
        playLudoSound('SAFE');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#eab308', '#f59e0b', '#ef4444', '#10b981'],
        });
      }, 4200);
    } catch (err: any) {
      setIsSpinning(false);
      alert(err.message || 'Spin wheel error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#131520] via-[#0b0d14] to-[#07080c] border border-amber-500/40 p-5 shadow-2xl shadow-amber-500/10 text-white flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white tracking-wide uppercase">
                Daily Rewards & Spin
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                Streak: Day {streak} of 7
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

        {/* Tab Navigation: "Daily Login Rewards UI" vs "Lucky Spin Wheel UI" */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090b12] rounded-xl my-3 border border-slate-800">
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'CALENDAR'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>7-Day Check-In</span>
          </button>
          <button
            onClick={() => setActiveTab('SPIN')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'SPIN'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Lucky Spin Wheel</span>
          </button>
        </div>

        {/* TAB 1: "Daily Check-In Calendar Component" */}
        {activeTab === 'CALENDAR' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-[#0e101a] border border-amber-500/20 text-center">
              <span className="text-[11px] text-slate-300">
                Log in every consecutive day to earn bigger rewards!
              </span>
            </div>

            {/* 7-Day Grid */}
            <div className="grid grid-cols-4 gap-2">
              {calendarDays.map((d) => (
                <div
                  key={d.day}
                  className={`relative p-2 rounded-2xl flex flex-col items-center justify-between text-center border transition-all ${
                    d.claimed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : d.isCurrent && canClaimCalendar
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#1e1708] border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-[#0f111a] border-slate-800 text-slate-500'
                  } ${d.day === 7 ? 'col-span-2' : ''}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Day {d.day}
                  </span>

                  <div className="my-1.5">
                    {d.claimed ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : d.day === 7 ? (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 animate-bounce">
                        <Crown className="w-5 h-5 text-amber-400" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Coins className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-mono font-black text-amber-300">
                    +{d.coins.toLocaleString()}
                  </span>

                  {d.specialItem && (
                    <span className="text-[9px] text-yellow-300 font-bold uppercase mt-0.5">
                      + Spin Ticket
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Reward Claim Button & Countdown Timer Component */}
            <div className="pt-2">
              {canClaimCalendar ? (
                <button
                  onClick={handleClaimCalendar}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-heading font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim Day {streak} Reward (+{calendarDays.find(d => d.day === streak)?.coins.toLocaleString()} Coins)</span>
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Next Daily Bonus in {calendarHoursLeft} hours</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: "Lucky Spin Wheel UI" with "Prize Wheel Animation" */}
        {activeTab === 'SPIN' && (
          <div className="flex flex-col items-center space-y-3">
            {/* Top Indicator / Pointer */}
            <div className="relative">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 mx-auto -mb-2 z-20 relative drop-shadow-md" />
              
              {/* Animated Canvas Wheel */}
              <div
                className="relative rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-2xl shadow-amber-500/25"
                style={{
                  transform: `rotate(${spinDeg}deg)`,
                  transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={260}
                  height={260}
                  className="rounded-full select-none"
                />
              </div>
            </div>

            {/* Spin Action Button or Cooldown Timer Component */}
            {spinCooldownHours === 0 ? (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-heading font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Spinning Royal Wheel...' : 'Spin Royal Wheel Free'}</span>
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next Free Spin in {spinCooldownHours} hours</span>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            Virtual Coin Reward Popup / Reward Modal
        ========================================= */}
        {isRewardPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in zoom-in-95">
            <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#1c1f2e] to-[#0d0e15] border-2 border-amber-400 p-6 text-center shadow-2xl shadow-amber-500/30 text-white space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
                <Crown className="w-9 h-9" />
              </div>
              <div>
                <h4 className="font-heading font-black text-lg text-amber-300 uppercase">
                  Reward Unlocked!
                </h4>
                <p className="text-xs text-slate-300 mt-1">{popupMessage}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0a0b10] border border-amber-500/40 flex items-center justify-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-xl font-mono font-black text-amber-300">
                  +{claimedAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setIsRewardPopupOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition"
              >
                Awesome! Continue Playing
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
