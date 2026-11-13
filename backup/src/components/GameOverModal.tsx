import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, RoomPlayer } from '../types/ludo';
import { playLudoSound } from '../utils/ludoRules';
import { Trophy, Crown, Medal, ArrowRight, RotateCcw, Coins } from 'lucide-react';
import { COLOR_CONFIG } from './LudoBoard';

interface GameOverModalProps {
  isOpen: boolean;
  game: GameState;
  myPlayerId: string;
  onPlayAgain: () => void;
  onExitLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  game,
  myPlayerId,
  onPlayAgain,
  onExitLobby,
}) => {
  useEffect(() => {
    if (isOpen) {
      playLudoSound('VICTORY');
      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#f59e0b', '#d97706', '#ffffff'],
        });
      } catch {
        // Fallback if canvas is unavailable
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const myWinnerInfo = game.winners.find((w) => w.playerId === myPlayerId);
  const isWinner = myWinnerInfo?.rank === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0c0d13] border-2 border-amber-500/50 p-6 shadow-2xl shadow-amber-500/20 text-white flex flex-col items-center">
        
        {/* Victory Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-white flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 -mt-12">
          {isWinner ? (
            <Trophy className="w-9 h-9 text-black drop-shadow" />
          ) : (
            <Medal className="w-9 h-9 text-black drop-shadow" />
          )}
        </div>

        <h2 className="font-heading font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300">
          {isWinner ? 'ROYAL VICTORY!' : 'MATCH FINISHED'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          {game.mode.replace('_', ' ')} Match Standings
        </p>

        {/* Standings List */}
        <div className="w-full space-y-2.5 mb-6">
          {game.winners.map((winner) => {
            const player = game.players.find((p) => p.color === winner.color);
            const colorTheme = COLOR_CONFIG[winner.color];
            const isMe = winner.playerId === myPlayerId;
            const coinReward = winner.rank === 1 ? 2000 : winner.rank === 2 ? 1000 : 500;

            return (
              <div
                key={`standing-${winner.color}`}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isMe
                    ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-400/40'
                    : 'bg-[#12141c] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      winner.rank === 1
                        ? 'bg-amber-400 text-black shadow'
                        : winner.rank === 2
                        ? 'bg-slate-300 text-black'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    #{winner.rank}
                  </span>

                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${colorTheme.bg} border border-current`} />
                      {player?.name || 'Player'}
                      {isMe && <span className="text-[10px] text-amber-400 font-normal">(You)</span>}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {colorTheme.name} Dynasty
                    </span>
                  </div>
                </div>

                {/* Coin Reward Pill */}
                <div className="flex items-center gap-1 text-xs font-black text-amber-300 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  +{coinReward.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={onExitLobby}
            className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Lobby
          </button>
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black text-xs font-black tracking-wide transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
