// Game rules - card matching and validation logic

import { Card, isPhonicsCard, isActionCard } from '@/types/card';
import { GameSettings } from '@/types/game';

/**
 * Check if a card can be played on top of the current card
 * Rules:
 * 1. Phonics cards must match the current suit (vowel sound)
 * 2. Action cards can always be played
 */
export function canPlayCard(
  cardToPlay: Card,
  currentSuit: string | null,
  topCard: Card | null // Unused but kept for potential future rules
): boolean {
  void topCard; // Kept for potential future rules
  // If no current suit (start of game), any card can be played
  if (!currentSuit) {
    return true;
  }

  // Action cards can always be played
  if (isActionCard(cardToPlay)) {
    return true;
  }

  // Phonics cards must match the current suit
  if (isPhonicsCard(cardToPlay)) {
    return cardToPlay.suit === currentSuit;
  }

  return false;
}

/**
 * Get all playable cards from a hand
 */
export function getPlayableCards(
  hand: Card[],
  currentSuit: string | null,
  topCard: Card | null
): Card[] {
  return hand.filter(card => canPlayCard(card, currentSuit, topCard));
}

/**
 * Check if player must draw (has no playable cards)
 */
export function mustDraw(
  hand: Card[],
  currentSuit: string | null,
  topCard: Card | null
): boolean {
  return getPlayableCards(hand, currentSuit, topCard).length === 0;
}

/**
 * Get the new suit after playing a card
 */
export function getNewSuit(playedCard: Card, declaredSuit?: string): string | null {
  // Change card: use the declared suit
  if (isActionCard(playedCard) && playedCard.action === 'change') {
    return declaredSuit ?? null;
  }

  // Phonics card: use the card's suit
  if (isPhonicsCard(playedCard)) {
    return playedCard.suit;
  }

  // Other action cards don't change the suit
  return null;
}

/**
 * Determine the next player index
 */
export function getNextPlayerIndex(
  currentIndex: number,
  totalPlayers: number,
  direction: 1 | -1,
  skip: number = 0 // Number of players to skip (for miss-a-turn)
): number {
  const steps = 1 + skip;
  let nextIndex = currentIndex + direction * steps;

  // Wrap around
  while (nextIndex < 0) {
    nextIndex += totalPlayers;
  }
  return nextIndex % totalPlayers;
}

/**
 * Get the next connected player index, skipping disconnected players
 * Returns -1 if no connected players found (shouldn't happen in a valid game)
 */
export function getNextConnectedPlayerIndex(
  currentIndex: number,
  players: Array<{ isConnected: boolean }>,
  direction: 1 | -1,
  skip: number = 0
): number {
  const totalPlayers = players.length;
  let nextIndex = getNextPlayerIndex(currentIndex, totalPlayers, direction, skip);
  
  // Try to find a connected player (max iterations = totalPlayers to avoid infinite loop)
  for (let i = 0; i < totalPlayers; i++) {
    if (players[nextIndex].isConnected) {
      return nextIndex;
    }
    // Move to next player
    nextIndex = getNextPlayerIndex(nextIndex, totalPlayers, direction);
  }
  
  // No connected players found
  return -1;
}

/**
 * Handle Reverse card for 2-player games
 * If disabled, treat as miss-a-turn
 */
export function shouldReverseActAsMissATurn(
  totalPlayers: number,
  settings: GameSettings
): boolean {
  return totalPlayers === 2 && !settings.enableReverseFor2Players;
}

/**
 * Validate a play action
 */
export type PlayValidation = {
  valid: boolean;
  error?: string;
};

export function validatePlay(
  cardToPlay: Card,
  hand: Card[],
  currentSuit: string | null,
  topCard: Card | null,
  declaredSuit?: string
): PlayValidation {
  // Check if player has the card
  const hasCard = hand.some(c => c.id === cardToPlay.id);
  if (!hasCard) {
    return { valid: false, error: 'You don\'t have this card' };
  }

  // Check if card can be played
  if (!canPlayCard(cardToPlay, currentSuit, topCard)) {
    return { valid: false, error: `This card doesn't match the current suit (${currentSuit})` };
  }

  // Check if Change card has a declared suit
  if (isActionCard(cardToPlay) && cardToPlay.action === 'change' && !declaredSuit) {
    return { valid: false, error: 'You must choose a new suit when playing a Change card' };
  }

  return { valid: true };
}

/**
 * Determine the starting player
 */
export function determineStartingPlayer(
  totalPlayers: number,
  mode: 'random' | 'youngest' | 'manual',
  manualIndex?: number
): number {
  switch (mode) {
    case 'random':
      return Math.floor(Math.random() * totalPlayers);
    case 'youngest':
      // In digital version, default to first player (index 0)
      // The UI should prompt for youngest
      return 0;
    case 'manual':
      return manualIndex !== undefined && manualIndex < totalPlayers ? manualIndex : 0;
    default:
      return 0;
  }
}
