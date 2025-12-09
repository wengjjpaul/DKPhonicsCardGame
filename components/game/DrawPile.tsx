// Draw Pile component - shows the deck to draw from
'use client';

import { motion } from 'framer-motion';
import { CardBack } from '@/components/cards';
import { cn } from '@/lib/utils';

export type DrawPileProps = {
  cardCount: number;
  onDraw?: () => void;
  canDraw?: boolean;
  className?: string;
};

export function DrawPile({ cardCount, onDraw, canDraw = true, className }: DrawPileProps) {
  const isEmpty = cardCount === 0;

  return (
    <div className={cn('relative', className)}>
      {/* Stack effect */}
      {!isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: Math.min(cardCount, 4) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-24 h-36 bg-indigo-800 rounded-xl"
              style={{
                transform: `translate(${-i * 1}px, ${-i * 1}px)`,
                zIndex: i,
              }}
            />
          ))}
        </div>
      )}

      {/* Top card (clickable) */}
      {isEmpty ? (
        <motion.div
          className="w-24 h-36 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-gray-400 text-sm">Empty</span>
        </motion.div>
      ) : (
        <motion.div
          className="relative z-10"
          whileHover={canDraw ? { scale: 1.05 } : undefined}
          whileTap={canDraw ? { scale: 0.98 } : undefined}
        >
          <CardBack
            size="md"
            count={cardCount}
            onClick={canDraw ? onDraw : undefined}
            disabled={!canDraw}
            className={cn(
              canDraw && 'cursor-pointer hover:shadow-xl',
              !canDraw && 'opacity-70'
            )}
          />
          
          {/* Draw prompt */}
          {canDraw && (
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Click to draw
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default DrawPile;
