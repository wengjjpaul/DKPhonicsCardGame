// Create game page - set name and create a new online game
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';

export default function CreateGamePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // This will create a session if one doesn't exist
        await fetch('/api/session');
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
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
