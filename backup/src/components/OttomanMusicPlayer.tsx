import React, { useState, useEffect } from 'react';
import {
  turkishMusic,
  TURKISH_TRACKS,
  TrackInfo,
} from '../utils/turkishMusicEngine';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface OttomanMusicPlayerProps {
  compact?: boolean;
}

export const OttomanMusicPlayer: React.FC<OttomanMusicPlayerProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(TURKISH_TRACKS[0]);
  const [volume, setVolume] = useState(0.55);
  const [isMuted, setIsMuted] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const unsubscribe = turkishMusic.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.currentTrack);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    turkishMusic.togglePlay();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    turkishMusic.nextTrack();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    turkishMusic.prevTrack();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    turkishMusic.toggleMute();
  };

  return (
    <>
      {/* ========================================================
          COMPACT PILL (Visible in Header / Arena)
      ======================================================== */}
      <div className="relative inline-flex items-center">
        <div
          onClick={() => setShowDrawer(true)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 via-[#181112] to-amber-950/80 border border-amber-500/40 shadow-lg shadow-red-950/20 backdrop-blur-md cursor-pointer hover:border-amber-400 transition-all select-none group ${
            isPlaying ? 'ring-1 ring-amber-500/50' : ''
          }`}
          title="Ottoman Sultan Abdul Hamid Music Player"
        >
          {/* Turkish Crescent / Ottoman Emblem */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0">
            🇹🇷
          </div>

          {/* Playing Animation or Ottoman Icon */}
          <div className="flex flex-col text-left max-w-[110px] sm:max-w-[140px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 truncate">
                {currentTrack.title.replace(' Theme', '')}
              </span>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 bg-amber-400 animate-[bounce_0.6s_ease-in-out_infinite] h-full" />
                  <span className="w-0.5 bg-amber-300 animate-[bounce_0.8s_ease-in-out_infinite_0.15s] h-2/3" />
                  <span className="w-0.5 bg-yellow-400 animate-[bounce_0.5s_ease-in-out_infinite_0.3s] h-5/6" />
                </div>
              )}
            </div>
            <span className="text-[8px] text-slate-400 truncate">
              {isPlaying ? 'Payitaht Mehter' : 'Tap to Play'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleTogglePlay}
              className="p-1 rounded-full bg-amber-400 text-black hover:bg-amber-300 transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title={isPlaying ? 'Pause Music' : 'Play Payitaht Music'}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black ml-0.5" />}
            </button>
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="p-1 text-slate-400 hover:text-amber-300 transition"
              title="Track details & volume"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          FULL OTTOMAN MUSIC MODAL / DRAWER
      ======================================================== */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#181315] via-[#121013] to-[#0a0809] border border-amber-500/50 shadow-2xl p-5 text-white relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background subtle Ottoman star pattern */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-red-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-600 to-yellow-500 flex items-center justify-center text-lg shadow-md border border-amber-400/40">
                  🇹🇷
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                    SULTAN ABDÜLHAMID HAN
                  </h3>
                  <p className="text-[10px] text-amber-300/80 uppercase tracking-widest font-mono">
                    Imperial Ottoman Royal Sound
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Playing Card */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-b from-[#24181b]/70 to-[#140e10]/90 border border-amber-500/30 text-center relative z-10 shadow-inner">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-[9px] font-bold text-red-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Payitaht Ottoman Soundtrack
              </div>

              <h4 className="text-base font-black text-amber-200 tracking-tight">
                {currentTrack.turkishTitle}
              </h4>
              <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                {currentTrack.subtitle}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed px-1">
                {currentTrack.description}
              </p>

              {/* Visualizer bars */}
              <div className="flex items-center justify-center gap-1 h-6 my-3">
                {[40, 75, 55, 90, 65, 80, 50, 95, 70, 45, 85, 60].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: isPlaying ? `${h}%` : '20%',
                      animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                    }}
                    className={`w-1 rounded-full bg-gradient-to-t from-red-500 to-amber-400 transition-all ${
                      isPlaying ? 'animate-pulse' : 'opacity-40'
                    }`}
                  />
                ))}
              </div>

              {/* Main Player Controls */}
              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition active:scale-95"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition active:scale-95"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 mt-4 px-3 pt-3 border-t border-slate-800/80">
                <button
                  onClick={handleToggleMute}
                  className="text-slate-400 hover:text-amber-300 transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isMuted && val > 0) turkishMusic.toggleMute();
                    turkishMusic.setVolume(val);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>

            {/* Track Selector List */}
            <div className="space-y-1.5 relative z-10 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Imperial Tracklist:
              </span>
              {TURKISH_TRACKS.map((t) => {
                const isSelected = t.id === currentTrack.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      turkishMusic.selectTrack(t.id);
                      if (!isPlaying) turkishMusic.play();
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 border border-amber-500/60 shadow-sm'
                        : 'bg-[#141216] border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                          isSelected
                            ? 'bg-amber-400 text-black font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isSelected && isPlaying ? '▶' : '♫'}
                      </div>
                      <div className="truncate">
                        <span
                          className={`block text-xs font-bold truncate ${
                            isSelected ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="block text-[9px] text-slate-400 truncate">
                          {t.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-2">
                      {t.bpm} BPM
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ottoman Quote / Historical Tribute */}
            <div className="mt-4 p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 flex items-start gap-2 text-left relative z-10">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-400 leading-tight">
                <span className="text-amber-300 font-bold">Payitaht Abdülhamid:</span> Dedicated
                to the historical legacy of Sultan Abdul Hamid II. Plays authentic Turkish Hicaz
                harmonies, Ney melodies, and Ottoman Mehter marches in real-time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
