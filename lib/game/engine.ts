// Game engine - core game logic and state management

import { Card, isPhonicsCard, isActionCard } from '@/types/card';
import { GameState, GameSettings, DEFAULT_GAME_SETTINGS, PlayDirection } from '@/types/game';
import { Player } from '@/types/player';
import { ALL_CARDS, getCardById } from './cards';
import {
  canPlayCard,
  getNextPlayerIndex,
  getNextConnectedPlayerIndex,
  shouldReverseActAsMissATurn,
  validatePlay,
  determineStartingPlayer,
} from './rules';

// ============================================
// Utility Functions
// ============================================

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a 4-letter game code
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

// ============================================
// Game Initialization
// ============================================

/**
 * Create a new deck (shuffled copy of all cards)
 */
export function createDeck(): Card[] {
  return shuffle([...ALL_CARDS]);
}

/**
 * Deal cards to players
 */
export function dealCards(
  deck: Card[],
  playerCount: number,
  cardsPerPlayer: number
): { hands: Card[][]; remainingDeck: Card[] } {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  let deckIndex = 0;

  // Deal cards one at a time to each player
  for (let card = 0; card < cardsPerPlayer; card++) {
    for (let player = 0; player < playerCount; player++) {
      if (deckIndex < deck.length) {
        hands[player].push(deck[deckIndex]);
        deckIndex++;
      }
    }
  }

  return {
    hands,
    remainingDeck: deck.slice(deckIndex),
  };
}

/**
 * Initialize a new game state
 */
