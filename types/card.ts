// Card type definitions for DK Super Phonics Card Game

export type PhonicsCardType = {
  id: string;
  type: 'phonics';
  word: string; // CVC word (e.g., "cat", "map", "sit")
  suit: string; // Phonics suit/sound (e.g., "a", "i", "ff")
  graphemes: string[]; // Individual sounds (e.g., ["c", "a", "t"])
};

export type ActionCardType = {
  id: string;
  type: 'action';
  action: 'change' | 'miss-a-turn' | 'reverse';
};

export type Card = PhonicsCardType | ActionCardType;

// Type guards
export function isPhonicsCard(card: Card): card is PhonicsCardType {
  return card.type === 'phonics';
}

export function isActionCard(card: Card): card is ActionCardType {
  return card.type === 'action';
}

// All available phonics suits/sounds
export const PHONICS_SUITS = [
  // Single vowels
  'a', 'e', 'i', 'o', 'u',
  // Single consonants
  's', 't', 'm', 'n', 'p', 'b', 'c', 'g', 'h', 'd', 'f', 'v', 'k', 'l', 'r', 'j', 'w', 'z', 'x', 'y',
  // Double consonants
  'ff', 'll', 'ss', 'zz',
] as const;

export type PhonicsSuit = typeof PHONICS_SUITS[number];

// Action card types
export const ACTION_TYPES = ['change', 'miss-a-turn', 'reverse'] as const;
export type ActionType = typeof ACTION_TYPES[number];

// Card counts in the deck
export const DECK_COMPOSITION = {
  phonicsCards: 42,
  changeCards: 3,
  missATurnCards: 3,
  reverseCards: 2,
  totalCards: 50,
} as const;
