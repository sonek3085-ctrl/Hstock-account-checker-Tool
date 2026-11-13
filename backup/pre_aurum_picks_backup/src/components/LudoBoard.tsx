import React from 'react';
import { LudoColor, Token, GameState, TokenStepInfo } from '../types/ludo';
import { SAFE_SQUARES, playLudoSound } from '../utils/ludoRules';
import { Crown, Star } from 'lucide-react';

interface LudoBoardProps {
  game: GameState;
  myColor?: LudoColor;
  onSelectToken: (tokenId: number) => void;
  disabled?: boolean;
  animatingToken?: {
    color: LudoColor;
    tokenId: number;
    step: TokenStepInfo;
    isCapturing?: boolean;
  } | null;
  boardTheme?: string;
  tokenSkin?: string;
}

// 52 Global Track Grid Positions (Row: 0..14, Col: 0..14)
export const TRACK_GRID: { row: number; col: number }[] = [
  { row: 6, col: 0 },  // 0
  { row: 6, col: 1 },  // 1 (RED START - Safe)
  { row: 6, col: 2 },  // 2
  { row: 6, col: 3 },  // 3
  { row: 6, col: 4 },  // 4
  { row: 6, col: 5 },  // 5
  { row: 5, col: 6 },  // 6
  { row: 4, col: 6 },  // 7
  { row: 3, col: 6 },  // 8
  { row: 2, col: 6 },  // 9 (Safe)
  { row: 1, col: 6 },  // 10
  { row: 0, col: 6 },  // 11
  { row: 0, col: 7 },  // 12
  { row: 0, col: 8 },  // 13
  { row: 1, col: 8 },  // 14 (GREEN START - Safe)
  { row: 2, col: 8 },  // 15
  { row: 3, col: 8 },  // 16
  { row: 4, col: 8 },  // 17
  { row: 5, col: 8 },  // 18
  { row: 6, col: 9 },  // 19
  { row: 6, col: 10 }, // 20
  { row: 6, col: 11 }, // 21
  { row: 6, col: 12 }, // 22 (Safe)
  { row: 6, col: 13 }, // 23
  { row: 6, col: 14 }, // 24
  { row: 7, col: 14 }, // 25
  { row: 8, col: 14 }, // 26
  { row: 8, col: 13 }, // 27 (YELLOW START - Safe)
  { row: 8, col: 12 }, // 28
  { row: 8, col: 11 }, // 29
  { row: 8, col: 10 }, // 30
  { row: 8, col: 9 },  // 31
  { row: 9, col: 8 },  // 32
  { row: 10, col: 8 }, // 33
  { row: 11, col: 8 }, // 34
  { row: 12, col: 8 }, // 35 (Safe)
  { row: 13, col: 8 }, // 36
  { row: 14, col: 8 }, // 37
  { row: 14, col: 7 }, // 38
  { row: 14, col: 6 }, // 39
  { row: 13, col: 6 }, // 40 (BLUE START - Safe)
  { row: 12, col: 6 }, // 41
  { row: 11, col: 6 }, // 42
  { row: 10, col: 6 }, // 43
  { row: 9, col: 6 },  // 44
  { row: 8, col: 5 },  // 45
  { row: 8, col: 4 },  // 46
  { row: 8, col: 3 },  // 47
  { row: 8, col: 2 },  // 48 (Safe)
  { row: 8, col: 1 },  // 49
  { row: 8, col: 0 },  // 50
  { row: 7, col: 0 },  // 51
];

