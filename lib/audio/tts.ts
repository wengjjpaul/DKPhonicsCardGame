// Text-to-Speech utility for reading words aloud

// Check if browser supports speech synthesis
export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Speak a word
export function speakWord(word: string, options?: {
  rate?: number;  // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isTTSSupported()) {
      reject(new Error('TTS not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    
    // Kid-friendly settings - slower and clearer
    utterance.rate = options?.rate ?? 0.8;
    utterance.pitch = options?.pitch ?? 1.1;
    utterance.volume = options?.volume ?? 1;
    
    // Use a clear voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(
      (v) => v.lang.startsWith('en')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

// Speak a phonics word with emphasis
export async function speakPhonicsWord(word: string): Promise<void> {
  if (!isTTSSupported()) return;

  // First, say the word slowly
  await speakWord(word, { rate: 0.6 });
  
  // Small pause
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Then say it again at normal speed
  await speakWord(word, { rate: 0.9 });
}

// Stop any ongoing speech
export function stopSpeaking(): void {
  if (!isTTSSupported()) return;
  window.speechSynthesis.cancel();
}

// Get available voices (for settings)
export function getVoices(): SpeechSynthesisVoice[] {
  if (!isTTSSupported()) return [];
  return window.speechSynthesis.getVoices();
}
