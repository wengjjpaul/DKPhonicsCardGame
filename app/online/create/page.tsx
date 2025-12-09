// Create game page - set name and create a new online game
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { generateFunName, getNameEmoji } from '@/lib/names';

export default function CreateGamePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [nameEmoji, setNameEmoji] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a fun name
  const generateNewName = useCallback(() => {
    setIsGenerating(true);
    // Small delay for animation effect
    setTimeout(() => {
      const newName = generateFunName();
      setPlayerName(newName);
      setNameEmoji(getNameEmoji(newName));
      setIsGenerating(false);
    }, 150);
  }, []);

  // Initialize session and generate initial name on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // This will create a session if one doesn't exist
        await fetch('/api/session');
        // Generate initial fun name
        generateNewName();
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [generateNewName]);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create game');
        setIsCreating(false);
        return;
      }

      // Navigate to game room
      router.push(`/online/${data.game.code}`);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Network error. Please try again.');
      setIsCreating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 p-4">
      <div className="container mx-auto max-w-md pt-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">🎮 Create Game</h1>
          <p className="text-white/80">Start a new game room</p>
        </motion.div>

        {/* Create form */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-4">
            {/* Name display with emoji */}
            <div className="text-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={playerName}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {nameEmoji && (
                    <motion.span
                      className="text-5xl block mb-2"
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {nameEmoji}
                    </motion.span>
                  )}
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
                  >
                    <span className="text-2xl font-bold">
                      {isGenerating ? '✨' : playerName || 'Your Name'}
                    </span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Regenerate button */}
            <motion.button
              onClick={generateNewName}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 
                        hover:from-purple-200 hover:to-pink-200 transition-all duration-300
                        text-purple-700 font-medium flex items-center justify-center gap-2
                        disabled:opacity-50 border-2 border-dashed border-purple-300
                        hover:border-purple-400 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                animate={isGenerating ? { rotate: 360 } : {}}
                transition={{ duration: 0.5, repeat: isGenerating ? Infinity : 0 }}
                className="text-xl"
              >
                🎲
              </motion.span>
              <span>Generate New Name</span>
              <motion.span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✨
              </motion.span>
            </motion.button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or type your own</span>
              </div>
            </div>

            {/* Manual input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Name
              </label>
              <Input
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setNameEmoji(null); // Clear emoji for custom names
                }}
                placeholder="Enter your name"
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>

            {error && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <Button
              onClick={handleCreate}
              disabled={isCreating || !playerName.trim()}
              className="w-full"
              size="lg"
            >
              {isCreating ? 'Creating...' : 'Create Game Room 🚀'}
            </Button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="bg-white/20 rounded-xl p-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-white mb-2">How it works:</h3>
          <ol className="text-white/90 text-sm space-y-1 list-decimal list-inside">
            <li>Enter your name and create a game room</li>
            <li>Share the 4-letter code with friends</li>
            <li>Wait for everyone to join</li>
            <li>Start the game when ready!</li>
          </ol>
        </motion.div>

        {/* Back button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => router.push('/online')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
