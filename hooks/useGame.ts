// Custom hook for game interactions
'use client';

import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { isPhonicsCard, isActionCard } from '@/types/card';

export function useGame() {
  const gameStore = useGameStore();
  const settings = useSettingsStore();

  // Derived state
  const currentPlayer = useMemo(() => gameStore.getCurrentPlayer(), [gameStore]);
  const topCard = useMemo(() => gameStore.getTopCard(), [gameStore]);
  const playableCards = useMemo(() => gameStore.getPlayableCards(), [gameStore]);
  const mustDraw = useMemo(() => gameStore.mustDrawCard(), [gameStore]);

  // Check if a specific card can be played
  const canPlay = useCallback(
    (cardId: string) => {
      if (!currentPlayer) return false;
      const card = currentPlayer.hand.find((c) => c.id === cardId);
      if (!card) return false;
      return playableCards.some((c) => c.id === cardId);
    },
    [currentPlayer, playableCards]
  );

  // Start a new game
  const startGame = useCallback(
    (playerNames: string[]) => {
      gameStore.initGame(playerNames, settings.defaultGameSettings);
    },
    [gameStore, settings.defaultGameSettings]
  );

  // Play selected card with optional suit (for Change card)
  const playCard = useCallback(
    (declaredSuit?: string) => {
      return gameStore.playSelectedCard(declaredSuit);
    },
    [gameStore]
  );

  // Draw a card
  const drawCard = useCallback(() => {
    return gameStore.drawCardAction();
  }, [gameStore]);

  // Get info about selected card
  const selectedCardInfo = useMemo(() => {
    if (!gameStore.selectedCardId || !currentPlayer) return null;
    const card = currentPlayer.hand.find((c) => c.id === gameStore.selectedCardId);
    if (!card) return null;

    return {
      card,
      isPhonics: isPhonicsCard(card),
      isAction: isActionCard(card),
      isChange: isActionCard(card) && card.action === 'change',
      canPlay: canPlay(card.id),
    };
  }, [gameStore.selectedCardId, currentPlayer, canPlay]);

  // Get game summary (for end screen)
  const gameSummary = useMemo(() => {
    if (gameStore.status !== 'finished') return null;

    const winner = gameStore.players.find(
      (p) => p.sessionId === gameStore.winnerSessionId
    );

    // Count words played (phonics cards in play pile)
    const wordsPlayed = gameStore.playPile
      .filter(isPhonicsCard)
      .map((c) => c.word);

    return {
      winner,
      totalTurns: gameStore.playPile.length,
      wordsPlayed,
      uniqueWords: [...new Set(wordsPlayed)],
    };
  }, [gameStore.status, gameStore.players, gameStore.winnerSessionId, gameStore.playPile]);

  return {
    // State
    ...gameStore,
    currentPlayer,
    topCard,
    playableCards,
    mustDraw,
    selectedCardInfo,
    gameSummary,

    // Actions
    startGame,
    playCard,
    drawCard,
    canPlay,
    selectCard: gameStore.selectCard,
    revealHand: gameStore.revealHand,
    hideHand: gameStore.hideHand,
    openSuitPicker: gameStore.openSuitPicker,
    closeSuitPicker: gameStore.closeSuitPicker,
    resetGame: gameStore.resetGame,
  };
}

export default useGame;
