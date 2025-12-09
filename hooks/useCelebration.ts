// Celebration hook for confetti and fun animations
'use client';

import { useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { playSound, playWinCelebration } from '@/lib/audio';
import { useSettingsStore } from '@/store/settingsStore';

export type CelebrationType = 'match' | 'win' | 'draw';

const celebrationMessages = {
  match: [
    'Great Job! 🌟',
    'Amazing! ⭐',
    'Yay! 🎉',
    'Awesome! 🌈',
    'Super! 🚀',
    'Wow! 💫',
    'Perfect! 🎯',
    'Fantastic! 🦄',
  ],
  win: [
    'You Won! 🏆',
    'Champion! 👑',
    'Winner! 🎊',
    'Victory! 🥇',
  ],
  draw: [
    'Nice Draw! 🃏',
    'Got One! ✨',
  ],
};

export function useCelebration() {
  const [message, setMessage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  const triggerConfetti = useCallback((type: CelebrationType = 'match') => {
    // Set random message
    const messages = celebrationMessages[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setIsAnimating(true);

    // Play celebration sound
    if (soundEnabled) {
      if (type === 'win') {
        playWinCelebration();
      } else {
        playSound('celebration');
      }
    }

    // Different confetti patterns based on celebration type
    if (type === 'win') {
      // Big celebration for winning
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#ff9a9e'],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#ff9a9e'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (type === 'match') {
      // Fun burst for successful match - kid-friendly shapes
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#ff9a9e', '#a8e6cf'],
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });

      // Second burst with stars effect
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ff69b4', '#00ced1', '#98fb98'],
          shapes: ['circle'],
          scalar: 0.8,
        });
      }, 200);
    }

    // Clear message after animation
    setTimeout(() => {
      setMessage(null);
      setIsAnimating(false);
    }, type === 'win' ? 3000 : 1500);
  }, [soundEnabled]);

  const celebrate = useCallback((type: CelebrationType = 'match') => {
    triggerConfetti(type);
  }, [triggerConfetti]);

  return {
    celebrate,
    message,
    isAnimating,
  };
}

export default useCelebration;
