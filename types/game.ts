// Game state type definitions for DK Super Phonics Card Game

import { Card } from './card';
import { Player, PlayerGameState, CurrentPlayerState } from './player';

// Game status
export type GameStatus = 'waiting' | 'playing' | 'finished';

// Play direction
export type PlayDirection = 1 | -1; // 1 = clockwise, -1 = counter-clockwise

// Game settings configurable before game starts
export type GameSettings = {
  cardsPerPlayer: number; // Default: 5
  startingPlayerMode: 'random' | 'youngest' | 'manual';
  startingPlayerIndex?: number; // Only used if mode is 'manual'
  enableReverseFor2Players: boolean; // If false, Reverse acts as Miss-a-turn for 2 players
  enableTTS: boolean;
  ttsSpeed: 'normal' | 'slow';
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  cardsPerPlayer: 5,
  startingPlayerMode: 'random',
  enableReverseFor2Players: false,
  enableTTS: true,
  ttsSpeed: 'normal',
};

// Full game state (server-side, includes all cards)
export type GameState = {
  id: string;
  code: string; // 4-letter join code
  status: GameStatus;
  hostSessionId: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  currentSuit: string | null; // Vowel suit (a, e, i, o, u)
  drawPile: Card[];
  playPile: Card[];
  winnerSessionId: string | null;
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
};

// Game state sent to clients (hides other players' hands)
export type ClientGameState = {
  id: string;
  code: string;
  status: GameStatus;
  players: PlayerGameState[];
  currentPlayer: CurrentPlayerState; // The requesting player's full state
  currentPlayerIndex: number;
  direction: PlayDirection;
  currentSuit: string | null; // Vowel suit (a, e, i, o, u)
  topCard: Card | null; // Top card of play pile
  drawPileCount: number;
  playPileCount: number;
  winnerSessionId: string | null;
  settings: GameSettings;
  endReason?: string; // Reason game ended (e.g., "Player left")
};

// Game actions
export type PlayCardAction = {
  type: 'play_card';
  cardId: string;
  newSuit?: string; // Required if playing Change card
};

export type DrawCardAction = {
  type: 'draw_card';
};

export type GameAction = PlayCardAction | DrawCardAction;

// Game events (for UI updates)
export type GameEvent =
  | { type: 'card_played'; playerId: string; card: Card }
  | { type: 'card_drawn'; playerId: string }
  | { type: 'turn_skipped'; playerId: string }
  | { type: 'direction_reversed' }
  | { type: 'suit_changed'; newSuit: string }
  | { type: 'player_won'; playerId: string; playerName: string }
  | { type: 'player_joined'; playerId: string; playerName: string }
  | { type: 'player_left'; playerId: string; playerName: string }
  | { type: 'game_started' };

// Lobby state (before game starts)
export type LobbyState = {
  code: string;
  hostSessionId: string;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isConnected: boolean;
  }>;
  settings: GameSettings;
  minPlayers: 2;
  maxPlayers: 6;
};
