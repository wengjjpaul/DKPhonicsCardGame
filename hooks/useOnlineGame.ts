// Hook for online game state with polling
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientGameState } from '@/types/game';
import { Card, isActionCard } from '@/types/card';

const POLL_INTERVAL = 1500; // 1.5 seconds

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
};

export function useOnlineGame(gameCode: string): OnlineGameState {
  const [game, setGame] = useState<ClientGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<string | null>(null);

  // Fetch game state
  const fetchGame = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await fetch(`/api/game/${gameCode}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to fetch game');
        return;
      }
      
      // Only update state if game has changed
      if (data.updatedAt !== lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = data.updatedAt;
        setGame(data.game);
        setIsPlayer(data.isPlayer);
        setLastUpdated(new Date(data.updatedAt));
      }
      
      setError(null);
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching game:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameCode]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    setIsPolling(true);
    pollIntervalRef.current = setInterval(() => {
      fetchGame(false);
    }, POLL_INTERVAL);
  }, [fetchGame]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Initial fetch and start polling
  useEffect(() => {
    fetchGame(true);
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [fetchGame, startPolling, stopPolling]);

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
    try {
      const response = await fetch(`/api/game/${gameCode}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, declaredSuit }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      // Refresh game state
      await fetchGame(false);
      return { success: true };
    } catch (err) {
      console.error('Error playing card:', err);
      return { success: false, error: 'Network error' };
    }
  }, [gameCode, fetchGame]);

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
  };
}

export default useOnlineGame;
