// Online game landing page - create or join options
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';

export default function OnlinePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-400 to-indigo-600 p-4">
      <div className="container mx-auto max-w-md pt-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">🌐 Online Game</h1>
          <p className="text-white/80">Play with friends online</p>
        </motion.div>

        {/* Create game */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">Create a Game</h2>
          <p className="text-gray-600 mb-4">
            Start a new game and invite friends with a code
          </p>
          <Button
            onClick={() => router.push('/online/create')}
            className="w-full"
            size="lg"
          >
            Create Game Room 🎮
          </Button>
        </motion.div>

        {/* Join game */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">Join a Game</h2>
          <p className="text-gray-600 mb-4">Enter the 4-letter code from your friend</p>

          <div className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={4}
              className="text-center text-2xl font-bold tracking-widest uppercase"
            />
            <Button
              onClick={() => {
                if (joinCode.length === 4) {
                  router.push(`/online/${joinCode}`);
                }
              }}
              disabled={joinCode.length !== 4}
              size="lg"
            >
              Join
            </Button>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
