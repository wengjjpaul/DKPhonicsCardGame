// Zustand store for user settings/preferences
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '@/types/game';

export type SettingsState = {
  // TTS settings
  ttsEnabled: boolean;
  ttsSpeed: 'normal' | 'slow';
  ttsVolume: number; // 0-1

  // Accessibility
  largeFont: boolean;
  highContrast: boolean;
  reduceMotion: boolean;

  // Default game settings
  defaultGameSettings: GameSettings;

  // Actions
  setTTSEnabled: (enabled: boolean) => void;
  setTTSSpeed: (speed: 'normal' | 'slow') => void;
  setTTSVolume: (volume: number) => void;
  setLargeFont: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setDefaultGameSettings: (settings: Partial<GameSettings>) => void;
  resetSettings: () => void;
};

const initialState = {
  ttsEnabled: true,
  ttsSpeed: 'normal' as const,
  ttsVolume: 0.8,
  largeFont: false,
  highContrast: false,
  reduceMotion: false,
  defaultGameSettings: DEFAULT_GAME_SETTINGS,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setTTSEnabled: (enabled) => set({ ttsEnabled: enabled }),

      setTTSSpeed: (speed) => set({ ttsSpeed: speed }),

      setTTSVolume: (volume) => set({ ttsVolume: Math.max(0, Math.min(1, volume)) }),

      setLargeFont: (enabled) => set({ largeFont: enabled }),

      setHighContrast: (enabled) => set({ highContrast: enabled }),

      setReduceMotion: (enabled) => set({ reduceMotion: enabled }),

      setDefaultGameSettings: (settings) =>
        set((state) => ({
          defaultGameSettings: { ...state.defaultGameSettings, ...settings },
        })),

      resetSettings: () => set(initialState),
    }),
    {
      name: 'super-phonics-settings',
    }
  )
);

export default useSettingsStore;
