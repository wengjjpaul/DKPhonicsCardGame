// Play Pile component - shows the center pile with top card
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, isPhonicsCard, isActionCard } from '@/types/card';
import { PhonicsCard, ActionCard } from '@/components/cards';
import { cn } from '@/lib/utils';

export type PlayPileProps = {
  topCard: CardType | null;
  cardCount: number;
  className?: string;
};

export function PlayPile({ topCard, cardCount, className }: PlayPileProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Pile shadow/stack effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: Math.min(cardCount, 3) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-24 h-36 bg-gray-300 rounded-xl"
            style={{
              transform: `translate(${i * 2}px, ${i * 2}px)`,
              zIndex: i,
            }}
          />
        ))}
      </div>

      {/* Top card */}
      <AnimatePresence mode="wait">
        {topCard && (
          <motion.div
            key={topCard.id}
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10"
          >
            {isPhonicsCard(topCard) ? (
              <PhonicsCard card={topCard} size="md" playable={false} />
            ) : isActionCard(topCard) ? (
              <ActionCard card={topCard} size="md" playable={false} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card count badge */}
      {cardCount > 1 && (
        <motion.div
          className="absolute -bottom-2 -right-2 bg-gray-700 text-white rounded-full px-2 py-0.5 text-xs font-bold z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {cardCount}
        </motion.div>
      )}
    </div>
  );
}

export default PlayPile;
