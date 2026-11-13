import React, { useState, useEffect, useRef } from 'react';
import {
  PlayerProfile,
  GameState,
  GameMode,
  LudoColor,
  AppLanguage,
  TokenStepInfo,
} from './types/ludo';
import { ludoApi, socketClient } from './services/ludoApi';
import { playLudoSound } from './utils/ludoRules';
import { turkishMusic } from './utils/turkishMusicEngine';
import { LudoLobby } from './components/LudoLobby';
import { LudoBoard } from './components/LudoBoard';
import { Dice3D } from './components/Dice3D';
import { PlayerCard } from './components/PlayerCard';
import { RewardedAdModal } from './components/RewardedAdModal';
import { GameOverModal } from './components/GameOverModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { LudoAdminDashboard } from './components/LudoAdminDashboard';
import { OttomanMusicPlayer } from './components/OttomanMusicPlayer';
import {
  Crown,
  Coins,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Bot,
  Users,
  Smartphone,
} from 'lucide-react';

export const App: React.FC = () => {
  // Current Player
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [view, setView] = useState<'LOBBY' | 'MATCHMAKING' | 'PLAYING'>('LOBBY');
  const [game, setGame] = useState<GameState | null>(null);
  const [turnTimer, setTurnTimer] = useState<number>(15);

  // App Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<AppLanguage>('en');

  // Modals & Links
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Smooth Token Hopping Animation State
  const [animatingToken, setAnimatingToken] = useState<{
    color: LudoColor;
    tokenId: number;
    step: TokenStepInfo;
    isCapturing?: boolean;
  } | null>(null);
  const hopIntervalRef = useRef<any>(null);

  // Cooldowns
  const [canClaimDaily, setCanClaimDaily] = useState(true);
  const [dailyHoursLeft, setDailyHoursLeft] = useState<number>(0);
  const [adCooldownSec, setAdCooldownSec] = useState<number>(0);

  // Quick Chat message bubble
  const [chatMessage, setChatMessage] = useState<{ sender: string; text: string } | null>(null);

  // Timer ref for local second countdown
  const turnIntervalRef = useRef<any>(null);

  // ==========================================
  // 1. Initial Player Authentication & Auto-Join URL
  // ==========================================
  useEffect(() => {
    initPlayer();
  }, []);

  // Browser Autoplay: Auto-play Sultan Abdul Hamid background music on first user touch/click
  useEffect(() => {
    const startMusicOnInteraction = () => {
      const state = turkishMusic.getState();
      if (!state.isPlaying && !state.isMuted) {
        turkishMusic.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', startMusicOnInteraction);
      window.removeEventListener('keydown', startMusicOnInteraction);
      window.removeEventListener('touchstart', startMusicOnInteraction);
    };

    window.addEventListener('pointerdown', startMusicOnInteraction, { passive: true });
    window.addEventListener('keydown', startMusicOnInteraction, { passive: true });
    window.addEventListener('touchstart', startMusicOnInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', startMusicOnInteraction);
      window.removeEventListener('keydown', startMusicOnInteraction);
      window.removeEventListener('touchstart', startMusicOnInteraction);
    };
  }, []);

  const initPlayer = async () => {
    try {
      const storedId = localStorage.getItem('aurum_player_id');
      const storedName = localStorage.getItem('aurum_player_name');
      const profile = await ludoApi.authPlayer({
        id: storedId || undefined,
        name: storedName || undefined,
        avatar: 'crown',
        isGuest: true,
      });
      localStorage.setItem('aurum_player_id', profile.id);
      localStorage.setItem('aurum_player_name', profile.name);
      setPlayer(profile);
      socketClient.connect(profile);
      checkBonusCooldowns(profile);

      // Check if URL has ?join=ROOMCODE
      const urlParams = new URLSearchParams(window.location.search);
      const joinCode = urlParams.get('join');
      if (joinCode && joinCode.trim().length > 0) {
        setView('MATCHMAKING');
        // Small delay to ensure socket handshake
        setTimeout(() => {
          socketClient.send({
            type: 'JOIN_PRIVATE_ROOM',
            code: joinCode.trim().toUpperCase(),
            player: { id: profile.id, name: profile.name, avatar: profile.avatar },
          });
          // Clean URL without reloading page
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 350);
      }
    } catch (err) {
      console.error('Failed to init player:', err);
    }
  };

  const checkBonusCooldowns = (p: PlayerProfile) => {
    const now = Date.now();
    if (p.lastDailyBonusAt) {
      const hours = (now - new Date(p.lastDailyBonusAt).getTime()) / (1000 * 60 * 60);
      if (hours < 24) {
        setCanClaimDaily(false);
        setDailyHoursLeft(Math.ceil(24 - hours));
      } else {
        setCanClaimDaily(true);
      }
    } else {
      setCanClaimDaily(true);
    }

    if (p.lastAdWatchedAt) {
      const sec = (now - new Date(p.lastAdWatchedAt).getTime()) / 1000;
      if (sec < 30) {
        setAdCooldownSec(Math.ceil(30 - sec));
      } else {
        setAdCooldownSec(0);
      }
    }
  };

  // Tick down ad cooldown
  useEffect(() => {
    if (adCooldownSec > 0) {
      const t = setTimeout(() => setAdCooldownSec((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [adCooldownSec]);

  // Cleanup hop interval on unmount
  useEffect(() => {
    return () => {
      if (hopIntervalRef.current) {
        clearInterval(hopIntervalRef.current);
      }
    };
  }, []);

  // ==========================================
  // 2. WebSocket Multiplayer Listeners
  // ==========================================
  useEffect(() => {
    const unsubscribe = socketClient.onMessage((msg) => {
      switch (msg.type) {
        case 'WAITING_FOR_MATCH': {
          setView('MATCHMAKING');
          break;
        }

        case 'MATCH_FOUND':
        case 'ROOM_CREATED':
        case 'ROOM_UPDATED': {
          setGame(msg.game);
          if (msg.game.status === 'IN_PROGRESS') {
            setView('PLAYING');
            setTurnTimer(msg.game.turnTimeLeft || 15);
          } else {
            setView('MATCHMAKING');
          }
          break;
        }

        case 'DICE_ROLLED': {
          setGame((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              diceValue: msg.diceValue,
              hasRolled: true,
              movableTokens: msg.movableTokens || [],
              currentTurnColor: msg.currentTurnColor,
            };
          });
          break;
        }

        // Paced Step-by-Step Hop Animation
        case 'TOKEN_MOVE_STARTED': {
          const col = msg.color as LudoColor;
          const tokenId = msg.tokenId as number;
          const path = msg.path as TokenStepInfo[];
          const animDuration = msg.animDuration as number;
          const captured = msg.captured;
          const finalToken = msg.finalToken;
          if (!path || path.length === 0) return;

          // Lock game movement flag locally
          setGame((prev) => (prev ? { ...prev, isMoving: true } : null));

          if (hopIntervalRef.current) {
            clearInterval(hopIntervalRef.current);
          }

          // Step interval duration: each hop takes evenly spaced time (approx 240-350ms)
          const stepInterval = Math.max(160, Math.floor(animDuration / path.length));
          let currentStepIdx = 0;

          // Immediately render step 0
          setAnimatingToken({
            color: col,
            tokenId,
            step: path[0],
          });
          playLudoSound('MOVE');

          hopIntervalRef.current = setInterval(() => {
            currentStepIdx++;
            if (currentStepIdx < path.length) {
              setAnimatingToken({
                color: col,
                tokenId,
                step: path[currentStepIdx],
              });
              playLudoSound('MOVE');
            } else {
              // Hopping completed!
              clearInterval(hopIntervalRef.current);
              hopIntervalRef.current = null;
              setAnimatingToken(null);

              if (captured) {
                playLudoSound('CAPTURE');
              }

              // Apply final authoritative positions
              setGame((prev) => {
                if (!prev) return null;
                const updated = { ...prev.tokens };
                updated[col] = updated[col].map((t) =>
                  t.id === tokenId ? finalToken : t
                );

                if (captured) {
                  const capColor = captured.color as LudoColor;
                  updated[capColor] = updated[capColor].map((t) =>
                    t.id === captured.tokenId
                      ? { ...t, state: 'YARD', stepCount: 0, trackPos: -1 }
                      : t
                  );
                }

                return {
                  ...prev,
                  tokens: updated,
                  isMoving: false,
                };
              });
            }
          }, stepInterval);
          break;
        }

        case 'TOKEN_MOVED': {
          // Fallback if TOKEN_MOVE_STARTED was skipped
          setGame((prev) => {
            if (!prev) return null;
            const updated = { ...prev.tokens };
            updated[msg.color as LudoColor] = updated[msg.color as LudoColor].map((t) =>
              t.id === msg.tokenId ? msg.token : t
            );

            if (msg.captured) {
              const capColor = msg.captured.color as LudoColor;
              updated[capColor] = updated[capColor].map((t) =>
                t.id === msg.captured.tokenId
                  ? { ...t, state: 'YARD', stepCount: 0, trackPos: -1 }
                  : t
              );
              playLudoSound('CAPTURE');
            } else {
              playLudoSound('MOVE');
            }

            return {
              ...prev,
              tokens: updated,
              isMoving: false,
            };
          });
          break;
        }

        case 'TURN_CHANGED':
        case 'EXTRA_TURN': {
          setTurnTimer(msg.turnTimeLeft || 15);
          setGame((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              currentTurnColor: msg.currentTurnColor,
              diceValue: null,
              hasRolled: false,
              movableTokens: [],
              isMoving: false,
            };
          });
          break;
        }

        case 'GAME_OVER': {
          setGame((prev) => {
            if (!prev) return null;
            return { ...prev, status: 'COMPLETED', winners: msg.winners, isMoving: false };
          });
          setIsGameOverOpen(true);
          // Refresh player coins after match settle
          if (player) {
            ludoApi.getPlayer(player.id).then(setPlayer);
          }
          break;
        }

        case 'CHAT_MESSAGE': {
          setChatMessage({ sender: msg.sender, text: msg.message });
          setTimeout(() => setChatMessage(null), 3500);
          break;
        }

        case 'ERROR': {
          alert(msg.message || 'Game server notification');
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [player]);

  // Turn Timer countdown tick
  useEffect(() => {
    if (view === 'PLAYING' && game?.status === 'IN_PROGRESS') {
      clearInterval(turnIntervalRef.current);
      turnIntervalRef.current = setInterval(() => {
        setTurnTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(turnIntervalRef.current);
    }
  }, [view, game?.currentTurnColor, game?.hasRolled]);

  // ==========================================
  // 3. Game Actions
  // ==========================================
  const handleSelectMode = (mode: GameMode, maxPlayers: 2 | 4) => {
    if (!player) return;
    setView('MATCHMAKING');
    socketClient.send({
      type: 'FIND_MATCH',
      mode,
      maxPlayers,
      player: { id: player.id, name: player.name, avatar: player.avatar },
    });
  };

  const handleStartBotGame = () => {
    if (!player) return;
    setView('MATCHMAKING');
    socketClient.send({
      type: 'START_BOT_GAME',
      maxPlayers: 2,
      player: { id: player.id, name: player.name, avatar: player.avatar },
    });
  };

  const handleCancelMatchmaking = () => {
    socketClient.send({ type: 'CANCEL_MATCHMAKING' });
    setView('LOBBY');
  };

  const handleCreatePrivateRoom = (maxPlayers: 2 | 4) => {
    if (!player) return;
    setView('MATCHMAKING');
    socketClient.send({
      type: 'CREATE_PRIVATE_ROOM',
      maxPlayers,
      player: { id: player.id, name: player.name, avatar: player.avatar },
    });
  };

  const handleJoinPrivateRoom = (code: string) => {
    if (!player) return;
    setView('MATCHMAKING');
    socketClient.send({
      type: 'JOIN_PRIVATE_ROOM',
      code: code.trim().toUpperCase(),
      player: { id: player.id, name: player.name, avatar: player.avatar },
    });
  };

  const handleRollDice = () => {
    if (!game || !player || game.isMoving || animatingToken) return;
    socketClient.send({
      type: 'ROLL_DICE',
      roomId: game.roomId,
      playerId: player.id,
    });
  };

  const handleSelectToken = (tokenId: number) => {
    if (!game || !player || game.isMoving || animatingToken) return;
    socketClient.send({
      type: 'MOVE_TOKEN',
      roomId: game.roomId,
      playerId: player.id,
      tokenId,
    });
  };

  const handleSendChat = (message: string) => {
    socketClient.send({ type: 'SEND_CHAT', message });
  };

  // Rewards Handlers
  const handleClaimDailyBonus = async () => {
    if (!player) return;
    try {
      const res = await ludoApi.claimDailyBonus(player.id);
      setPlayer(res.player);
      playLudoSound('SAFE');
      setCanClaimDaily(false);
      setDailyHoursLeft(24);
      alert(`🎁 Claimed +${res.bonusAmount.toLocaleString()} Free Virtual Coins!`);
    } catch (err: any) {
      alert(err.message || 'Daily bonus error');
    }
  };

  const handleWatchAd = () => {
    setIsAdOpen(true);
  };

  const handleAdRewardComplete = async () => {
    if (!player) return;
    setIsAdOpen(false);
    try {
      const res = await ludoApi.claimRewardedAd(player.id);
      setPlayer(res.player);
      setAdCooldownSec(30);
      playLudoSound('SAFE');
      alert(`📺 Ad Completed! +${res.rewardAmount} Free Virtual Coins added to wallet.`);
    } catch (err: any) {
      alert(err.message || 'Ad reward error');
    }
  };

  const myPlayerInGame = game?.players.find((p) => p.id === player?.id);
  const myColor = myPlayerInGame?.color || 'RED';
  const isMyTurn = game?.currentTurnColor === myColor && game?.status === 'IN_PROGRESS';
  const canRoll = Boolean(isMyTurn && !game?.hasRolled && !game?.isMoving && !animatingToken);

  const inviteLink = game?.roomCode
    ? `${window.location.origin}/?join=${game.roomCode}`
    : '';

  const handleCopyCode = () => {
    if (game?.roomCode) {
      navigator.clipboard.writeText(game.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!game?.roomCode) return;
    const msg = `🏆 Join my AURUM LUDO royal match! Room Code: ${game.roomCode}\nClick this link to play with me right now:\n${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Entering Aurum Arena...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex justify-center font-sans">
      {/* Mobile Shell Framing */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#090a10] border-x border-amber-500/20 shadow-2xl overflow-x-hidden">
        
        {/* =========================================
            VIEW 1: LOBBY
        ========================================= */}
        {view === 'LOBBY' && (
          <LudoLobby
            player={player}
            onSelectMode={handleSelectMode}
            onStartBotGame={handleStartBotGame}
            onCreatePrivateRoom={handleCreatePrivateRoom}
            onJoinPrivateRoom={handleJoinPrivateRoom}
            onClaimDailyBonus={handleClaimDailyBonus}
            onWatchAd={handleWatchAd}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            language={language}
            onToggleLanguage={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            canClaimDaily={canClaimDaily}
            dailyHoursLeft={dailyHoursLeft}
            adCooldownSec={adCooldownSec}
          />
        )}

        {/* =========================================
            VIEW 2: MATCHMAKING / WAITING ROOM
        ========================================= */}
        {view === 'MATCHMAKING' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleCancelMatchmaking}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <OttomanMusicPlayer compact />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {game?.mode ? game.mode.replace('_', ' ') : 'MATCHMAKING'}
              </span>
            </div>

            {/* Center Animation & Invitation Share Controls */}
            <div className="my-auto space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 animate-ping" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Crown className="w-12 h-12 text-black" />
                </div>
              </div>

              <div>
                <h3 className="font-heading font-black text-xl text-white">
                  {game?.mode === 'PRIVATE_ROOM'
                    ? 'Private Room Created'
                    : 'Searching For Real Players...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {game?.mode === 'PRIVATE_ROOM'
                    ? 'Share your room code or link with another device to join'
                    : 'Pairing you with a live online opponent via WebSocket'}
                </p>
              </div>

              {/* Private Room Share Card (Code + Link + WhatsApp) */}
              {game?.mode === 'PRIVATE_ROOM' && (
                <div className="p-4 rounded-2xl bg-[#12141f] border border-amber-500/40 max-w-sm mx-auto space-y-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Room Code & Invitation Link
                  </span>
                  
                  {/* Code Display */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0b0c13] border border-amber-500/30">
                    <span className="text-xl font-mono font-black text-amber-300 tracking-widest">
                      {game.roomCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Shareable Link Button */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Invitation Link for 2nd Device'}</span>
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Share via WhatsApp</span>
                  </button>

                  <p className="text-[10px] text-slate-400 italic">
                    Open this link on any phone or browser tab to join this room instantly.
                  </p>
                </div>
              )}

              {/* Online Quick Play Bot Fallback */}
              {game?.mode !== 'PRIVATE_ROOM' && (
                <div className="p-3 rounded-xl bg-[#12141e] border border-slate-800 max-w-xs mx-auto space-y-2">
                  <span className="text-[11px] text-slate-400">
                    Want to play immediately without waiting?
                  </span>
                  <button
                    onClick={handleStartBotGame}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Play vs Computer Bot Now</span>
                  </button>
                </div>
              )}

              {/* Joined Players */}
              {game && (
                <div className="max-w-xs mx-auto space-y-2 text-left">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Players</span>
                    <span className="text-amber-400">{game.players.length} / {game.maxPlayers}</span>
                  </p>
                  {game.players.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-[#12141e] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.isBot ? 'bg-purple-400' : 'bg-amber-400'}`} />
                        {p.name} {p.isBot && <span className="text-[9px] text-purple-300 font-normal">(Bot)</span>}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelMatchmaking}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* =========================================
            VIEW 3: ACTIVE PLAYING ARENA
        ========================================= */}
        {view === 'PLAYING' && game && (
          <div className="flex-1 flex flex-col justify-between p-3 select-none">
            {/* Top Bar: Back, Ottoman Music, Coin Ledger, Chat quick reactions */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800 gap-1.5">
              <button
                onClick={() => {
                  if (confirm('Leave match? You will forfeit your place.')) {
                    handleCancelMatchmaking();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#12141e] border border-slate-800"
                title="Leave Match"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <OttomanMusicPlayer compact />

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12141e] border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {player.coins.toLocaleString()}
              </div>

              {/* Quick Chat Reaction Triggers */}
              <div className="flex items-center gap-1">
                {['👏', '🔥', '👑', '😎'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendChat(emoji)}
                    className="p-1 text-sm hover:scale-125 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Chat Bubble Overlay */}
            {chatMessage && (
              <div className="w-fit mx-auto mt-2 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
                <MessageSquare className="w-3 h-3" />
                <span>{chatMessage.sender}:</span>
                <span className="font-normal">{chatMessage.text}</span>
              </div>
            )}

            {/* Top Players Cards (Opponents) */}
            <div className="grid grid-cols-2 gap-2 my-2">
              {game.players
                .filter((p) => p.color === 'RED' || p.color === 'GREEN')
                .map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    tokens={game.tokens[p.color]}
                    isCurrentTurn={game.currentTurnColor === p.color}
                    isMe={p.id === player.id}
                    turnTimeLeft={game.currentTurnColor === p.color ? turnTimer : undefined}
                  />
                ))}
            </div>

            {/* 15x15 Interactive Ludo Board with Real-Time Hopping */}
            <div className="my-auto py-1">
              <LudoBoard
                game={game}
                myColor={myColor}
                onSelectToken={handleSelectToken}
                disabled={!isMyTurn || Boolean(game.isMoving) || Boolean(animatingToken)}
                animatingToken={animatingToken}
              />
            </div>

            {/* Bottom Players Cards (Self & Opponent) */}
            <div className="grid grid-cols-2 gap-2 my-2">
              {game.players
                .filter((p) => p.color === 'BLUE' || p.color === 'YELLOW')
                .map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    tokens={game.tokens[p.color]}
                    isCurrentTurn={game.currentTurnColor === p.color}
                    isMe={p.id === player.id}
                    turnTimeLeft={game.currentTurnColor === p.color ? turnTimer : undefined}
                  />
                ))}
            </div>

            {/* Bottom Dice Control Section */}
            <div className="border-t border-slate-800/80 pt-2 pb-1">
              <Dice3D
                value={game.diceValue}
                turnColor={game.currentTurnColor}
                canRoll={canRoll}
                onRoll={handleRollDice}
                turnTimeLeft={turnTimer}
                sixCount={game.sixCount}
              />
            </div>
          </div>
        )}

        {/* =========================================
            MODALS
        ========================================= */}
        {/* Rewarded Ad Video Modal */}
        <RewardedAdModal
          isOpen={isAdOpen}
          onClose={() => setIsAdOpen(false)}
          onRewardComplete={handleAdRewardComplete}
          rewardAmount={500}
        />

        {/* Player Profile & Ledger Modal */}
        <PlayerProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          player={player}
          onUpdatePlayer={setPlayer}
          onLogout={() => {
            localStorage.removeItem('aurum_player_id');
            localStorage.removeItem('aurum_player_name');
            initPlayer();
            setIsProfileOpen(false);
          }}
          onAccountDeleted={() => {
            localStorage.removeItem('aurum_player_id');
            localStorage.removeItem('aurum_player_name');
            setIsProfileOpen(false);
            initPlayer();
            alert('Your account and coin records have been permanently erased.');
          }}
        />

        {/* Admin Dashboard */}
        <LudoAdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />

        {/* Game Over Victory Standings Modal */}
        {game && (
          <GameOverModal
            isOpen={isGameOverOpen}
            game={game}
            myPlayerId={player.id}
            onPlayAgain={() => {
              setIsGameOverOpen(false);
              handleSelectMode(game.mode, game.maxPlayers);
            }}
            onExitLobby={() => {
              setIsGameOverOpen(false);
              setView('LOBBY');
            }}
          />
        )}

      </div>
    </div>
  );
};

export default App;
