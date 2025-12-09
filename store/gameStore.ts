// Zustand store for game state management
import { create } from 'zustand';
import { Card, isPhonicsCard, isActionCard } from '@/types/card';
import { GameSettings, DEFAULT_GAME_SETTINGS, PlayDirection } from '@/types/game';
import { Player } from '@/types/player';
import {
  initializeGame,
  playCard as enginePlayCard,
  drawCard as engineDrawCard,
  GameEvent,
} from '@/lib/game/engine';
import { canPlayCard, getPlayableCards } from '@/lib/game/rules';
import { recordWordPracticed } from '@/lib/progress';

// Local game state (for pass-and-play mode)
export type LocalGameState = {
  // Game data
  id: string;
  code: string;
  status: 'setup' | 'playing' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  currentSuit: string | null;
  drawPile: Card[];
  playPile: Card[];
  winnerSessionId: string | null;
  settings: GameSettings;

  // UI state
  isHandRevealed: boolean; // For pass-and-play
  selectedCardId: string | null;
  showSuitPicker: boolean;
  lastEvent: GameEvent | null;

  // Actions
  initGame: (playerNames: string[], settings?: GameSettings) => void;
  revealHand: () => void;
  hideHand: () => void;
  selectCard: (cardId: string | null) => void;
  playSelectedCard: (declaredSuit?: string) => { success: boolean; error?: string };
  drawCardAction: () => { success: boolean; error?: string };
  openSuitPicker: () => void;
  closeSuitPicker: () => void;
  resetGame: () => void;

  // Queries
  getCurrentPlayer: () => Player | null;
  getTopCard: () => Card | null;
  getPlayableCards: () => Card[];
  canPlaySelectedCard: () => boolean;
  mustDrawCard: () => boolean;
};

