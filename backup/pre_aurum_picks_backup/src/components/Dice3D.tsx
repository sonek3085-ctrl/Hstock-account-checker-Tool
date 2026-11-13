import React, { useState, useEffect } from 'react';
import { LudoColor } from '../types/ludo';
import { playLudoSound } from '../utils/ludoRules';
import { COLOR_CONFIG } from './LudoBoard';
import { RotateCcw, Sparkles } from 'lucide-react';

interface Dice3DProps {
  value: number | null;
  turnColor: LudoColor;
  canRoll: boolean;
  onRoll: () => void;
  turnTimeLeft: number;
  sixCount: number;
  isRolling?: boolean;
  diceSkin?: string;
}

// 6 Dots configuration on a 3x3 dice face
const DOT_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  turnColor,
  canRoll,
  onRoll,
  turnTimeLeft,
  sixCount,
  isRolling = false,
  diceSkin = 'classic_gold',
}) => {
  const [animating, setAnimating] = useState(false);
  const [tempValue, setTempValue] = useState<number>(value || 1);

  const displayColor = COLOR_CONFIG[turnColor] || COLOR_CONFIG.RED;

  const handleRollClick = () => {
    if (!canRoll || animating) return;
    onRoll();
  };

  useEffect(() => {
    if (value) {
      setAnimating(true);
      playLudoSound('ROLL');
      let count = 0;
      const interval = setInterval(() => {
        setTempValue(Math.floor(1 + Math.random() * 6));
        count++;
        if (count >= 8) {
          clearInterval(interval);
          setTempValue(value);
          setAnimating(false);
        }
      }, 65);
      return () => clearInterval(interval);
    }
  }, [value]);

  const activeFace = animating ? tempValue : value || 1;
  const dots = DOT_LAYOUTS[activeFace] || DOT_LAYOUTS[1];

  // Turn timer percentage (0 to 100%)
  const timerPercentage = Math.max(0, Math.min(100, (turnTimeLeft / 15) * 100));

  // Determine skin appearance
  const getSkinStyle = () => {
    switch (diceSkin) {
      case 'emerald_sultan':
        return {
          cube: 'bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-800 border-2 border-amber-400 shadow-emerald-500/40',
          dotNormal: 'bg-amber-300',
          dotOne: 'bg-yellow-200 scale-125',
          dotSix: 'bg-yellow-300',
        };
      case 'ruby_imperial':
        return {
          cube: 'bg-gradient-to-br from-rose-600 via-red-500 to-rose-900 border-2 border-amber-400 shadow-rose-500/40',
          dotNormal: 'bg-yellow-300',
          dotOne: 'bg-white scale-125',
          dotSix: 'bg-amber-300',
        };
      case 'cyber_obsidian':
        return {
          cube: 'bg-gradient-to-br from-slate-950 via-black to-slate-900 border-2 border-amber-400 shadow-amber-500/40',
          dotNormal: 'bg-amber-400',
          dotOne: 'bg-yellow-300 scale-125',
          dotSix: 'bg-amber-400',
        };
      case 'classic_gold':
      default:
        return {
          cube: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border border-amber-600 shadow-amber-500/30',
          dotNormal: 'bg-slate-950',
          dotOne: 'bg-rose-700 scale-125',
          dotSix: 'bg-amber-950',
        };
    }
  };

  const skinStyle = getSkinStyle();

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Turn Status Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md ${
            displayColor.bg
          } ${displayColor.text} ${displayColor.border}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          {displayColor.name}'s Turn
        </span>

        {/* 6 Streak Indicator */}
        {sixCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black shadow-md animate-bounce">
            <Sparkles className="w-3 h-3" />
            {sixCount === 1 ? '1st Six!' : sixCount === 2 ? '2nd Six!' : '3 Sixes!'}
          </span>
        )}
      </div>

      {/* Interactive Dice Container */}
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Turn Timer Ring */}
        <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="text-slate-800"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className={`${
              turnTimeLeft <= 4 ? 'text-rose-500' : 'text-amber-400'
            } transition-all duration-300 ease-linear`}
            strokeWidth="6"
            strokeDasharray={276}
            strokeDashoffset={276 - (276 * timerPercentage) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Dice Cube */}
        <button
          onClick={handleRollClick}
          disabled={!canRoll || animating}
          aria-label="Roll Dice"
          className={`absolute w-16 h-16 rounded-2xl shadow-2xl p-2 flex flex-col justify-between items-center transition-transform select-none ${
            skinStyle.cube
          } ${
            canRoll && !animating
              ? 'scale-105 hover:scale-110 active:scale-95 ring-4 ring-amber-400/80 cursor-pointer animate-pulse'
              : 'opacity-90'
          } ${animating ? 'rotate-180 scale-95 duration-200' : ''}`}
        >
          {/* 3x3 Dots Grid */}
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 pointer-events-none">
            {Array.from({ length: 9 }).map((_, index) => {
              const hasDot = dots.includes(index);
              return (
                <div key={index} className="flex items-center justify-center">
                  {hasDot ? (
                    <div
                      className={`w-3 h-3 rounded-full shadow-inner ${
                        activeFace === 1
                          ? skinStyle.dotOne
                          : activeFace === 6
                          ? skinStyle.dotSix
                          : skinStyle.dotNormal
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </button>
      </div>

      {/* Action / Callout Text */}
      <div className="mt-2 text-center h-6">
        {canRoll ? (
          <button
            onClick={handleRollClick}
            disabled={animating}
            className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${animating ? 'animate-spin' : ''}`} />
            Tap to Roll Dice
          </button>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">
            {value ? `Rolled a ${value}!` : `${turnTimeLeft}s remaining`}
          </span>
        )}
      </div>
    </div>
  );
};
