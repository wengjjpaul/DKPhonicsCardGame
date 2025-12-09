// Player Hand component - displays current player's cards
'use client';

import { Card as CardType } from '@/types/card';
import { CardFan } from '@/components/cards';
import { cn } from '@/lib/utils';

export type PlayerHandProps = {
  cards: CardType[];
  selectedCardId?: string | null;
  playableCardIds?: string[];
  onCardSelect?: (cardId: string) => void;
  disabled?: boolean;
  className?: string;
};

export function PlayerHand({
  cards,
  selectedCardId,
  playableCardIds = [],
  onCardSelect,
  disabled = false,
  className,
}: PlayerHandProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Hand container */}
      <div className="relative pb-4">
        <CardFan
          cards={cards}
          selectedCardId={selectedCardId}
          playableCardIds={playableCardIds}
          onCardClick={onCardSelect}
          disabled={disabled}
          size="md"
        />
      </div>

      {/* Card count indicator */}
      <div className="text-center text-sm text-gray-500 mt-2">
        {cards.length} card{cards.length !== 1 ? 's' : ''} in hand
      </div>
    </div>
  );
}

export default PlayerHand;