// Home run paths (5 cells leading inward)
export const HOMERUN_GRID: Record<LudoColor, { row: number; col: number }[]> = {
  RED: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  GREEN: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  YELLOW: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  BLUE: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

// Yard Slots for each color's 4 tokens (percentages of the yard box)
export const YARD_SLOTS = [
  { top: '30%', left: '30%' },
  { top: '30%', left: '70%' },
  { top: '70%', left: '30%' },
  { top: '70%', left: '70%' },
];

export const COLOR_CONFIG: Record<
  LudoColor,
  {
    name: string;
    bg: string;
    border: string;
    tokenBg: string;
    glow: string;
    homeTriangle: string;
    text: string;
  }
> = {
  RED: {
    name: 'Red',
    bg: 'bg-rose-900/40',
    border: 'border-rose-600',
    tokenBg: 'from-rose-500 via-rose-600 to-red-700',
    glow: 'rgba(244, 63, 94, 0.6)',
    homeTriangle: 'border-l-rose-600',
    text: 'text-rose-400',
  },
  GREEN: {
    name: 'Green',
    bg: 'bg-emerald-900/40',
    border: 'border-emerald-600',
    tokenBg: 'from-emerald-400 via-emerald-600 to-green-700',
    glow: 'rgba(16, 185, 129, 0.6)',
    homeTriangle: 'border-t-emerald-600',
    text: 'text-emerald-400',
  },
  YELLOW: {
    name: 'Yellow',
    bg: 'bg-amber-900/40',
    border: 'border-amber-500',
    tokenBg: 'from-amber-300 via-amber-500 to-yellow-600',
    glow: 'rgba(245, 158, 11, 0.7)',
    homeTriangle: 'border-r-amber-500',
    text: 'text-amber-400',
  },
  BLUE: {
    name: 'Blue',
    bg: 'bg-cyan-900/40',
    border: 'border-cyan-600',
    tokenBg: 'from-cyan-400 via-sky-600 to-blue-700',
    glow: 'rgba(14, 165, 233, 0.6)',
    homeTriangle: 'border-b-cyan-600',
    text: 'text-cyan-400',
  },
};

export const LudoBoard: React.FC<LudoBoardProps> = ({
  game,
  myColor,
  onSelectToken,
  disabled = false,
  animatingToken = null,
  boardTheme = 'royal_midnight',
  tokenSkin = 'imperial_crown',
}) => {
  const isMyTurn =
    game.currentTurnColor === myColor &&
    game.hasRolled &&
    !disabled &&
    !animatingToken &&
    !game.isMoving;

  // Flatten all tokens, replacing the animating token with its dynamic hopping step position
  const allTokens = Object.values(game.tokens)
    .flat()
    .map((t) => {
      if (
        animatingToken &&
        t.color === animatingToken.color &&
        t.id === animatingToken.tokenId
      ) {
        return {
          ...t,
          state: animatingToken.step.state,
          trackPos: animatingToken.step.trackPos,
          stepCount: animatingToken.step.stepCount,
          isHopping: true,
        };
      }
      return { ...t, isHopping: false };
    });

  // Helper to get tokens at a track cell
  const getTokensAtTrack = (trackPos: number) => {
    return allTokens.filter((t) => t.state === 'TRACK' && t.trackPos === trackPos);
  };

  // Helper to get tokens in homerun cell
  const getTokensAtHomeRun = (color: LudoColor, stepIndex: number) => {
    return allTokens.filter(
      (t) => t.color === color && t.state === 'HOMERUN' && t.trackPos === stepIndex + 1
    );
  };

  const handleTokenClick = (tokenId: number, color: LudoColor) => {
    if (!isMyTurn || color !== myColor || animatingToken || game.isMoving) return;
    if (!game.movableTokens.includes(tokenId)) return;
    playLudoSound('MOVE');
    onSelectToken(tokenId);
  };

  const getBoardThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'emerald_palace':
        return 'border-2 border-emerald-500/60 shadow-emerald-950/40 bg-[#05150f]';
      case 'ottoman_crimson':
        return 'border-2 border-red-500/60 shadow-red-950/40 bg-[#16060a]';
      case 'obsidian_velvet':
        return 'border-2 border-amber-400/70 shadow-amber-500/20 bg-[#030408]';
      case 'royal_midnight':
      default:
        return 'border-2 border-amber-500/40 shadow-amber-500/10 bg-[#0a0b10]';
    }
  };

  return (
    <div className={`relative w-full max-w-[420px] aspect-square mx-auto rounded-2xl p-2 sm:p-3 shadow-2xl select-none transition-all ${getBoardThemeClasses(boardTheme)}`}>
      {/* 15x15 CSS Grid Container */}
      <div className="relative w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-slate-900/80 rounded-xl overflow-hidden border border-amber-500/30">
        
        {/* =========================================
            1. FOUR CORNER YARDS (6x6 each)
        ========================================= */}
        {/* RED YARD (Top-Left) */}
        <div className="col-span-6 row-span-6 bg-gradient-to-br from-rose-950 via-rose-900/80 to-[#12080a] p-3 border-r-2 border-b-2 border-amber-500/40 relative flex items-center justify-center">
          <div className="w-[85%] h-[85%] bg-[#08090d]/90 rounded-2xl border-2 border-rose-500/60 p-2 relative shadow-inner">
            <span className="absolute top-1 left-2 text-[10px] font-bold tracking-widest text-rose-400/80 uppercase">
              RED YARD
            </span>
            {game.tokens.RED.map((token, idx) => {
              const isMovable = isMyTurn && myColor === 'RED' && game.movableTokens.includes(token.id);
              const isMovingThis = animatingToken?.color === 'RED' && animatingToken.tokenId === token.id && animatingToken.step.state !== 'YARD';
              if (token.state !== 'YARD' || isMovingThis) return null;
              return (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token.id, 'RED')}
                  disabled={!isMovable}
                  style={{
                    top: YARD_SLOTS[idx].top,
                    left: YARD_SLOTS[idx].left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${COLOR_CONFIG.RED.tokenBg} border-2 border-white/80 shadow-lg flex items-center justify-center transition-all ${
                    isMovable
                      ? 'scale-125 ring-4 ring-amber-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-30'
                      : 'opacity-90'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* TOP ARM (Rows 0..5, Cols 6..8) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-[1px] bg-[#0c0e14]">
          {Array.from({ length: 6 }).map((_, r) => {
            return (
              <React.Fragment key={`top-${r}`}>
                {/* Col 0: Track 11..6 going down (11 is row 0, 6 is row 5) */}
                {renderTrackCell(11 - r)}

                {/* Col 1: Green Home Run (r: 0..4) and Top Center (r: 5 is row 5, col 7) */}
                {r === 0 ? (
                  renderTrackCell(12)
                ) : (
                  renderHomeRunCell('GREEN', r - 1)
                )}

                {/* Col 2: Track 13..18 (13 is row 0, 18 is row 5) */}
                {renderTrackCell(13 + r)}
              </React.Fragment>
            );
          })}
        </div>

        {/* GREEN YARD (Top-Right) */}
        <div className="col-span-6 row-span-6 bg-gradient-to-bl from-emerald-950 via-emerald-900/80 to-[#08120c] p-3 border-l-2 border-b-2 border-amber-500/40 relative flex items-center justify-center">
          <div className="w-[85%] h-[85%] bg-[#08090d]/90 rounded-2xl border-2 border-emerald-500/60 p-2 relative shadow-inner">
            <span className="absolute top-1 right-2 text-[10px] font-bold tracking-widest text-emerald-400/80 uppercase">
              GREEN YARD
            </span>
            {game.tokens.GREEN.map((token, idx) => {
              const isMovable = isMyTurn && myColor === 'GREEN' && game.movableTokens.includes(token.id);
              const isMovingThis = animatingToken?.color === 'GREEN' && animatingToken.tokenId === token.id && animatingToken.step.state !== 'YARD';
              if (token.state !== 'YARD' || isMovingThis) return null;
              return (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token.id, 'GREEN')}
                  disabled={!isMovable}
                  style={{
                    top: YARD_SLOTS[idx].top,
                    left: YARD_SLOTS[idx].left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${COLOR_CONFIG.GREEN.tokenBg} border-2 border-white/80 shadow-lg flex items-center justify-center transition-all ${
                    isMovable
                      ? 'scale-125 ring-4 ring-amber-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-30'
                      : 'opacity-90'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================
            2. MIDDLE ROW (LEFT ARM, HOME TRIANGLES, RIGHT ARM)
        ========================================= */}
        {/* LEFT ARM (Rows 6..8, Cols 0..5) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-[1px] bg-[#0c0e14]">
          {/* Row 0 of left arm (Track 0..5) */}
          {Array.from({ length: 6 }).map((_, c) => renderTrackCell(c))}

          {/* Row 1 of left arm: Track 51 (col 0) + Red Home Run (cols 1..5) */}
          {renderTrackCell(51)}
          {Array.from({ length: 5 }).map((_, c) => renderHomeRunCell('RED', c))}

          {/* Row 2 of left arm (Track 50 down to 45) */}
          {Array.from({ length: 6 }).map((_, c) => renderTrackCell(50 - c))}
        </div>

        {/* CENTER HOME TRIANGLES (3x3) */}
        <div className="col-span-3 row-span-3 relative bg-[#07080c] border border-amber-500/50 flex items-center justify-center overflow-hidden">
          {/* Top Triangle (Green) */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 bg-emerald-600/40 border-b border-emerald-400/40"
            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
          />
          {/* Right Triangle (Yellow) */}
          <div
            className="absolute top-0 bottom-0 right-0 w-1/2 bg-amber-500/40 border-l border-amber-400/40"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
          />
          {/* Bottom Triangle (Blue) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-cyan-600/40 border-t border-cyan-400/40"
            style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}
          />
          {/* Left Triangle (Red) */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-rose-600/40 border-r border-rose-400/40"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
          />

          {/* Central Golden Crown */}
          <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-white flex items-center justify-center shadow-lg shadow-amber-500/50">
            <Crown className="w-5 h-5 text-black" />
          </div>

          {/* Finished Home Tokens Count */}
          <div className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none p-1">
            {allTokens
              .filter((t) => t.state === 'HOME')
              .map((t) => (
                <div
                  key={`home-${t.color}-${t.id}`}
                  className={`w-3.5 h-3.5 m-0.5 rounded-full bg-gradient-to-tr ${COLOR_CONFIG[t.color].tokenBg} border border-white shadow`}
                />
              ))}
          </div>
        </div>

        {/* RIGHT ARM (Rows 6..8, Cols 9..14) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-[1px] bg-[#0c0e14]">
          {/* Row 0 of right arm (Track 19..24) */}
          {Array.from({ length: 6 }).map((_, c) => renderTrackCell(19 + c))}

          {/* Row 1 of right arm: Yellow Home Run (cols 0..4) + Track 25 (col 5) */}
          {Array.from({ length: 5 }).map((_, c) => renderHomeRunCell('YELLOW', 4 - c))}
          {renderTrackCell(25)}

          {/* Row 2 of right arm (Track 31 down to 26) */}
          {Array.from({ length: 6 }).map((_, c) => renderTrackCell(31 - c))}
        </div>

        {/* =========================================
            3. BOTTOM YARDS & ARM
        ========================================= */}
        {/* BLUE YARD (Bottom-Left) */}
        <div className="col-span-6 row-span-6 bg-gradient-to-tr from-cyan-950 via-cyan-900/80 to-[#071018] p-3 border-r-2 border-t-2 border-amber-500/40 relative flex items-center justify-center">
          <div className="w-[85%] h-[85%] bg-[#08090d]/90 rounded-2xl border-2 border-cyan-500/60 p-2 relative shadow-inner">
            <span className="absolute bottom-1 left-2 text-[10px] font-bold tracking-widest text-cyan-400/80 uppercase">
              BLUE YARD
            </span>
            {game.tokens.BLUE.map((token, idx) => {
              const isMovable = isMyTurn && myColor === 'BLUE' && game.movableTokens.includes(token.id);
              const isMovingThis = animatingToken?.color === 'BLUE' && animatingToken.tokenId === token.id && animatingToken.step.state !== 'YARD';
              if (token.state !== 'YARD' || isMovingThis) return null;
              return (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token.id, 'BLUE')}
                  disabled={!isMovable}
                  style={{
                    top: YARD_SLOTS[idx].top,
                    left: YARD_SLOTS[idx].left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${COLOR_CONFIG.BLUE.tokenBg} border-2 border-white/80 shadow-lg flex items-center justify-center transition-all ${
                    isMovable
                      ? 'scale-125 ring-4 ring-amber-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-30'
                      : 'opacity-90'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ARM (Rows 9..14, Cols 6..8) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-[1px] bg-[#0c0e14]">
          {Array.from({ length: 6 }).map((_, r) => {
            return (
              <React.Fragment key={`bottom-${r}`}>
                {/* Col 0: Track 44 down to 39 */}
                {renderTrackCell(44 - r)}

                {/* Col 1: Blue Home Run (r: 0..4 is steps 4..0) and Bottom Center (r: 5 is track 38) */}
                {r === 5 ? (
                  renderTrackCell(38)
                ) : (
                  renderHomeRunCell('BLUE', 4 - r)
                )}

                {/* Col 2: Track 32..37 */}
                {renderTrackCell(32 + r)}
              </React.Fragment>
            );
          })}
        </div>

        {/* YELLOW YARD (Bottom-Right) */}
        <div className="col-span-6 row-span-6 bg-gradient-to-tl from-amber-950 via-amber-900/80 to-[#151006] p-3 border-l-2 border-t-2 border-amber-500/40 relative flex items-center justify-center">
          <div className="w-[85%] h-[85%] bg-[#08090d]/90 rounded-2xl border-2 border-amber-500/60 p-2 relative shadow-inner">
            <span className="absolute bottom-1 right-2 text-[10px] font-bold tracking-widest text-amber-400/80 uppercase">
              YELLOW YARD
            </span>
            {game.tokens.YELLOW.map((token, idx) => {
              const isMovable = isMyTurn && myColor === 'YELLOW' && game.movableTokens.includes(token.id);
              const isMovingThis = animatingToken?.color === 'YELLOW' && animatingToken.tokenId === token.id && animatingToken.step.state !== 'YARD';
              if (token.state !== 'YARD' || isMovingThis) return null;
              return (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token.id, 'YELLOW')}
                  disabled={!isMovable}
                  style={{
                    top: YARD_SLOTS[idx].top,
                    left: YARD_SLOTS[idx].left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${COLOR_CONFIG.YELLOW.tokenBg} border-2 border-white/80 shadow-lg flex items-center justify-center transition-all ${
                    isMovable
                      ? 'scale-125 ring-4 ring-amber-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-30'
                      : 'opacity-90'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );

  // Helper renderers
  function renderTrackCell(trackPos: number) {
    const isSafe = SAFE_SQUARES.includes(trackPos);
    const tokensHere = getTokensAtTrack(trackPos);

    // Color starting square accents
    let cellBg = 'bg-[#12141c] hover:bg-[#1a1d27]';
    let borderAccent = 'border-slate-800';
    if (trackPos === 1) {
      cellBg = 'bg-rose-950/60';
      borderAccent = 'border-rose-500/50';
    } else if (trackPos === 14) {
      cellBg = 'bg-emerald-950/60';
      borderAccent = 'border-emerald-500/50';
    } else if (trackPos === 27) {
      cellBg = 'bg-amber-950/60';
      borderAccent = 'border-amber-500/50';
    } else if (trackPos === 40) {
      cellBg = 'bg-cyan-950/60';
      borderAccent = 'border-cyan-500/50';
    }

    return (
      <div
        key={`track-${trackPos}`}
        className={`relative aspect-square ${cellBg} ${borderAccent} border flex items-center justify-center transition-colors`}
      >
        {/* Star Icon for Safe Squares */}
        {isSafe && (
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/80 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
        )}

        {/* Tokens on this square */}
        {tokensHere.map((token, idx) => {
          const isMovable = isMyTurn && token.color === myColor && game.movableTokens.includes(token.id);
          const offsetStyle = tokensHere.length > 1
            ? {
                transform: `translate(${(idx - (tokensHere.length - 1) / 2) * 5}px, ${(idx - (tokensHere.length - 1) / 2) * -4}px)`,
              }
            : {};

          const isHopping = Boolean((token as any).isHopping);
          return (
            <button
              key={`token-${token.color}-${token.id}`}
              onClick={() => handleTokenClick(token.id, token.color)}
              disabled={!isMovable || isHopping}
              style={offsetStyle}
              className={`absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr ${COLOR_CONFIG[token.color].tokenBg} border-2 border-white shadow-md flex items-center justify-center transition-all ${
                isHopping
                  ? 'scale-140 ring-4 ring-yellow-400 ring-offset-2 ring-offset-black z-40 drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-bounce'
                  : isMovable
                  ? 'scale-125 ring-2 ring-amber-400 ring-offset-1 ring-offset-black animate-pulse cursor-pointer z-20'
                  : 'z-20'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </button>
          );
        })}
      </div>
    );
  }

  function renderHomeRunCell(color: LudoColor, stepIndex: number) {
    const tokensHere = getTokensAtHomeRun(color, stepIndex);
    const bgMap: Record<LudoColor, string> = {
      RED: 'bg-rose-700/80 border-rose-500/40',
      GREEN: 'bg-emerald-700/80 border-emerald-500/40',
      YELLOW: 'bg-amber-600/80 border-amber-400/40',
      BLUE: 'bg-cyan-700/80 border-cyan-500/40',
    };

    return (
      <div
        key={`homerun-${color}-${stepIndex}`}
        className={`relative aspect-square ${bgMap[color]} border flex items-center justify-center shadow-inner`}
      >
        <div className="w-1 h-1 rounded-full bg-white/20" />
        {tokensHere.map((token, idx) => {
          const isMovable = isMyTurn && token.color === myColor && game.movableTokens.includes(token.id);
          const isHopping = Boolean((token as any).isHopping);
          const offsetStyle = tokensHere.length > 1
            ? {
                transform: `translate(${(idx - (tokensHere.length - 1) / 2) * 4}px, ${(idx - (tokensHere.length - 1) / 2) * -3}px)`,
              }
            : {};

          return (
            <button
              key={`token-${token.color}-${token.id}`}
              onClick={() => handleTokenClick(token.id, token.color)}
              disabled={!isMovable || isHopping}
              style={offsetStyle}
              className={`absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr ${COLOR_CONFIG[token.color].tokenBg} border-2 border-white shadow-md flex items-center justify-center transition-all ${
                isHopping
                  ? 'scale-140 ring-4 ring-yellow-400 ring-offset-2 ring-offset-black z-40 drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-bounce'
                  : isMovable
                  ? 'scale-125 ring-2 ring-amber-400 ring-offset-1 ring-offset-black animate-pulse cursor-pointer z-20'
                  : 'z-20'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </button>
          );
        })}
      </div>
    );
  }
};
