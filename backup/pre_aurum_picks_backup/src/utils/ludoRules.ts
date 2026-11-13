import { LudoColor, Token, TokenStepInfo } from '../types/ludo';

export const SAFE_SQUARES = [1, 9, 14, 22, 27, 35, 40, 48];

export const START_CELLS: Record<LudoColor, number> = {
  RED: 1,
  GREEN: 14,
  YELLOW: 27,
  BLUE: 40,
};

export const COLOR_ORDER: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const TWO_PLAYER_COLORS: LudoColor[] = ['RED', 'YELLOW'];

export function createInitialTokens(color: LudoColor): Token[] {
  return [0, 1, 2, 3].map((id) => ({
    id,
    color,
    state: 'YARD',
    trackPos: -1,
    stepCount: 0,
  }));
}

export function isSafeSquare(cellIndex: number): boolean {
  return SAFE_SQUARES.includes(cellIndex);
}

export function getMovableTokenIds(tokens: Token[], diceValue: number): number[] {
  if (diceValue < 1 || diceValue > 6) return [];
  const movable: number[] = [];

  tokens.forEach((token) => {
    if (token.state === 'HOME') return;

    if (token.state === 'YARD') {
      if (diceValue === 6) movable.push(token.id);
    } else {
      // Must not overshoot Home (total 57 steps)
      if (token.stepCount + diceValue <= 57) {
        movable.push(token.id);
      }
    }
  });

  return movable;
}

export function calculateNewTokenPosition(
  token: Token,
  diceValue: number
): { token: Token; isHome: boolean } {
  const result = calculateTokenStepPath(token, diceValue);
  return { token: result.finalToken, isHome: result.isHome };
}

/**
 * Calculates the exact step-by-step path coordinates for smooth frame animation.
 * Prevents teleportation, sudden jumps, or fast-forwarding errors.
 */
export function calculateTokenStepPath(
  token: Token,
  diceValue: number
): { path: TokenStepInfo[]; finalToken: Token; isHome: boolean } {
  const startTrack = START_CELLS[token.color];
  const path: TokenStepInfo[] = [];

  // Yard to start square (requires a 6)
  if (token.state === 'YARD') {
    if (diceValue !== 6) return { path: [], finalToken: token, isHome: false };
    const step: TokenStepInfo = {
      state: 'TRACK',
      stepCount: 1,
      trackPos: startTrack,
    };
    path.push(step);
    return {
      path,
      finalToken: { ...token, ...step },
      isHome: false,
    };
  }

  // Step-by-step traversal
  for (let s = 1; s <= diceValue; s++) {
    const nextStep = token.stepCount + s;

    if (nextStep <= 51) {
      // Global track ring
      const newPos = (startTrack + nextStep - 1) % 52;
      path.push({
        state: 'TRACK',
        stepCount: nextStep,
        trackPos: newPos,
      });
    } else if (nextStep < 57) {
      // Safe colored homerun path (steps 52..56 -> trackPos 1..5)
      path.push({
        state: 'HOMERUN',
        stepCount: nextStep,
        trackPos: nextStep - 51,
      });
    } else if (nextStep === 57) {
      // Reached Home center
      path.push({
        state: 'HOME',
        stepCount: 57,
        trackPos: 6,
      });
    }
  }

  const finalStep = path[path.length - 1];
  const isHome = finalStep ? finalStep.state === 'HOME' : false;

  return {
    path,
    finalToken: finalStep ? { ...token, ...finalStep } : token,
    isHome,
  };
}

// -------------------------------------------------------------
// Audio Feedback (Synthesized via Web Audio API - zero external assets)
// -------------------------------------------------------------
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playLudoSound = (
  type: 'ROLL' | 'MOVE' | 'CAPTURE' | 'SAFE' | 'VICTORY' | 'TIMEOUT'
) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ROLL') {
      // Dice rumble sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'MOVE') {
      // Crisp token step pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'CAPTURE') {
      // Striking metallic bump
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'SAFE') {
      // Pleasant star chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'VICTORY') {
      // Royal Fanfare chords
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.12);
        g.gain.setValueAtTime(0.25, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.4);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 0.45);
      });
    } else if (type === 'TIMEOUT') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Audio context fallback
  }
};
