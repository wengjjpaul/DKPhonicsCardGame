// Progress tracking utility - saves game stats to localStorage

type ProgressData = {
  gamesPlayed: number;
  gamesWon: number;
  wordsPracticed: string[];
  lastPlayed: string | null;
};

const STORAGE_KEY = 'phonics-progress';

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      wordsPracticed: [],
      lastPlayed: null,
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore parse errors
    }
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    wordsPracticed: [],
    lastPlayed: null,
  };
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordGamePlayed(): void {
  const progress = getProgress();
  progress.gamesPlayed += 1;
  progress.lastPlayed = new Date().toISOString();
  saveProgress(progress);
}

export function recordGameWon(): void {
  const progress = getProgress();
  progress.gamesWon += 1;
  progress.lastPlayed = new Date().toISOString();
  saveProgress(progress);
}

export function recordWordPracticed(word: string): void {
  const progress = getProgress();
  // Only add if not recently added (avoid duplicates in same game)
  if (!progress.wordsPracticed.slice(-50).includes(word)) {
    progress.wordsPracticed.push(word);
    // Keep only last 500 words to prevent localStorage bloat
    if (progress.wordsPracticed.length > 500) {
      progress.wordsPracticed = progress.wordsPracticed.slice(-500);
    }
    saveProgress(progress);
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
