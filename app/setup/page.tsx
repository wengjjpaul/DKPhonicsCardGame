// Setup page - configure local game settings
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

export default function SetupPage() {
  const router = useRouter();
  const initGame = useGameStore((state) => state.initGame);
  const defaultSettings = useSettingsStore((state) => state.defaultGameSettings);

  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [step, setStep] = useState<'count' | 'names' | 'settings'>('count');

  // Settings
  const [cardsPerPlayer, setCardsPerPlayer] = useState(defaultSettings.cardsPerPlayer);
  const [enableTTS, setEnableTTS] = useState(defaultSettings.enableTTS);

  // Handle player count change
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    // Adjust player names array
    const newNames = [...playerNames];
    while (newNames.length < count) {
      newNames.push(`Player ${newNames.length + 1}`);
    }
    setPlayerNames(newNames.slice(0, count));
  };

  // Handle name change
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Start the game
  const handleStartGame = () => {
    // Validate names
    const validNames = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);

    initGame(validNames, {
      ...defaultSettings,
      cardsPerPlayer,
      enableTTS,
    });

    router.push('/play');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-400 to-emerald-600 p-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <motion.div
          className="text-center mb-8 pt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Game Setup</h1>
          <p className="text-white/80">Set up your local game</p>
        </motion.div>

        {/* Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {['count', 'names', 'settings'].map((s) => (
            <div
              key={s}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                step === s ? 'bg-white' : 'bg-white/40'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Player Count */}
          {step === 'count' && (
            <motion.div
              key="count"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                How many players?
              </h2>

              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map(
                  (num) => (
                    <motion.button
                      key={num}
                      onClick={() => handlePlayerCountChange(num)}
                      className={cn(
                        'w-14 h-14 rounded-xl font-bold text-xl transition-colors',
                        playerCount === num
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {num}
                    </motion.button>
                  )
                )}
              </div>

              <Button
                onClick={() => setStep('names')}
                className="w-full"
                size="lg"
              >
                Next →
              </Button>
            </motion.div>
          )}

          {/* Step 2: Player Names */}
          {step === 'names' && (
            <motion.div
              key="names"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Enter player names
              </h2>

              <div className="space-y-3 mb-6">
                {playerNames.map((name, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Input
                      label={`Player ${index + 1}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      maxLength={20}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep('count')}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep('settings')}
                  className="flex-1"
                >
                  Next →
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Settings */}
          {step === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Game Settings
              </h2>

              <div className="space-y-4 mb-6">
                {/* Cards per player */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cards per player
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCardsPerPlayer(num)}
                        className={cn(
                          'flex-1 py-2 rounded-lg font-medium transition-colors',
                          cardsPerPlayer === num
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TTS toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Read words aloud</span>
                    <p className="text-sm text-gray-500">Use text-to-speech</p>
                  </div>
                  <button
                    onClick={() => setEnableTTS(!enableTTS)}
                    className={cn(
                      'w-14 h-8 rounded-full transition-colors relative',
                      enableTTS ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    <motion.div
                      className="w-6 h-6 bg-white rounded-full absolute top-1"
                      animate={{ left: enableTTS ? '1.75rem' : '0.25rem' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Game Summary</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>👥 {playerCount} players</li>
                  <li>🃏 {cardsPerPlayer} cards each</li>
                  <li>🔊 TTS: {enableTTS ? 'On' : 'Off'}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep('names')}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleStartGame}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Start Game! 🎮
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to home */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
