// Turn Transition component - pass-and-play screen between turns
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type TurnTransitionProps = {
  isVisible: boolean;
  playerName: string;
  onReady: () => void;
  className?: string;
};

export function TurnTransition({
  isVisible,
  playerName,
  onReady,
  className,
}: TurnTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-linear-to-br from-indigo-600 to-purple-700',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center text-white p-8"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {/* Pass device message */}
            <motion.div
              className="text-xl mb-4 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3 }}
            >
              Pass the device to...
            </motion.div>

            {/* Player name */}
            <motion.div
              className="text-5xl font-bold mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              {playerName}
            </motion.div>

            {/* Ready button */}
            <motion.button
              className={cn(
                'px-8 py-4 bg-white text-indigo-700 rounded-full',
                'text-xl font-bold shadow-lg',
                'hover:bg-yellow-300 hover:scale-105 transition-all',
                'focus:outline-none focus:ring-4 focus:ring-yellow-400'
              )}
              onClick={onReady}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              I&apos;m Ready! 👋
            </motion.button>

            {/* Privacy reminder */}
            <motion.p
              className="mt-6 text-sm opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
            >
              Make sure no one else can see the screen
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TurnTransition;
