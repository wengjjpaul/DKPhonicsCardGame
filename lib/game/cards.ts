// Card definitions for DK Super Phonics Card Game
// 42 phonics cards + 8 action cards = 50 total cards

import { PhonicsCardType, ActionCardType, Card } from '@/types/card';
import { getVowelFromWord } from './suits';

// ============================================
// CVC Words organized by vowel sound (suit)
// Using only decodable CVC words from:
// s, a, t, i, m, n, o, p, b, c, g, h, d, e, f, v, k, l, r, u, j, w, z, x, y, ff, ll, ss, zz
// ============================================

const CVC_WORDS: Record<string, string[]> = {
  // Short A words (8-9 cards)
  a: ['cat', 'map', 'sat', 'hat', 'bat', 'rat', 'can', 'pan', 'van'],
  
  // Short E words (8-9 cards)
  e: ['bed', 'pen', 'red', 'hen', 'jet', 'wet', 'net', 'pet', 'leg'],
  
  // Short I words (8-9 cards)
  i: ['sit', 'pig', 'win', 'big', 'hit', 'bit', 'pin', 'fin', 'tin'],
  
  // Short O words (8-9 cards)
  o: ['hot', 'top', 'dog', 'log', 'pot', 'cot', 'fox', 'box', 'mop'],
  
  // Short U words (8-9 cards)
  u: ['cup', 'bus', 'run', 'sun', 'bun', 'hut', 'cut', 'nut', 'mud'],
};

// Split word into graphemes (for teaching mode)
function splitIntoGraphemes(word: string): string[] {
  const graphemes: string[] = [];
  let i = 0;
  
  while (i < word.length) {
    // Check for double consonants (ff, ll, ss, zz)
    if (i < word.length - 1) {
      const pair = word.slice(i, i + 2);
      if (['ff', 'll', 'ss', 'zz'].includes(pair)) {
        graphemes.push(pair);
        i += 2;
        continue;
      }
    }
    graphemes.push(word[i]);
    i++;
  }
  
  return graphemes;
}

// Generate phonics cards from word lists
function generatePhonicsCards(): PhonicsCardType[] {
  const cards: PhonicsCardType[] = [];
  let idCounter = 1;

  // Take approximately equal cards from each vowel group
  // 42 phonics cards / 5 vowels ≈ 8-9 cards each
  const cardsPerVowel = {
    a: 9,
    e: 8,
    i: 9,
    o: 8,
    u: 8,
  };

  for (const [vowel, words] of Object.entries(CVC_WORDS)) {
    const count = cardsPerVowel[vowel as keyof typeof cardsPerVowel] || 8;
    const selectedWords = words.slice(0, count);
    
    for (const word of selectedWords) {
      cards.push({
        id: `phonics-${idCounter++}`,
        type: 'phonics',
        word: word,
        suit: getVowelFromWord(word), // Suit based on vowel sound
        graphemes: splitIntoGraphemes(word),
      });
    }
  }

  return cards;
}

// Generate action cards
function generateActionCards(): ActionCardType[] {
  const cards: ActionCardType[] = [];
  
  // 3 Change cards
  for (let i = 1; i <= 3; i++) {
    cards.push({
      id: `action-change-${i}`,
      type: 'action',
      action: 'change',
    });
  }
  
  // 3 Miss-a-turn cards
  for (let i = 1; i <= 3; i++) {
    cards.push({
      id: `action-miss-${i}`,
      type: 'action',
      action: 'miss-a-turn',
    });
  }
  
  // 2 Reverse cards
  for (let i = 1; i <= 2; i++) {
    cards.push({
      id: `action-reverse-${i}`,
      type: 'action',
      action: 'reverse',
    });
  }
  
  return cards;
}

// All phonics cards (42)
export const PHONICS_CARDS: PhonicsCardType[] = generatePhonicsCards();

// All action cards (8)
export const ACTION_CARDS: ActionCardType[] = generateActionCards();

// Complete deck (50 cards)
export const ALL_CARDS: Card[] = [...PHONICS_CARDS, ...ACTION_CARDS];

// Get card by ID
export function getCardById(cardId: string): Card | undefined {
  return ALL_CARDS.find(card => card.id === cardId);
}

// Get all cards for a specific suit
export function getCardsBySuit(suit: string): PhonicsCardType[] {
  return PHONICS_CARDS.filter(card => card.suit === suit);
}

// Get all action cards of a specific type
export function getActionCardsByType(action: ActionCardType['action']): ActionCardType[] {
  return ACTION_CARDS.filter(card => card.action === action);
}

// Card counts for reference
export const CARD_COUNTS = {
  total: ALL_CARDS.length,
  phonics: PHONICS_CARDS.length,
  action: ACTION_CARDS.length,
  change: getActionCardsByType('change').length,
  missATurn: getActionCardsByType('miss-a-turn').length,
  reverse: getActionCardsByType('reverse').length,
  bySuit: {
    a: getCardsBySuit('a').length,
    e: getCardsBySuit('e').length,
    i: getCardsBySuit('i').length,
    o: getCardsBySuit('o').length,
    u: getCardsBySuit('u').length,
  },
};
