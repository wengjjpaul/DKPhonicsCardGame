// Hook for managing game sounds
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { playSound, playWinCelebration, initializeAudio, SoundEffect } from '@/lib/audio';
import { useSettingsStore } from '@/store/settingsStore';

export function useGameSounds() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const hasInteracted = useRef(false);

  // Initialize audio on first user interaction
  const initAudio = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      initializeAudio();
    }
  }, []);

  // Set up interaction listener
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  // Play sound with settings check
  const play = useCallback((effect: SoundEffect) => {
    if (soundEnabled) {
      playSound(effect);
    }
  }, [soundEnabled]);

  // Win celebration
  const playWin = useCallback(() => {
    if (soundEnabled) {
      playWinCelebration();
    }
  }, [soundEnabled]);

  return {
    play,
    playWin,
    initAudio,
  };
}

export default useGameSounds;
