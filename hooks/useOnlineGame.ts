// Hook for online game state with adaptive polling
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientGameState } from '@/types/game';
import { Card, isActionCard } from '@/types/card';

// Adaptive polling intervals
const POLL_INTERVALS = {
  waiting: 5000,      // 5 seconds in lobby
  myTurn: 1500,       // 1.5 seconds when it's my turn
  otherTurn: 1500,    // 1.5 seconds when waiting for others
  baseError: 6000,    // 6 seconds after error (doubles on repeated errors)
  maxError: 24000,    // Max 24 seconds between retries
};

type OnlineGameState = {
  // Game state from server
  game: ClientGameState | null;
  isLoading: boolean;
  error: string | null;
  isPlayer: boolean;
  
  // Connection state
  isPolling: boolean;
  lastUpdated: Date | null;
  
  // Actions
  joinGame: (playerName: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => Promise<{ success: boolean; error?: string }>;
  playCard: (cardId: string, declaredSuit?: string) => Promise<{ success: boolean; error?: string }>;
  drawCard: () => Promise<{ success: boolean; error?: string }>;
  leaveGame: () => Promise<{ success: boolean; error?: string }>;
  
  // UI helpers
  isMyTurn: boolean;
  canPlayCard: (card: Card) => boolean;
  mustDraw: boolean;
  isCardBeingPlayed: (cardId: string) => boolean;
};

export function useOnlineGame(gameCode: string): OnlineGameState {
  const [game, setGame] = useState<ClientGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Track cards currently being played to prevent double-plays
  const [cardsBeingPlayed, setCardsBeingPlayed] = useState<Set<string>>(new Set());
  
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<string | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Calculate adaptive poll interval based on game state
  const getPollInterval = useCallback((currentGame: ClientGameState | null, hasError: boolean) => {
    // Error backoff: double interval for each consecutive error (up to max)
    if (hasError) {
      const errorInterval = POLL_INTERVALS.baseError * Math.pow(2, consecutiveErrorsRef.current);
      return Math.min(errorInterval, POLL_INTERVALS.maxError);
    }
    
    // Reset error count on success
    consecutiveErrorsRef.current = 0;
    
    if (!currentGame) return POLL_INTERVALS.waiting;
    
    // Waiting lobby - less urgent
    if (currentGame.status === 'waiting') {
      return POLL_INTERVALS.waiting;
    }
    
    // Game in progress - check if it's my turn
    if (currentGame.status === 'playing') {
      const isMyTurn = currentGame.currentPlayer?.isCurrentTurn ?? false;
      return isMyTurn ? POLL_INTERVALS.myTurn : POLL_INTERVALS.otherTurn;
    }
    
    // Default (shouldn't reach here as finished games stop polling)
    return POLL_INTERVALS.otherTurn;
  }, []);

  // Schedule next poll with adaptive interval
  const scheduleNextPoll = useCallback((currentGame: ClientGameState | null, hasError: boolean) => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    
    // Don't poll if tab is hidden or game is finished
    if (!isVisibleRef.current || currentGame?.status === 'finished') {
      return;
    }
    
    const interval = getPollInterval(currentGame, hasError);
    pollTimeoutRef.current = setTimeout(() => {
      fetchGameAndSchedule();
    }, interval);
  }, [getPollInterval]);

  // Fetch game state and schedule next poll
  const fetchGameAndSchedule = useCallback(async () => {
    let hasError = false;
    let currentGame: ClientGameState | null = null;
    
    try {
      const response = await fetch(`/api/game/${gameCode}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to fetch game');
        hasError = true;
        consecutiveErrorsRef.current++;
      } else {
        // Only update state if game has changed
        if (data.updatedAt !== lastUpdateTimeRef.current) {
          lastUpdateTimeRef.current = data.updatedAt;
          setGame(data.game);
          setIsPlayer(data.isPlayer);
          setLastUpdated(new Date(data.updatedAt));
        }
        currentGame = data.game;
        setError(null);
        consecutiveErrorsRef.current = 0;
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching game:', err);
      hasError = true;
      consecutiveErrorsRef.current++;
    } finally {
      setIsLoading(false);
    }
    
    // Schedule next poll with adaptive interval
    scheduleNextPoll(currentGame ?? game, hasError);
  }, [gameCode, game, scheduleNextPoll]);

  // Fetch game state (for initial load and manual refresh)
  const fetchGame = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    await fetchGameAndSchedule();
  }, [fetchGameAndSchedule]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling) return;
    setIsPolling(true);
    isVisibleRef.current = true;
    // Initial fetch will trigger the polling chain
  }, [isPolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        // Clear pending poll
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
          pollTimeoutRef.current = null;
        }
      } else {
        isVisibleRef.current = true;
        // Resume polling with immediate fetch if we were polling
        if (isPolling && game?.status !== 'finished') {
          fetchGameAndSchedule();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling, game?.status, fetchGameAndSchedule]);

  // Initial fetch and start polling
  useEffect(() => {
    setIsLoading(true);
    startPolling();
    fetchGameAndSchedule();
    
    return () => {
      stopPolling();
    };
  }, []);

  // Stop polling when game is finished
  useEffect(() => {
    if (game?.status === 'finished') {
      stopPolling();
    }
  }, [game?.status, stopPolling]);

  // Join game
  const joinGame = useCallback(async (playerName: string) => {
    try {
      const response = await fetch(`/api/game/${gameCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      // Refresh game state
      await fetchGame(false);
      return { success: true };
    } catch (err) {
      console.error('Error joining game:', err);
      return { success: false, error: 'Network error' };
    }
  }, [gameCode, fetchGame]);

  // Start game (host only)
  const startGame = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${gameCode}/start`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      // Refresh game state
      await fetchGame(false);
      return { success: true };
    } catch (err) {
      console.error('Error starting game:', err);
      return { success: false, error: 'Network error' };
    }
  }, [gameCode, fetchGame]);

  // Play a card
  const playCard = useCallback(async (cardId: string, declaredSuit?: string) => {
    // Prevent double-plays of the same card
    if (cardsBeingPlayed.has(cardId)) {
      return { success: false, error: 'Card is already being played' };
    }
    
    // Mark card as being played
    setCardsBeingPlayed(prev => new Set(prev).add(cardId));
    
    // Optimistically remove the card from the local UI state
    setGame(prevGame => {
      if (!prevGame || !prevGame.currentPlayer) return prevGame;
      return {
        ...prevGame,
        currentPlayer: {
          ...prevGame.currentPlayer,
          hand: prevGame.currentPlayer.hand.filter(c => c.id !== cardId),
        },
      };
    });
    
    try {
      const response = await fetch(`/api/game/${gameCode}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, declaredSuit }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Revert optimistic update on error by refreshing game state
        await fetchGame(false);
        return { success: false, error: data.error };
      }
      
      // Refresh game state to get the authoritative state from server
      await fetchGame(false);
      return { success: true };
    } catch (err) {
      console.error('Error playing card:', err);
      // Revert optimistic update on error
      await fetchGame(false);
      return { success: false, error: 'Network error' };
    } finally {
      // Remove card from being-played set
      setCardsBeingPlayed(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  }, [gameCode, fetchGame, cardsBeingPlayed]);

  // Draw a card
  const drawCard = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${gameCode}/draw`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      // Refresh game state
      await fetchGame(false);
      return { success: true };
    } catch (err) {
      console.error('Error drawing card:', err);
      return { success: false, error: 'Network error' };
    }
  }, [gameCode, fetchGame]);

  // Leave game
  const leaveGame = useCallback(async () => {
    stopPolling();
    
    try {
      const response = await fetch(`/api/game/${gameCode}/leave`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error leaving game:', err);
      return { success: false, error: 'Network error' };
    }
  }, [gameCode, stopPolling]);

  // Helper: Check if it's current player's turn
  const isMyTurn = game?.currentPlayer?.isCurrentTurn ?? false;

  // Helper: Check if a card can be played
  const canPlayCard = useCallback((card: Card) => {
    if (!game || !isMyTurn) return false;
    
    const currentSuit = game.currentSuit;
    
    // If no current suit (start of game), any card can be played
    if (!currentSuit) {
      return true;
    }
    
    // Action cards can always be played
    if (isActionCard(card)) return true;
    
    // Phonics cards must match suit
    if ('suit' in card) {
      return card.suit === currentSuit;
    }
    
    return false;
  }, [game, isMyTurn]);

  // Helper: Check if player must draw
  const mustDraw = game?.currentPlayer?.hand.every(card => !canPlayCard(card)) ?? false;

  // Helper: Check if a card is currently being played
  const isCardBeingPlayed = useCallback((cardId: string) => {
    return cardsBeingPlayed.has(cardId);
  }, [cardsBeingPlayed]);

  return {
    game,
    isLoading,
    error,
    isPlayer,
    isPolling,
    lastUpdated,
    joinGame,
    startGame,
    playCard,
    drawCard,
    leaveGame,
    isMyTurn,
    canPlayCard,
    mustDraw,
    isCardBeingPlayed,
  };
}

export default useOnlineGame;