export function initializeGame(
  players: Array<{ sessionId: string; name: string }>,
  settings: GameSettings = DEFAULT_GAME_SETTINGS,
  hostSessionId: string
): GameState {
  const deck = createDeck();
  const { hands, remainingDeck } = dealCards(deck, players.length, settings.cardsPerPlayer);

  // Take top card for play pile
  const starterCard = remainingDeck.shift()!;
  
  // Ensure starter card is a phonics card (reshuffle if needed)
  let playPile = [starterCard];
  let drawPile = remainingDeck;
  
  if (isActionCard(starterCard)) {
    // Put action card back and find a phonics card
    drawPile = shuffle([starterCard, ...drawPile]);
    const phonicsIndex = drawPile.findIndex(c => isPhonicsCard(c));
    if (phonicsIndex !== -1) {
      playPile = [drawPile[phonicsIndex]];
      drawPile = [...drawPile.slice(0, phonicsIndex), ...drawPile.slice(phonicsIndex + 1)];
    }
  }

  // Determine starting suit from starter card
  const starterSuit = isPhonicsCard(playPile[0]) ? playPile[0].suit : null;

  // Create player objects
  const gamePlayers: Player[] = players.map((p, index) => ({
    id: generateId(),
    sessionId: p.sessionId,
    name: p.name,
    hand: hands[index],
    position: index,
    isHost: p.sessionId === hostSessionId,
    isConnected: true,
    lastSeen: new Date(),
  }));

  // Determine starting player
  const startingPlayer = determineStartingPlayer(
    players.length,
    settings.startingPlayerMode,
    settings.startingPlayerIndex
  );

  return {
    id: generateId(),
    code: generateGameCode(),
    status: 'playing',
    hostSessionId,
    players: gamePlayers,
    currentPlayerIndex: startingPlayer,
    direction: 1,
    currentSuit: starterSuit,
    drawPile,
    playPile,
    winnerSessionId: null,
    settings,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// Game Actions
// ============================================

export type PlayCardResult = {
  success: boolean;
  error?: string;
  newState?: GameState;
  events: GameEvent[];
};

export type GameEvent = {
  type: string;
  data: Record<string, unknown>;
};

/**
 * Play a card from a player's hand
 */
export function playCard(
  state: GameState,
  playerSessionId: string,
  cardId: string,
  declaredSuit?: string
): PlayCardResult {
  const events: GameEvent[] = [];

  // Verify it's the player's turn
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.sessionId !== playerSessionId) {
    return { success: false, error: 'Not your turn', events };
  }

  // Get the card
  const card = getCardById(cardId);
  if (!card) {
    return { success: false, error: 'Card not found', events };
  }

  // Validate the play
  const topCard = state.playPile[state.playPile.length - 1] ?? null;
  const validation = validatePlay(card, currentPlayer.hand, state.currentSuit, topCard, declaredSuit);
  if (!validation.valid) {
    return { success: false, error: validation.error, events };
  }

  // Create new state (immutable update)
  const newState = { ...state, updatedAt: new Date() };
  newState.players = [...state.players];
  newState.players[state.currentPlayerIndex] = {
    ...currentPlayer,
    hand: currentPlayer.hand.filter(c => c.id !== cardId),
  };

  // Add card to play pile
  newState.playPile = [...state.playPile, card];

  events.push({
    type: 'card_played',
    data: { playerId: currentPlayer.id, card, playerName: currentPlayer.name },
  });

  // Handle card effects
  let skipNext = 0;
  let reverseDirection = false;

  if (isPhonicsCard(card)) {
    // Update current suit
    newState.currentSuit = card.suit;
    events.push({ type: 'suit_changed', data: { newSuit: card.suit } });
  } else if (isActionCard(card)) {
    switch (card.action) {
      case 'change':
        // Change suit to declared suit
        if (declaredSuit) {
          newState.currentSuit = declaredSuit;
          events.push({ type: 'suit_changed', data: { newSuit: declaredSuit } });
        }
        break;

      case 'miss-a-turn':
        // Next player skips
        skipNext = 1;
        events.push({ type: 'turn_skipped', data: { skippedPlayers: 1 } });
        break;

      case 'reverse':
        // Reverse direction (or skip in 2-player if disabled)
        if (shouldReverseActAsMissATurn(state.players.length, state.settings)) {
          skipNext = 1;
          events.push({ type: 'turn_skipped', data: { skippedPlayers: 1 } });
        } else {
          reverseDirection = true;
          events.push({ type: 'direction_reversed', data: {} });
        }
        break;
    }
  }

  // Update direction if reversed
  if (reverseDirection) {
    newState.direction = (state.direction * -1) as PlayDirection;
  }

  // Check for win condition
  if (newState.players[state.currentPlayerIndex].hand.length === 0) {
    newState.status = 'finished';
    newState.winnerSessionId = currentPlayer.sessionId;
    events.push({
      type: 'player_won',
      data: { playerId: currentPlayer.id, playerName: currentPlayer.name },
    });
  } else {
    // Move to next connected player (skip disconnected players)
    newState.currentPlayerIndex = getNextConnectedPlayerIndex(
      state.currentPlayerIndex,
      newState.players,
      newState.direction,
      skipNext
    );
    
    // If no connected player found, this shouldn't happen in normal gameplay
    // but handle gracefully by ending the game
    if (newState.currentPlayerIndex === -1) {
      newState.status = 'finished';
      newState.winnerSessionId = currentPlayer.sessionId;
      events.push({
        type: 'player_won',
        data: { playerId: currentPlayer.id, playerName: currentPlayer.name },
      });
    }
  }

  return { success: true, newState, events };
}

/**
 * Draw a card from the draw pile
 */
export function drawCard(state: GameState, playerSessionId: string): PlayCardResult {
  const events: GameEvent[] = [];

  // Verify it's the player's turn
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.sessionId !== playerSessionId) {
    return { success: false, error: 'Not your turn', events };
  }

  // Check if player has playable cards (shouldn't draw if they do)
  const topCard = state.playPile[state.playPile.length - 1] ?? null;
  const hasPlayable = currentPlayer.hand.some(c => canPlayCard(c, state.currentSuit, topCard));
  if (hasPlayable) {
    return { success: false, error: 'You have a playable card', events };
  }

  // Create new state
  const newState = { ...state, updatedAt: new Date() };
  newState.drawPile = [...state.drawPile];
  newState.playPile = [...state.playPile];

  // Replenish draw pile if empty
  if (newState.drawPile.length === 0) {
    newState.drawPile = refreshDrawPile(newState.playPile);
    newState.playPile = [newState.playPile[newState.playPile.length - 1]]; // Keep top card
    events.push({ type: 'deck_refreshed', data: {} });
  }

  // Draw a card
  const drawnCard = newState.drawPile.shift();
  if (!drawnCard) {
    return { success: false, error: 'No cards to draw', events };
  }

  // Add to player's hand
  newState.players = [...state.players];
  newState.players[state.currentPlayerIndex] = {
    ...currentPlayer,
    hand: [...currentPlayer.hand, drawnCard],
  };

  events.push({
    type: 'card_drawn',
    data: { playerId: currentPlayer.id, playerName: currentPlayer.name },
  });

  // Move to next connected player (drawing ends turn)
  newState.currentPlayerIndex = getNextConnectedPlayerIndex(
    state.currentPlayerIndex,
    newState.players,
    state.direction
  );
  
  // If no connected player found, end the game
  if (newState.currentPlayerIndex === -1) {
    newState.status = 'finished';
    newState.winnerSessionId = currentPlayer.sessionId;
    events.push({
      type: 'player_won',
      data: { playerId: currentPlayer.id, playerName: currentPlayer.name },
    });
  }

  return { success: true, newState, events };
}

/**
 * Refresh draw pile from play pile (when draw pile is empty)
 */
export function refreshDrawPile(playPile: Card[]): Card[] {
  // Take all but the top card, shuffle them
  const cardsToShuffle = playPile.slice(0, -1);
  return shuffle(cardsToShuffle);
}

// ============================================
// Game State Queries
// ============================================

/**
 * Check if game is over
 */
export function isGameOver(state: GameState): boolean {
  return state.status === 'finished';
}

/**
 * Get the current player
 */
export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

/**
 * Get the top card of the play pile
 */
export function getTopCard(state: GameState): Card | null {
  return state.playPile[state.playPile.length - 1] ?? null;
}

/**
 * Get player by session ID
 */
export function getPlayerBySession(state: GameState, sessionId: string): Player | undefined {
  return state.players.find(p => p.sessionId === sessionId);
}

/**
 * Check if it's a specific player's turn
 */
export function isPlayerTurn(state: GameState, sessionId: string): boolean {
  const currentPlayer = getCurrentPlayer(state);
  return currentPlayer.sessionId === sessionId;
}
