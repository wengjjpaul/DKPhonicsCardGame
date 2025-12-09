// Suit Indicator component - shows current active suit
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getSuitInfo } from '@/lib/game/suits';
import { cn } from '@/lib/utils';

export type SuitIndicatorProps = {
  currentSuit: string | null;
  className?: string;
};

export function SuitIndicator({ currentSuit, className }: SuitIndicatorProps) {
  const suitInfo = currentSuit ? getSuitInfo(currentSuit) : null;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
        Current Suit
      </span>
      
      <AnimatePresence mode="wait">
        {suitInfo ? (
          <motion.div
            key={currentSuit}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border-2',
              suitInfo.bgColor,
              suitInfo.borderColor
            )}
          >
            <span className={cn('text-2xl', suitInfo.color)}>
              {suitInfo.shape}
            </span>
            <span className={cn('text-lg font-bold uppercase', suitInfo.color)}>
              {suitInfo.name}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 rounded-full bg-gray-100 border-2 border-gray-300"
          >
            <span className="text-gray-500">Any suit</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuitIndicator;
