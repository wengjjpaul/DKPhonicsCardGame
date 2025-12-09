// Game Board component - main game layout
'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { PlayerList } from './PlayerList';
import { PlayPile } from './PlayPile';
import { DrawPile } from './DrawPile';
import { PlayerHand } from './PlayerHand';
import { SuitIndicator } from './SuitIndicator';
import { TurnTransition } from './TurnTransition';
import { SuitPicker } from '@/components/ui';
import { cn } from '@/lib/utils';

export type GameBoardProps = {
  className?: string;
};

export function GameBoard({ className }: GameBoardProps) {
  const {
    status,
    players,
    currentPlayerIndex,
    direction,
    currentSuit,
    drawPile,
    playPile,
    isHandRevealed,
    selectedCardId,
    showSuitPicker,
    currentPlayer,
    topCard,
    playableCards,
    mustDraw,
    selectCard,
    playCard,
    drawCard,
    revealHand,
    closeSuitPicker,
  } = useGame();

  // Handle playing the selected card
  const handlePlayCard = () => {
    if (!selectedCardId) return;
    const result = playCard();
    if (!result.success && result.error) {
      // Show error (could add toast notification)
      console.log(result.error);
    }
  };

  // Handle suit selection (for Change card)
  const handleSuitSelect = (suit: string) => {
    playCard(suit);
  };

  // Handle drawing a card
  const handleDraw = () => {
    const result = drawCard();
    if (!result.success && result.error) {
      console.log(result.error);
    }
  };

  // Show turn transition if hand is not revealed
  if (!isHandRevealed && status === 'playing' && currentPlayer) {
    return (
      <TurnTransition
        isVisible={true}
        playerName={currentPlayer.name}
        onReady={revealHand}
      />
    );
  }

  // Get playable card IDs for highlighting
  const playableCardIds = playableCards.map((c) => c.id);

  return (
    <div className={cn('min-h-screen bg-linear-to-b from-green-100 to-green-200 p-4', className)}>
      {/* Suit Picker Modal */}
      <SuitPicker
        isOpen={showSuitPicker}
        onSelect={handleSuitSelect}
        onClose={closeSuitPicker}
      />

      {/* Top section - Players */}
      <div className="mb-6">
        <PlayerList
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          direction={direction}
        />
      </div>

      {/* Middle section - Play area */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* Draw pile */}
        <DrawPile
          cardCount={drawPile.length}
          onDraw={handleDraw}
          canDraw={mustDraw && isHandRevealed}
        />

        {/* Center - Play pile and suit indicator */}
        <div className="flex flex-col items-center gap-4">
          <SuitIndicator currentSuit={currentSuit} />
          <PlayPile topCard={topCard} cardCount={playPile.length} />
        </div>

        {/* Spacer to balance layout */}
        <div className="w-24" />
      </div>

      {/* Bottom section - Player's hand */}
      <div className="mt-8">
        {currentPlayer && (
          <>
            {/* Player name */}
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-lg font-bold text-gray-700">
                {currentPlayer.name}&apos;s Turn
              </span>
            </motion.div>

            {/* Hand */}
            <PlayerHand
              cards={currentPlayer.hand}
              selectedCardId={selectedCardId}
              playableCardIds={playableCardIds}
              onCardSelect={selectCard}
              disabled={!isHandRevealed}
            />

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-6">
              {/* Play button */}
              <motion.button
                className={cn(
                  'px-6 py-3 rounded-full font-bold text-lg shadow-md',
                  'transition-colors',
                  selectedCardId && playableCardIds.includes(selectedCardId)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
                onClick={handlePlayCard}
                disabled={!selectedCardId || !playableCardIds.includes(selectedCardId)}
                whileHover={selectedCardId ? { scale: 1.05 } : undefined}
                whileTap={selectedCardId ? { scale: 0.98 } : undefined}
              >
                Play Card
              </motion.button>

              {/* Draw button (if must draw) */}
              {mustDraw && (
                <motion.button
                  className="px-6 py-3 rounded-full font-bold text-lg bg-blue-500 text-white shadow-md hover:bg-blue-600"
                  onClick={handleDraw}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Draw Card
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GameBoard;
