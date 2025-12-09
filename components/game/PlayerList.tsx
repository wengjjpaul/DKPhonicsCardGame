// Player List component - shows all players with turn indicator
'use client';

import { motion } from 'framer-motion';
import { Player } from '@/types/player';
import { cn } from '@/lib/utils';

export type PlayerListProps = {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  className?: string;
};

// Simple avatar colors based on position
const avatarColors = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-pink-400',
];

export function PlayerList({
  players,
  currentPlayerIndex,
  direction,
  className,
}: PlayerListProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* Direction indicator */}
      <motion.div
        className="text-2xl text-gray-400"
        animate={{ rotate: direction === 1 ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {direction === 1 ? '→' : '←'}
      </motion.div>

      {/* Player avatars */}
      <div className="flex items-center gap-3">
        {players.map((player, index) => {
          const isCurrentTurn = index === currentPlayerIndex;
          const cardCount = player.hand.length;

          return (
            <motion.div
              key={player.id}
              className={cn(
                'relative flex flex-col items-center',
                isCurrentTurn && 'scale-110'
              )}
              animate={{
                scale: isCurrentTurn ? 1.1 : 1,
                y: isCurrentTurn ? -5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Turn indicator */}
              {isCurrentTurn && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-lg">👇</span>
                </motion.div>
              )}

              {/* Avatar */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                  avatarColors[index % avatarColors.length],
                  isCurrentTurn && 'ring-4 ring-yellow-400 ring-offset-2'
                )}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>

              {/* Player name */}
              <span
                className={cn(
                  'text-xs mt-1 max-w-16 truncate',
                  isCurrentTurn ? 'font-bold text-gray-800' : 'text-gray-500'
                )}
              >
                {player.name}
              </span>

              {/* Card count badge */}
              <motion.div
                className="absolute -bottom-1 -right-1 bg-gray-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                key={cardCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {cardCount}
              </motion.div>

              {/* Win indicator */}
              {cardCount === 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 text-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  🏆
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Direction indicator (right side) */}
      <motion.div
        className="text-2xl text-gray-400"
        animate={{ rotate: direction === 1 ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {direction === 1 ? '→' : '←'}
      </motion.div>
    </div>
  );
}

export default PlayerList;
