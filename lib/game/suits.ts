// Phonics suits/sounds definitions with visual styling
// These represent the vowel sounds that cards are grouped by

import { PhonicsSuit } from '@/types/card';

export type SuitInfo = {
  id: PhonicsSuit;
  name: string; // Display name
  color: string; // Tailwind color class
  bgColor: string; // Background color class
  borderColor: string; // Border color class
  shape: string; // Shape for color-blind accessibility
  examples: string[]; // Example words with this sound
};

// Main vowel suits (primary card groupings)
export const VOWEL_SUITS: Record<string, SuitInfo> = {
  a: {
    id: 'a',
    name: 'Short A',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    shape: '●', // Circle
    examples: ['cat', 'map', 'sat'],
  },
  e: {
    id: 'e',
    name: 'Short E',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    shape: '■', // Square
    examples: ['bed', 'pen', 'red'],
  },
  i: {
    id: 'i',
    name: 'Short I',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    shape: '▲', // Triangle
    examples: ['sit', 'pig', 'win'],
  },
  o: {
    id: 'o',
    name: 'Short O',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    shape: '◆', // Diamond
    examples: ['hot', 'top', 'dog'],
  },
  u: {
    id: 'u',
    name: 'Short U',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    shape: '★', // Star
    examples: ['cup', 'bus', 'run'],
  },
};

// All suits including consonants (for the Change card selection)
export const ALL_SUITS: SuitInfo[] = [
  VOWEL_SUITS.a,
  VOWEL_SUITS.e,
  VOWEL_SUITS.i,
  VOWEL_SUITS.o,
  VOWEL_SUITS.u,
];

// Get suit info by ID
export function getSuitInfo(suitId: string): SuitInfo | undefined {
  return ALL_SUITS.find(suit => suit.id === suitId);
}

// Get suit display color
export function getSuitColor(suitId: string): string {
  const suit = getSuitInfo(suitId);
  return suit?.color ?? 'text-gray-600';
}

// Get suit background color
export function getSuitBgColor(suitId: string): string {
  const suit = getSuitInfo(suitId);
  return suit?.bgColor ?? 'bg-gray-100';
}

// Get suit border color
export function getSuitBorderColor(suitId: string): string {
  const suit = getSuitInfo(suitId);
  return suit?.borderColor ?? 'border-gray-400';
}

// Get suit shape for accessibility
export function getSuitShape(suitId: string): string {
  const suit = getSuitInfo(suitId);
  return suit?.shape ?? '○';
}

// Get vowel from a CVC word (assumes standard CVC structure)
export function getVowelFromWord(word: string): string {
  // For CVC words, the vowel is typically in the middle
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (const char of word.toLowerCase()) {
    if (vowels.includes(char)) {
      return char;
    }
  }
  return 'a'; // Default fallback
}
