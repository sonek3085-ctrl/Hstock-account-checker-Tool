import React, { useState, useEffect } from 'react';
import { PlayerProfile, Tournament, TournamentMatch } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import { playLudoSound } from '../utils/ludoRules';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  Coins,
  Users,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onUpdatePlayer: (updated: PlayerProfile) => void;
  onEnterTournamentMatch: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
  onEnterTournamentMatch,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRewardsPopup, setShowRewardsPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTournaments();
    }
  }, [isOpen]);

  const loadTournaments = async () => {
    try {
      const data = await ludoApi.getTournaments();
      setTournaments(data);
      if (data.length > 0) setSelectedTournament(data[0]);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUserRegistered = selectedTournament?.registeredPlayers.some(
    (p) => p.id === player.id
  );

  const handleRegister = async () => {
    if (!selectedTournament) return;
    setIsRegistering(true);
    try {
      const res = await ludoApi.registerTournament(player.id, selectedTournament.id);
      onUpdatePlayer(res.player);
      setSelectedTournament(res.tournament);
      playLudoSound('SAFE');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#eab308', '#f59e0b', '#3b82f6'],
      });
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const quarterMatches =
    selectedTournament?.matches.filter((m) => m.round === 'QUARTERS') || [];
  const semiMatches =
    selectedTournament?.matches.filter((m) => m.round === 'SEMIS') || [];
  const finalMatch =
    selectedTournament?.matches.find((m) => m.round === 'FINALS') || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#131520] via-[#0b0d14] to-[#07080c] border border-amber-500/40 p-5 shadow-2xl shadow-amber-500/10 text-white flex flex-col max-h-[92vh]">
        
        {/* Top Header: "Tournament Lobby UI" */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white tracking-wide uppercase">
                Championship Tournaments
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                Knockout Arena & Bracket
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

        {selectedTournament && (
          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {/* Tournament Banner Card: "Tournament Registration Screen" */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#191512] to-yellow-950/70 border border-amber-500/40 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  8-Player Single Elimination
                </span>
                <h4 className="font-heading font-black text-sm text-white mt-0.5">
                  {selectedTournament.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Entry: {selectedTournament.entryFee.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    Prize: {selectedTournament.prizePool.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Registration / Action Status */}
              <div>
                {isUserRegistered ? (
                  <button
                    onClick={() => {
                      onClose();
                      onEnterTournamentMatch();
                    }}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1 animate-pulse"
                  >
                    <span>Play Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || player.coins < selectedTournament.entryFee}
                    className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1 ${
                      player.coins >= selectedTournament.entryFee
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Join ({selectedTournament.entryFee})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Participants counter */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Registered: {selectedTournament.registeredPlayers.length} /{' '}
                  {selectedTournament.maxParticipants}
                </span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
                <Clock className="w-3 h-3" />
                <span>Starts in ~4 mins</span>
              </span>
            </div>

            {/* ========================================================
                "Tournament Bracket Component" (Knockout Tree)
            ======================================================== */}
            <div className="p-3 rounded-2xl bg-[#0e101a] border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  <span>Knockout Bracket</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Single Elimination
                </span>
              </div>

              {/* Bracket Rounds Columns */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                
                {/* Column 1: Quarter-Finals */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">
                    Quarter-Finals
                  </span>
                  {quarterMatches.map((m) => (
                    <div
                      key={m.id}
                      className="p-1.5 rounded-xl bg-[#141624] border border-slate-800 space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`truncate max-w-[65px] font-medium ${m.winnerId === m.player1?.id ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                          {m.player1?.name || 'TBD'}
                        </span>
                        {m.score1 !== undefined && (
                          <span className="font-mono text-slate-400">{m.score1}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`truncate max-w-[65px] font-medium ${m.winnerId === m.player2?.id ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                          {m.player2?.name || (m.round === 'QUARTERS' && !m.player2 ? 'Open Slot' : 'TBD')}
                        </span>
                        {m.score2 !== undefined && (
                          <span className="font-mono text-slate-400">{m.score2}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Semi-Finals */}
                <div className="space-y-3 pt-4">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">
                    Semi-Finals
                  </span>
                  {semiMatches.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-xl bg-[#141624] border border-amber-500/20 space-y-1 text-left my-2"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[65px] text-slate-300 font-medium">
                          {m.player1?.name || 'Waiting...'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[65px] text-slate-300 font-medium">
                          {m.player2?.name || 'Waiting...'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3: Grand Final & Trophy */}
                <div className="space-y-3 pt-8">
                  <span className="font-bold text-amber-400 uppercase tracking-widest text-[9px] block">
                    Grand Final 🏆
                  </span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#1b1c2b] to-[#11121d] border-2 border-amber-400/60 text-center space-y-1">
                    <Crown className="w-5 h-5 text-amber-400 mx-auto animate-bounce" />
                    <span className="text-[10px] text-amber-300 font-bold block truncate">
                      {finalMatch?.player1?.name || 'Finalist 1'}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase">VS</span>
                    <span className="text-[10px] text-amber-300 font-bold block truncate">
                      {finalMatch?.player2?.name || 'Finalist 2'}
                    </span>
                    <div className="pt-1 text-[9px] text-emerald-400 font-mono font-bold">
                      Prize: 3,500 Coins
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* "Tournament Leaderboard" & "Player Standings Table" */}
            <div className="p-3 rounded-2xl bg-[#0e101a] border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Player Standings Table
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {selectedTournament.registeredPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-1.5 rounded-xl bg-[#141624] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[10px]">#{idx + 1}</span>
                      <span>{p.name}</span>
                      {p.id === player.id && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Lv. {p.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
