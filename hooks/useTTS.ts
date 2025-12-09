// React hook for Text-to-Speech
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '@/store';
import { isTTSSupported, speakWord, speakPhonicsWord, stopSpeaking } from '@/lib/audio';

export function useTTS() {
  const { ttsEnabled, ttsVolume, ttsSpeed } = useSettingsStore();
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check TTS support on mount
  useEffect(() => {
    setIsSupported(isTTSSupported());
  }, []);

  // Speak a word
  const speak = useCallback(async (word: string) => {
    if (!ttsEnabled || !isSupported) return;
    
    const rate = ttsSpeed === 'slow' ? 0.6 : 0.8;
    
    setIsSpeaking(true);
    try {
      await speakWord(word, { rate, volume: ttsVolume });
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [ttsEnabled, ttsSpeed, ttsVolume, isSupported]);

  // Speak with phonics emphasis (slow then normal)
  const speakPhonics = useCallback(async (word: string) => {
    if (!ttsEnabled || !isSupported) return;
    
    setIsSpeaking(true);
    try {
      await speakPhonicsWord(word);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [ttsEnabled, isSupported]);

  // Stop speaking
  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    isSpeaking,
    speak,
    speakPhonics,
    stop,
  };
}

export default useTTS;
