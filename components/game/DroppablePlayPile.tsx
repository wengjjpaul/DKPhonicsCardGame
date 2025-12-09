// Droppable Play Pile - where cards are dropped to play
'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, isPhonicsCard, isActionCard } from '@/types/card';
import { PhonicsCard, ActionCard } from '@/components/cards';
import { useGameDndState } from './GameDndContext';
import { cn } from '@/lib/utils';

export type DroppablePlayPileProps = {
  topCard: CardType | null;
  cardCount: number;
  isMyTurn?: boolean;
  className?: string;
};

export function DroppablePlayPile({
  topCard,
  cardCount,
  isMyTurn = false,
  className,
}: DroppablePlayPileProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: 'play-pile',
  });
  
  // Get drag state from context
  const { isValidDrop } = useGameDndState();

  const isDraggingOver = isOver && active;
  const showDropHint = isMyTurn && active;

  return (
    <motion.div
      ref={setNodeRef}
      className={cn(
        'relative p-4 rounded-3xl transition-all duration-300',
        isDraggingOver && isValidDrop && 'bg-green-200 ring-4 ring-green-400',
        isDraggingOver && !isValidDrop && 'bg-red-100 ring-4 ring-red-300',
        showDropHint && !isDraggingOver && 'bg-blue-50 ring-2 ring-blue-200 ring-dashed',
        className
      )}
      animate={
        isDraggingOver && isValidDrop
          ? { scale: 1.05 }
          : { scale: 1 }
      }
    >
      {/* Drop hint text */}
      <AnimatePresence>
        {showDropHint && (
          <motion.div
            className={cn(
              'absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap',
              isDraggingOver && isValidDrop && 'bg-green-500 text-white',
              isDraggingOver && !isValidDrop && 'bg-red-400 text-white',
              !isDraggingOver && 'bg-blue-400 text-white'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {isDraggingOver && isValidDrop && '✓ Drop here!'}
            {isDraggingOver && !isValidDrop && '✗ Can\'t play this card'}
            {!isDraggingOver && '🎯 Drop card here!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing drop zone indicator */}
      {showDropHint && !isDraggingOver && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-dashed border-blue-300 pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pile shadow/stack effect */}
      <div className="relative flex items-center justify-center min-h-[144px] min-w-[96px]">
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

        {/* Top card */}
        <AnimatePresence mode="wait">
          {topCard && (
            <motion.div
              key={topCard.id}
              initial={{ scale: 0.5, opacity: 0, y: -50, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10"
            >
              {isPhonicsCard(topCard) ? (
                <PhonicsCard card={topCard} size="lg" playable={false} />
              ) : isActionCard(topCard) ? (
                <ActionCard card={topCard} size="lg" playable={false} />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty pile placeholder */}
        {!topCard && (
          <motion.div
            className="w-24 h-36 rounded-xl border-4 border-dashed border-gray-300 
                       flex items-center justify-center bg-gray-100"
            animate={{
              borderColor: isDraggingOver ? '#22c55e' : '#d1d5db',
            }}
          >
            <span className="text-gray-400 text-4xl">🎴</span>
          </motion.div>
        )}
      </div>

      {/* Card count badge */}
      {cardCount > 1 && (
        <motion.div
          className="absolute -bottom-2 -right-2 bg-gray-700 text-white rounded-full px-3 py-1 text-sm font-bold z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {cardCount}
        </motion.div>
      )}

      {/* Success glow effect on valid drop */}
      {isDraggingOver && isValidDrop && (
        <motion.div
          className="absolute inset-0 rounded-3xl bg-green-400 opacity-20 pointer-events-none"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}

export default DroppablePlayPile;
