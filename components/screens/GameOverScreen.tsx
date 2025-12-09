// Game Over screen component
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/ui';

export function GameOverScreen() {
  const router = useRouter();
  const { gameSummary, resetGame } = useGame();

  if (!gameSummary) return null;

  const { winner, totalTurns, uniqueWords } = gameSummary;

  const handlePlayAgain = () => {
    // Reset and go to setup
    resetGame();
    router.push('/setup');
  };

  const handleHome = () => {
    resetGame();
    router.push('/');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-linear-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Trophy and confetti */}
        <motion.div
          className="text-8xl mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          🏆
        </motion.div>

        {/* Winner announcement */}
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {winner?.name} Wins!
        </motion.h1>

        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Congratulations! 🎉
        </motion.p>

        {/* Stats */}
        <motion.div
          className="bg-gray-50 rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-bold text-gray-700 mb-3">Game Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-indigo-600">{totalTurns}</div>
              <div className="text-gray-500">Cards Played</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{uniqueWords.length}</div>
              <div className="text-gray-500">Words Practiced</div>
            </div>
          </div>

          {/* Words practiced */}
          {uniqueWords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Words you read:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {uniqueWords.slice(0, 12).map((word, i) => (
                  <motion.span
                    key={word}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    {word}
                  </motion.span>
                ))}
                {uniqueWords.length > 12 && (
                  <span className="px-2 py-1 text-gray-500 text-sm">
                    +{uniqueWords.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Play Again 🔄
          </Button>
          <Button
            variant="secondary"
            onClick={handleHome}
            size="lg"
            className="w-full"
          >
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default GameOverScreen;
