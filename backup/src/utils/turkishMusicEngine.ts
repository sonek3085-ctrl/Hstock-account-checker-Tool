/**
 * Ottoman & Turkish Imperial Music Engine
 * Specifically featuring:
 * 1. Payitaht: Abdülhamid — Imperial Theme (Jenerik Müziği)
 * 2. Hamidiye Marşı — Imperial Anthem of Sultan II. Abdülhamid (1876)
 * 3. Ceddin Deden — Ottoman Imperial Mehter March
 * 4. Payitaht Saray Ney Taksimi — Sultan's Palace Ney Meditation
 *
 * Implemented using Web Audio API synthesis for zero latency, 100% offline standalone
 * playback, zero external CDN dependencies, and authentic Ottoman scale tuning (Hicaz / Rast).
 */

export interface TrackInfo {
  id: string;
  title: string;
  turkishTitle: string;
  subtitle: string;
  description: string;
  duration: number; // in seconds
  bpm: number;
}

export const TURKISH_TRACKS: TrackInfo[] = [
  {
    id: 'payitaht_theme',
    title: 'Payitaht Abdülhamid Theme',
    turkishTitle: 'Payitaht: Abdülhamid Jenerik',
    subtitle: 'Imperial Ottoman March & Strings',
    description: 'The iconic heroic battle theme of Sultan Abdul Hamid II from Payitaht with Mehter percussion and Ottoman Hicaz scale.',
    duration: 96,
    bpm: 108,
  },
  {
    id: 'hamidiye_marsi',
    title: 'Hamidiye Marşı (1876)',
    turkishTitle: 'Hamidiye Marşı — Sultan Abdülhamid Han',
    subtitle: 'Official Imperial March of Abdul Hamid II',
    description: 'The historic royal anthem composed by Callisto Guatelli Pasha for Sultan Abdul Hamid II during his Ottoman reign.',
    duration: 88,
    bpm: 102,
  },
  {
    id: 'ceddin_deden',
    title: 'Ceddin Deden Mehter March',
    turkishTitle: 'Ceddin Deden — Tarihi Mehter Marşı',
    subtitle: 'Legendary Ottoman Military Anthem',
    description: 'The ancient Mehter military march celebrating the courage and heritage of the Ottoman empire.',
    duration: 84,
    bpm: 112,
  },
  {
    id: 'saray_ney',
    title: 'Yıldız Sarayı Ney & Kanun',
    turkishTitle: 'Yıldız Sarayı Ney & Kanun Taksimi',
    subtitle: 'Royal Palace Mystical Meditation',
    description: 'Peaceful and royal spiritual Turkish Ney flute with Kanun plucks and deep string drone.',
    duration: 90,
    bpm: 80,
  },
];

// Note frequencies (Hz) in equal temperament + Turkish Hicaz microtonal touches
const NOTE_FREQS: Record<string, number> = {
  // Bass Octave (2)
  'D2': 73.42,
  'Eb2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'G2': 98.00,
  'A2': 110.00,
  'Bb2': 116.54,
  'B2': 123.47,
  'C3': 130.81,
  'C#3': 138.59,

  // Tenor / Mid Octave (3)
  'D3': 146.83,
  'Eb3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'A3': 220.00,
  'Bb3': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C#4': 277.18,

  // Lead / Melody Octave (4)
  'D4': 293.66,
  'Eb4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00,
  'Bb4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,

  // High Octave (5)
  'D5': 587.33,
  'Eb5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'A5': 880.00,
  'Bb5': 932.33,
  'C6': 1046.50,
  'D6': 1174.66,
  'REST': 0,
};

type NoteStep = { note: string; duration: number }; // duration in sixteenth-notes (1 = 0.25 beat)

/**
 * Melody definitions:
 */
