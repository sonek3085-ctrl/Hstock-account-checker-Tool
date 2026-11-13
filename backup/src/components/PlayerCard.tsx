import React from 'react';
import { RoomPlayer, LudoColor, Token } from '../types/ludo';
import { COLOR_CONFIG } from './LudoBoard';
import { Crown, Bot, WifiOff, Coins } from 'lucide-react';

interface PlayerCardProps {
  player: RoomPlayer;
  tokens: Token[];
  isCurrentTurn: boolean;
  isMe: boolean;
  turnTimeLeft?: number;
}

const AVATAR_MAP: Record<string, string> = {
  crown: '👑',
  king: '🤴',
  queen: '👸',
  tiger: '🐯',
  lion: '🦁',
  diamond: '💎',
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  tokens,
  isCurrentTurn,
  isMe,
  turnTimeLeft,
}) => {
  const colorTheme = COLOR_CONFIG[player.color] || COLOR_CONFIG.RED;
  const finishedTokensCount = tokens.filter((t) => t.state === 'HOME').length;
  const avatarEmoji = AVATAR_MAP[player.avatar] || '👑';

  return (
    <div
      className={`relative flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200 border ${
        isCurrentTurn
          ? `bg-[#131622] ${colorTheme.border} ring-2 ring-amber-400/50 shadow-lg`
          : 'bg-[#0d0e14]/90 border-slate-800/80 opacity-90'
      }`}
    >
      {/* Avatar Container with Color Badge */}
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#181a24] border-2 ${colorTheme.border} shadow`}
        >
          {avatarEmoji}
        </div>
        {/* Color Indicator Dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${colorTheme.tokenBg} border border-black shadow`}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
            {player.name}
          </p>
          {isMe && (
            <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded">
              You
            </span>
          )}
          {player.isBot && (
            <span className="text-[9px] font-bold px-1 py-0.2 bg-slate-800 text-slate-400 rounded flex items-center gap-0.5">
              <Bot className="w-2.5 h-2.5" /> Bot
            </span>
          )}
          {!player.isConnected && (
            <span title="Disconnected">
              <WifiOff className="w-3 h-3 text-rose-400" />
            </span>
          )}
        </div>

        {/* Progress: Tokens Home (0/4) & Active indicator */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${
                  idx < finishedTokensCount
                    ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,1)]'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {finishedTokensCount}/4 Home
          </span>
        </div>
      </div>

      {/* Turn Countdown Badge or Rank Badge */}
      {player.finishRank ? (
        <div className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-xs font-black shadow flex items-center gap-1">
          <Crown className="w-3 h-3" />
          #{player.finishRank}
        </div>
      ) : isCurrentTurn && turnTimeLeft !== undefined ? (
        <div
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
            turnTimeLeft <= 4 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {turnTimeLeft}s
        </div>
      ) : null}
    </div>
  );
};