export const useGameStore = create<LocalGameState>((set, get) => ({
  // Initial state
  id: '',
  code: '',
  status: 'setup',
  players: [],
  currentPlayerIndex: 0,
  direction: 1,
  currentSuit: null,
  drawPile: [],
  playPile: [],
  winnerSessionId: null,
  settings: DEFAULT_GAME_SETTINGS,

  // UI state
  isHandRevealed: false,
  selectedCardId: null,
  showSuitPicker: false,
  lastEvent: null,

  // Initialize a new game
  initGame: (playerNames: string[], settings = DEFAULT_GAME_SETTINGS) => {
    // Create player objects with mock session IDs for local play
    const players = playerNames.map((name, index) => ({
      sessionId: `local-player-${index}`,
      name,
    }));

    const gameState = initializeGame(players, settings, players[0].sessionId);

    set({
      id: gameState.id,
      code: gameState.code,
      status: 'playing',
      players: gameState.players,
      currentPlayerIndex: gameState.currentPlayerIndex,
      direction: gameState.direction,
      currentSuit: gameState.currentSuit,
      drawPile: gameState.drawPile,
      playPile: gameState.playPile,
      winnerSessionId: null,
      settings,
      isHandRevealed: false,
      selectedCardId: null,
      showSuitPicker: false,
      lastEvent: { type: 'game_started', data: {} },
    });
  },

  // Reveal current player's hand (pass-and-play)
  revealHand: () => set({ isHandRevealed: true }),

  // Hide hand for turn transition
  hideHand: () =>
    set({
      isHandRevealed: false,
      selectedCardId: null,
      showSuitPicker: false,
    }),

  // Select a card to play
  selectCard: (cardId: string | null) => set({ selectedCardId: cardId }),

  // Play the selected card
  playSelectedCard: (declaredSuit?: string) => {
    const state = get();
    const { selectedCardId, currentPlayerIndex, players } = state;

    if (!selectedCardId) {
      return { success: false, error: 'No card selected' };
    }

    const currentPlayer = players[currentPlayerIndex];
    const card = currentPlayer.hand.find((c) => c.id === selectedCardId);

    if (!card) {
      return { success: false, error: 'Card not found in hand' };
    }

    // If it's a Change card and no suit declared, open suit picker
    if (isActionCard(card) && card.action === 'change' && !declaredSuit) {
      set({ showSuitPicker: true });
      return { success: false, error: 'Please select a new suit' };
    }

    // Create a game state object for the engine
    const engineState = {
      id: state.id,
      code: state.code,
      status: state.status as 'playing',
      hostSessionId: players[0].sessionId,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      direction: state.direction,
      currentSuit: state.currentSuit,
      drawPile: state.drawPile,
      playPile: state.playPile,
      winnerSessionId: state.winnerSessionId,
      settings: state.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = enginePlayCard(engineState, currentPlayer.sessionId, selectedCardId, declaredSuit);

    if (result.success && result.newState) {
      const isWin = result.newState.status === 'finished';
      
      // Track word practiced if it's a phonics card
      if (isPhonicsCard(card)) {
        recordWordPracticed(card.word);
      }
      
      set({
        players: result.newState.players,
        currentPlayerIndex: result.newState.currentPlayerIndex,
        direction: result.newState.direction,
        currentSuit: result.newState.currentSuit,
        drawPile: result.newState.drawPile,
        playPile: result.newState.playPile,
        winnerSessionId: result.newState.winnerSessionId,
        status: isWin ? 'finished' : 'playing',
        selectedCardId: null,
        showSuitPicker: false,
        isHandRevealed: isWin, // Keep revealed if game over
        lastEvent: result.events[0] || null,
      });

      return { success: true };
    }

    return { success: false, error: result.error };
  },

  // Draw a card
  drawCardAction: () => {
    const state = get();
    const { currentPlayerIndex, players } = state;
    const currentPlayer = players[currentPlayerIndex];

    const engineState = {
      id: state.id,
      code: state.code,
      status: state.status as 'playing',
      hostSessionId: players[0].sessionId,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      direction: state.direction,
      currentSuit: state.currentSuit,
      drawPile: state.drawPile,
      playPile: state.playPile,
      winnerSessionId: state.winnerSessionId,
      settings: state.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = engineDrawCard(engineState, currentPlayer.sessionId);

    if (result.success && result.newState) {
      set({
        players: result.newState.players,
        currentPlayerIndex: result.newState.currentPlayerIndex,
        drawPile: result.newState.drawPile,
        playPile: result.newState.playPile,
        selectedCardId: null,
        isHandRevealed: false, // Hide after drawing
        lastEvent: result.events[0] || null,
      });

      return { success: true };
    }

    return { success: false, error: result.error };
  },

  // Suit picker
  openSuitPicker: () => set({ showSuitPicker: true }),
  closeSuitPicker: () => set({ showSuitPicker: false }),

  // Reset game
  resetGame: () =>
    set({
      id: '',
      code: '',
      status: 'setup',
      players: [],
      currentPlayerIndex: 0,
      direction: 1,
      currentSuit: null,
      drawPile: [],
      playPile: [],
      winnerSessionId: null,
      isHandRevealed: false,
      selectedCardId: null,
      showSuitPicker: false,
      lastEvent: null,
    }),

  // Queries
  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex] || null;
  },

  getTopCard: () => {
    const { playPile } = get();
    return playPile[playPile.length - 1] || null;
  },

  getPlayableCards: () => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return [];

    const topCard = state.playPile[state.playPile.length - 1] || null;
    return getPlayableCards(currentPlayer.hand, state.currentSuit, topCard);
  },

  canPlaySelectedCard: () => {
    const state = get();
    const { selectedCardId, currentPlayerIndex, players, currentSuit, playPile } = state;

    if (!selectedCardId) return false;

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return false;

    const card = currentPlayer.hand.find((c) => c.id === selectedCardId);
    if (!card) return false;

    const topCard = playPile[playPile.length - 1] || null;
    return canPlayCard(card, currentSuit, topCard);
  },

  mustDrawCard: () => {
    const state = get();
    const playableCards = state.getPlayableCards();
    return playableCards.length === 0;
  },
}));

export default useGameStore;