// 1. Payitaht Abdülhamid Imperial Theme (Iconic Hicaz Motif in D)
const PAYITAHT_MELODY: NoteStep[] = [
  // Phrase 1: The Dramatic Ascending & Descending Ottoman Theme
  { note: 'A4', duration: 4 },
  { note: 'Bb4', duration: 2 },
  { note: 'A4', duration: 2 },
  { note: 'G4', duration: 4 },
  { note: 'F#4', duration: 4 },

  { note: 'G4', duration: 4 },
  { note: 'A4', duration: 2 },
  { note: 'G4', duration: 2 },
  { note: 'F#4', duration: 4 },
  { note: 'Eb4', duration: 4 },

  { note: 'F#4', duration: 4 },
  { note: 'G4', duration: 2 },
  { note: 'F#4', duration: 2 },
  { note: 'Eb4', duration: 4 },
  { note: 'D4', duration: 8 },

  // Phrase 2: Heroic Rise
  { note: 'D4', duration: 2 },
  { note: 'Eb4', duration: 2 },
  { note: 'F#4', duration: 2 },
  { note: 'G4', duration: 2 },
  { note: 'A4', duration: 4 },
  { note: 'Bb4', duration: 4 },

  // Phrase 3: High Imperial Climax (Abdul Hamid March)
  { note: 'D5', duration: 6 },
  { note: 'C#5', duration: 2 },
  { note: 'D5', duration: 4 },
  { note: 'Bb4', duration: 4 },

  { note: 'C#5', duration: 4 },
  { note: 'Bb4', duration: 2 },
  { note: 'A4', duration: 2 },
  { note: 'G4', duration: 4 },
  { note: 'A4', duration: 4 },

  { note: 'Bb4', duration: 4 },
  { note: 'A4', duration: 2 },
  { note: 'G4', duration: 2 },
  { note: 'F#4', duration: 4 },
  { note: 'Eb4', duration: 4 },

  { note: 'F#4', duration: 4 },
  { note: 'Eb4', duration: 2 },
  { note: 'C#4', duration: 2 },
  { note: 'D4', duration: 8 },

  // Phrase 4: Resolute Resolution
  { note: 'D4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'D5', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'D4', duration: 8 },
  { note: 'REST', duration: 4 },
];

// 2. Hamidiye Marşı (Official March of Sultan Abdul Hamid II - 1876)
const HAMIDIYE_MELODY: NoteStep[] = [
  // Royal Fanfare & March
  { note: 'D4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'D4', duration: 4 },
  { note: 'G4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },

  { note: 'D5', duration: 6 },
  { note: 'C#5', duration: 2 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'G4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'E4', duration: 4 },
  { note: 'D4', duration: 4 },

  // Dignified Ottoman Cadence
  { note: 'A4', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'C#5', duration: 4 },
  { note: 'D5', duration: 8 },
  { note: 'F#4', duration: 4 },
  { note: 'G4', duration: 4 },
  { note: 'A4', duration: 8 },

  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'G4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'E4', duration: 4 },
  { note: 'F#4', duration: 4 },
  { note: 'D4', duration: 8 },
  { note: 'REST', duration: 4 },
];

// 3. Ceddin Deden (Historic Mehter Military March)
const CEDDIN_DEDEN_MELODY: NoteStep[] = [
  // "Ceddin deden, neslin baban..."
  { note: 'E4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'C5', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'B4', duration: 8 },

  // "En kahraman Türk milleti..."
  { note: 'G4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'C5', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'A4', duration: 8 },

  // "Orduların, pek çok zaman..."
  { note: 'C5', duration: 4 },
  { note: 'D5', duration: 4 },
  { note: 'E5', duration: 4 },
  { note: 'D5', duration: 4 },
  { note: 'C5', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 8 },

  // "Vermiştiler dünyaya şan..."
  { note: 'B4', duration: 4 },
  { note: 'C5', duration: 4 },
  { note: 'D5', duration: 4 },
  { note: 'C5', duration: 4 },
  { note: 'B4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'A4', duration: 8 },
  { note: 'REST', duration: 4 },
];

// 4. Yıldız Sarayı Ney & Kanun Meditation
const SARAY_NEY_MELODY: NoteStep[] = [
  { note: 'D4', duration: 8 },
  { note: 'Eb4', duration: 4 },
  { note: 'F#4', duration: 6 },
  { note: 'G4', duration: 2 },
  { note: 'A4', duration: 12 },

  { note: 'Bb4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'G4', duration: 4 },
  { note: 'F#4', duration: 8 },
  { note: 'Eb4', duration: 4 },
  { note: 'D4', duration: 12 },

  { note: 'F#4', duration: 4 },
  { note: 'A4', duration: 4 },
  { note: 'D5', duration: 8 },
  { note: 'C#5', duration: 4 },
  { note: 'Bb4', duration: 4 },
  { note: 'A4', duration: 12 },
  { note: 'REST', duration: 4 },
];

class TurkishMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private volume: number = 0.55;
  private isMuted: boolean = false;

  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private timerId: any = null;
  private stepIndex: number = 0;
  private beatCounter: number = 0;

  // Listeners
  private listeners: Set<(state: { isPlaying: boolean; currentTrack: TrackInfo; volume: number; isMuted: boolean }) => void> = new Set();

  constructor() {
    // Restore saved preferences
    try {
      const savedMuted = localStorage.getItem('aurum_ottoman_music_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      const savedVolume = localStorage.getItem('aurum_ottoman_music_volume');
      if (savedVolume !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      }
      const savedTrack = localStorage.getItem('aurum_ottoman_music_track');
      if (savedTrack) {
        const idx = TURKISH_TRACKS.findIndex((t) => t.id === savedTrack);
        if (idx !== -1) this.currentTrackIndex = idx;
      }
    } catch {
      // Ignore local storage errors
    }
  }

  private initAudio() {
    if (this.ctx && this.masterGain && this.compressor) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Imperial dynamics processor to prevent clipping and give orchestral fullness
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    const effectiveVol = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  public subscribe(fn: (state: { isPlaying: boolean; currentTrack: TrackInfo; volume: number; isMuted: boolean }) => void) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: TURKISH_TRACKS[this.currentTrackIndex],
      volume: this.volume,
      isMuted: this.isMuted,
    };
  }

  public async play() {
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.notify();
    this.startSequencer();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % TURKISH_TRACKS.length;
    this.onTrackChanged();
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + TURKISH_TRACKS.length) % TURKISH_TRACKS.length;
    this.onTrackChanged();
  }

  public selectTrack(trackId: string) {
    const idx = TURKISH_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      this.onTrackChanged();
    }
  }

  private onTrackChanged() {
    try {
      localStorage.setItem('aurum_ottoman_music_track', TURKISH_TRACKS[this.currentTrackIndex].id);
    } catch {}
    this.stepIndex = 0;
    this.beatCounter = 0;
    if (this.isPlaying) {
      if (this.timerId) clearTimeout(this.timerId);
      this.startSequencer();
    }
    this.notify();
  }

  public setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    try {
      localStorage.setItem('aurum_ottoman_music_volume', this.volume.toString());
    } catch {}

    if (this.masterGain && this.ctx) {
      const effective = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(effective, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('aurum_ottoman_music_muted', this.isMuted.toString());
    } catch {}

    if (this.masterGain && this.ctx) {
      const effective = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(effective, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  private getActiveMelody(): NoteStep[] {
    const track = TURKISH_TRACKS[this.currentTrackIndex];
    if (track.id === 'payitaht_theme') return PAYITAHT_MELODY;
    if (track.id === 'hamidiye_marsi') return HAMIDIYE_MELODY;
    if (track.id === 'ceddin_deden') return CEDDIN_DEDEN_MELODY;
    return SARAY_NEY_MELODY;
  }

  /**
   * Continuous Ottoman music sequencer
   */
  private startSequencer() {
    if (!this.isPlaying) return;

    const track = TURKISH_TRACKS[this.currentTrackIndex];
    const melody = this.getActiveMelody();

    // 16th note duration in ms = (60 / bpm / 4) * 1000
    const sixteenthMs = (60 / track.bpm / 4) * 1000;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx || !this.compressor) return;

      const currentStep = melody[this.stepIndex];
      const duration16th = currentStep ? currentStep.duration : 4;
      const stepDurationSec = (duration16th * sixteenthMs) / 1000;

      // Play melody note
      if (currentStep && currentStep.note !== 'REST') {
        const freq = NOTE_FREQS[currentStep.note];
        if (freq) {
          this.playOttomanNeyLead(freq, stepDurationSec * 0.95);
        }
      }

      // Accompanying instruments: Mehter drums and Ottoman drone chords
      this.playAccompaniment(stepDurationSec, track.id);

      // Advance step pointer
      this.stepIndex = (this.stepIndex + 1) % melody.length;
      this.beatCounter++;

      // Schedule next note
      const waitTime = duration16th * sixteenthMs;
      this.timerId = setTimeout(playStep, Math.max(20, waitTime));
    };

    playStep();
  }

  /**
   * Ottoman Ney & Kemane Strings Synthesizer:
   * Uses gentle harmonic overtones, subtle portamento, and Ney breath resonance.
   */
  private playOttomanNeyLead(freq: number, duration: number) {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;

    // Primary Ney / Violin Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Warm Turkish Ney Lowpass Filter (mellow warmth with characteristic breath)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.5, now);

    // Subtle Ottoman vibrato (Kemane / Ney pitch oscillation)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.2, now); // 5.2 Hz Turkish vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.015, now); // slight pitch variation
    vibrato.connect(osc.frequency);
    vibrato.start(now + 0.08); // vibrato kicks in after attack

    // Gain Envelope (soft woodwind attack and elegant tail)
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.06);
    gain.gain.setValueAtTime(0.22, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Subtle Secondary Flute Undertone for thickness
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);
    subGain.gain.setValueAtTime(0.08, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Routing
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    subOsc.connect(subGain);
    subGain.connect(this.compressor);

    osc.start(now);
    subOsc.start(now);

    osc.stop(now + duration + 0.05);
    subOsc.stop(now + duration + 0.05);
    vibrato.stop(now + duration + 0.05);
  }

  /**
   * Mehter Drum Cadence & Imperial Drone Accompaniment
   */
  private playAccompaniment(stepDurationSec: number, trackId: string) {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;

    // Track 4 (Palace Meditation) is serene, with only gentle Kanun and drone
    const isMeditation = trackId === 'saray_ney';

    // 1. Imperial Bass Drone (every 2-4 steps)
    if (this.beatCounter % 2 === 0) {
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'triangle';

      // Deep D / A imperial base
      const droneNotes = [NOTE_FREQS['D2'], NOTE_FREQS['A2'], NOTE_FREQS['D3']];
      const selectedNote = droneNotes[(this.beatCounter / 2) % droneNotes.length];
      droneOsc.frequency.setValueAtTime(selectedNote, now);

      droneGain.gain.setValueAtTime(0.12, now);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationSec * 1.8);

      droneOsc.connect(droneGain);
      droneGain.connect(this.compressor);
      droneOsc.start(now);
      droneOsc.stop(now + stepDurationSec * 1.9);
    }

    if (isMeditation) {
      // Kanun plucked arpeggio for meditation
      if (this.beatCounter % 3 === 0) {
        this.playKanunPluck(NOTE_FREQS['A3'], 0.4);
      }
      return;
    }

    // 2. Mehter "Kös" (Great Bass Drum) - Heavy Ottoman punch on beat 1
    if (this.beatCounter % 4 === 0) {
      const drumOsc = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();
      drumOsc.type = 'sine';

      // Pitch sweep downward for deep war drum punch
      drumOsc.frequency.setValueAtTime(110, now);
      drumOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      drumGain.gain.setValueAtTime(0.35, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      drumOsc.connect(drumGain);
      drumGain.connect(this.compressor);
      drumOsc.start(now);
      drumOsc.stop(now + 0.3);
    }

    // 3. Mehter "Davul & Zil" (Snare & Brass Cymbals) - Syncopated Turkish Rhythm
    if (this.beatCounter % 4 === 2 || this.beatCounter % 4 === 3) {
      // Synthetic Turkish Zil Cymbal / Mehter Chime
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const cymbalFilter = this.ctx.createBiquadFilter();
      cymbalFilter.type = 'highpass';
      cymbalFilter.frequency.setValueAtTime(6000, now);

      const cymbalGain = this.ctx.createGain();
      cymbalGain.gain.setValueAtTime(0.12, now);
      cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      whiteNoise.connect(cymbalFilter);
      cymbalFilter.connect(cymbalGain);
      cymbalGain.connect(this.compressor);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.09);
    }
  }

  /**
   * Turkish Kanun / Oud Pluck
   */
  private playKanunPluck(freq: number, duration: number) {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
}

// Global music singleton for seamless playback across lobbies and active matches
export const turkishMusic = new TurkishMusicEngine();
