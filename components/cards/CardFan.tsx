// Card Fan component - displays a hand of cards in a fan arrangement
'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, isPhonicsCard, isActionCard } from '@/types/card';
import { PhonicsCard } from './PhonicsCard';
import { ActionCard } from './ActionCard';
import { CardSize } from './Card';
import { cn } from '@/lib/utils';

export type CardFanProps = {
  cards: CardType[];
  selectedCardId?: string | null;
  playableCardIds?: string[];
  onCardClick?: (cardId: string) => void;
  size?: CardSize;
  disabled?: boolean;
  className?: string;
};

export function CardFan({
  cards,
  selectedCardId,
  playableCardIds = [],
  onCardClick,
  size = 'md',
  disabled = false,
  className,
}: CardFanProps) {
  // Calculate fan angles and offsets
  const fanLayout = useMemo(() => {
    const count = cards.length;
    const maxAngle = Math.min(count * 5, 30); // Max spread angle
    const angleStep = count > 1 ? (maxAngle * 2) / (count - 1) : 0;
    const startAngle = -maxAngle;

    return cards.map((card, index) => {
      const angle = count > 1 ? startAngle + angleStep * index : 0;
      const yOffset = Math.abs(angle) * 0.5; // Cards at edges are slightly lower

      return {
        card,
        angle,
        yOffset,
        zIndex: index,
      };
    });
  }, [cards]);

  return (
    <div className={cn('relative flex justify-center items-end h-40', className)}>
      <AnimatePresence mode="popLayout">
        {fanLayout.map(({ card, angle, yOffset, zIndex }) => {
          const isSelected = selectedCardId === card.id;
          const isPlayable = playableCardIds.includes(card.id);

          const cardProps = {
            key: card.id,
            size,
            selected: isSelected,
            playable: isPlayable,
            disabled,
            onClick: () => onCardClick?.(card.id),
          };

          return (
            <motion.div
              key={card.id}
              className="absolute"
              style={{ zIndex: isSelected ? 100 : zIndex }}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: isSelected ? -20 : yOffset,
                scale: isSelected ? 1.1 : 1,
                rotate: isSelected ? 0 : angle,
                x: zIndex * 30 - (cards.length * 30) / 2, // Spread horizontally
              }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={!disabled ? { y: isSelected ? -20 : -10, scale: 1.05 } : undefined}
            >
              {isPhonicsCard(card) ? (
                <PhonicsCard card={card} {...cardProps} />
              ) : isActionCard(card) ? (
                <ActionCard card={card} {...cardProps} />
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default CardFan;
