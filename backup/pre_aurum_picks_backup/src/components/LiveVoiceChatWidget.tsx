import React, { useState, useEffect, useRef } from 'react';
import { socketClient } from '../services/ludoApi';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Wifi,
  Sparkles,
  MessageSquare,
  Smile,
  X,
  AlertCircle,
} from 'lucide-react';

interface LiveVoiceChatWidgetProps {
  roomId: string;
  myPlayerId: string;
  myPlayerName: string;
  onSendChat: (msg: string) => void;
  onSendEmoji: (emoji: string) => void;
  activeEmojiReactions: { id: string; sender: string; emoji: string }[];
}

export const LiveVoiceChatWidget: React.FC<LiveVoiceChatWidgetProps> = ({
  roomId,
  myPlayerId,
  myPlayerName,
  onSendChat,
  onSendEmoji,
  activeEmojiReactions,
}) => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0..100
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pingMs, setPingMs] = useState<number>(34);
  const [showQuickChat, setShowQuickChat] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Ping jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPingMs(Math.floor(28 + Math.random() * 18));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Microphone Audio Stream
  const toggleMicrophone = async () => {
    if (isMicEnabled) {
      stopMicrophone();
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('WebRTC microphone capture is not supported in this browser.');
        setShowPermissionDialog(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicEnabled(true);
      setIsMuted(false);
      setPermissionError(null);

      // Broadcast voice status
      socketClient.send({
        type: 'VOICE_STATE',
        roomId,
        playerId: myPlayerId,
        isMuted: false,
        isSpeaking: false,
      });

      // Volume level detection loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        const speakingNow = normalized > 18;
        setIsSpeaking(speakingNow);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      setShowPermissionDialog(true);
      stopMicrophone();
    }
  };

  const toggleMute = () => {
    if (!mediaStreamRef.current) return;
    const newMuted = !isMuted;
    mediaStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMuted;
    });
    setIsMuted(newMuted);

    socketClient.send({
      type: 'VOICE_STATE',
      roomId,
      playerId: myPlayerId,
      isMuted: newMuted,
      isSpeaking: false,
    });
  };

  const stopMicrophone = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicEnabled(false);
    setIsMuted(false);
    setIsSpeaking(false);
    setAudioLevel(0);

    socketClient.send({
      type: 'VOICE_STATE',
      roomId,
      playerId: myPlayerId,
      isMuted: true,
      isSpeaking: false,
    });
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  const quickChatOptions = [
    '👏 Well played!',
    '🔥 Good luck!',
    '👑 The Crown is mine!',
    '⚡ Hurry up, friend!',
    '😎 Nice tactical move!',
    '🎯 Checkmate!',
  ];

  const quickEmojiList = ['👏', '🔥', '👑', '😎', '😂', '🎯'];

  return (
    <div className="relative select-none">
      {/* Floating Active Emoji Reactions Display */}
      {activeEmojiReactions.length > 0 && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none z-40">
          {activeEmojiReactions.map((r) => (
            <div
              key={r.id}
              className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black font-bold text-xs shadow-lg flex items-center gap-1.5 animate-bounce backdrop-blur-md"
            >
              <span>{r.emoji}</span>
              <span className="text-[10px] font-sans truncate max-w-[80px]">{r.sender}</span>
            </div>
          ))}
        </div>
      )}

      {/* Voice Controls & Emoji Reaction Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-2xl bg-[#0b0d14]/90 border border-slate-800 backdrop-blur-md">
        
        {/* Left: WebRTC Voice Controls */}
        <div className="flex items-center gap-1.5">
          {/* Microphone Toggle Button */}
          <button
            onClick={toggleMicrophone}
            className={`p-2 rounded-xl transition flex items-center justify-center relative ${
              isMicEnabled
                ? isMuted
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 ring-2 ring-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title={isMicEnabled ? (isMuted ? 'Unmute Mic' : 'Mute Mic') : 'Join Live Voice Chat'}
          >
            {isMicEnabled ? (
              isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}

            {/* Speaking Wave Radiator */}
            {isSpeaking && !isMuted && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Mute/Unmute Control (when mic active) */}
          {isMicEnabled && (
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-lg text-xs font-bold border transition ${
                isMuted
                  ? 'bg-rose-900/40 text-rose-300 border-rose-600/40'
                  : 'bg-emerald-900/40 text-emerald-300 border-emerald-600/40'
              }`}
            >
              {isMuted ? 'Muted' : 'Live'}
            </button>
          )}

          {/* Voice Chat Player Indicator (Frequency bar) */}
          {isMicEnabled && !isMuted && (
            <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-black/40">
              <span
                className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(20, audioLevel)}%` }}
              />
              <span
                className="w-1 bg-emerald-300 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(15, audioLevel * 0.8)}%` }}
              />
              <span
                className="w-1 bg-yellow-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(10, audioLevel * 0.6)}%` }}
              />
            </div>
          )}
        </div>

        {/* Center: Emoji Reaction Bar */}
        <div className="flex items-center gap-1">
          {quickEmojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendEmoji(emoji)}
              className="p-1 hover:scale-135 active:scale-95 transition text-base"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {/* Quick Chat Bubble Toggle */}
          <button
            onClick={() => setShowQuickChat(!showQuickChat)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            title="Quick Chat Phrases"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Network Connection Status Indicator */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>{pingMs}ms</span>
        </div>
      </div>

      {/* Quick Chat Phrases Menu */}
      {showQuickChat && (
        <div className="absolute bottom-12 right-2 w-48 rounded-2xl bg-[#11131e] border border-amber-500/40 p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-amber-300 font-bold uppercase">
            <span>Quick Chat</span>
            <button onClick={() => setShowQuickChat(false)} className="text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          {quickChatOptions.map((text) => (
            <button
              key={text}
              onClick={() => {
                onSendChat(text);
                setShowQuickChat(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition truncate"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      {/* Microphone Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in zoom-in-95">
          <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#181b28] to-[#0d0e15] border-2 border-amber-400 p-6 text-center shadow-2xl text-white space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-heading font-black text-sm text-white">
                Microphone Permission
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {permissionError ||
                  'AURUM LUDO requires microphone permission to connect you with fellow players in live voice chat.'}
              </p>
            </div>

            <button
              onClick={() => setShowPermissionDialog(false)}
              className="w-full py-2 rounded-xl bg-amber-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
