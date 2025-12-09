// Sound effects for the game using Web Audio API
'use client';

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

// Sound effect types
export type SoundEffect = 
  | 'cardPlay'      // When a card is played successfully
  | 'cardDraw'      // When drawing a card
  | 'cardPickup'    // When picking up/dragging a card
  | 'cardDrop'      // When dropping a card (invalid)
  | 'turnStart'     // When it's your turn
  | 'celebration'   // Celebration/win sounds
  | 'error'         // Invalid action
  | 'buttonClick'   // Button clicks
  | 'gameStart'     // Game starting
  | 'playerJoin'    // Player joining
  | 'suitChange';   // Suit change action

// Generate a simple tone using oscillator
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  attack: number = 0.01
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // ADSR envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + attack + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Play multiple tones in sequence (for melodies)
function playMelody(
  notes: Array<{ freq: number; duration: number; delay?: number }>,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  let currentDelay = 0;
  
  notes.forEach(({ freq, duration, delay }) => {
    if (delay !== undefined) {
      currentDelay = delay;
    }
    setTimeout(() => {
      playTone(freq, duration, type, volume);
    }, currentDelay * 1000);
    currentDelay += duration;
  });
}

// Sound effect definitions
const soundEffects: Record<SoundEffect, () => void> = {
  cardPlay: () => {
    // Happy ascending "woosh" sound - satisfying card placement
    playMelody([
      { freq: 440, duration: 0.08 },
      { freq: 587, duration: 0.08 },
      { freq: 740, duration: 0.12 },
    ], 'sine', 0.25);
  },

  cardDraw: () => {
    // Quick "flip" sound
    playTone(300, 0.08, 'triangle', 0.2);
    setTimeout(() => playTone(400, 0.1, 'triangle', 0.15), 50);
  },

  cardPickup: () => {
    // Soft "lift" sound
    playTone(350, 0.1, 'sine', 0.15);
  },

  cardDrop: () => {
    // Descending "bonk" - invalid drop
    playMelody([
      { freq: 300, duration: 0.1 },
      { freq: 200, duration: 0.15 },
    ], 'square', 0.15);
  },

  turnStart: () => {
    // Cheerful "ding ding" - attention grabber for kids
    playMelody([
      { freq: 659, duration: 0.15 },  // E5
      { freq: 784, duration: 0.2 },   // G5
    ], 'sine', 0.3);
  },

  celebration: () => {
    // Triumphant fanfare melody
    const notes = [
      { freq: 523, duration: 0.1 },   // C5
      { freq: 659, duration: 0.1 },   // E5
      { freq: 784, duration: 0.1 },   // G5
      { freq: 1047, duration: 0.3 },  // C6
    ];
    playMelody(notes, 'sine', 0.3);
    
    // Add sparkle
    setTimeout(() => {
      playTone(1318, 0.15, 'sine', 0.2);  // E6
    }, 400);
  },

  error: () => {
    // Gentle "nope" sound - not scary for kids
    playMelody([
      { freq: 300, duration: 0.15 },
      { freq: 250, duration: 0.2 },
    ], 'triangle', 0.2);
  },

  buttonClick: () => {
    // Soft click
    playTone(600, 0.05, 'sine', 0.15);
  },

  gameStart: () => {
    // Exciting ascending melody
    const notes = [
      { freq: 392, duration: 0.12 },  // G4
      { freq: 440, duration: 0.12 },  // A4
      { freq: 494, duration: 0.12 },  // B4
      { freq: 523, duration: 0.12 },  // C5
      { freq: 659, duration: 0.2 },   // E5
      { freq: 784, duration: 0.3 },   // G5
    ];
    playMelody(notes, 'sine', 0.3);
  },

  playerJoin: () => {
    // Welcoming "pop" sound
    playMelody([
      { freq: 440, duration: 0.08 },
      { freq: 554, duration: 0.12 },
    ], 'sine', 0.25);
  },

  suitChange: () => {
    // Magical swirl sound
    const notes = [
      { freq: 523, duration: 0.08 },
      { freq: 659, duration: 0.08 },
      { freq: 784, duration: 0.08 },
      { freq: 880, duration: 0.15 },
    ];
    playMelody(notes, 'triangle', 0.25);
  },
};

// Main function to play sound effects
export function playSound(effect: SoundEffect): void {
  try {
    soundEffects[effect]?.();
  } catch (err) {
    // Silently fail if audio isn't available
    console.debug('Sound effect failed:', err);
  }
}

// Check if sound is supported
export function isSoundSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'AudioContext' in window || 'webkitAudioContext' in window;
}

// Initialize audio context (call on first user interaction)
export function initializeAudio(): void {
  getAudioContext();
}

// Win celebration with extended fanfare
export function playWinCelebration(): void {
  // Play main celebration
  playSound('celebration');
  
  // Additional celebratory notes
  setTimeout(() => {
    playMelody([
      { freq: 784, duration: 0.15 },   // G5
      { freq: 880, duration: 0.15 },   // A5  
      { freq: 1047, duration: 0.4 },   // C6
    ], 'sine', 0.3);
  }, 500);
  
  // Final triumphant chord
  setTimeout(() => {
    playTone(523, 0.5, 'sine', 0.2);   // C5
    playTone(659, 0.5, 'sine', 0.2);   // E5
    playTone(784, 0.5, 'sine', 0.2);   // G5
    playTone(1047, 0.5, 'sine', 0.25); // C6
  }, 900);
}
