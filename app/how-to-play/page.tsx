// How to Play page - explains game rules
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

export default function HowToPlayPage() {
  const router = useRouter();

  const sections = [
    {
      emoji: '🎯',
      title: 'Goal',
      content: 'Be the first player to get rid of all your cards!',
    },
    {
      emoji: '🃏',
      title: 'The Cards',
      content: `There are 50 cards in total:
• 42 Phonics Cards with CVC words (like "cat", "bed", "pig")
• 3 Change Cards - choose a new suit
• 3 Miss-a-Turn Cards - next player skips
• 2 Reverse Cards - changes direction`,
    },
    {
      emoji: '🎨',
      title: 'The 5 Suits',
      content: `Cards belong to 5 vowel suits:
🍎 Short A (red circle) - cat, bat, fan...
🥚 Short E (blue square) - bed, pen, ten...
🦎 Short I (green triangle) - pig, sit, win...
🐙 Short O (orange diamond) - dog, pot, top...
☂️ Short U (purple star) - bug, sun, cup...`,
    },
    {
      emoji: '🎮',
      title: 'How to Play',
      content: `1. Each player gets 5 cards
2. One card starts the play pile
3. On your turn, play a matching card OR draw
4. Match by SUIT (vowel sound) or WORD
5. Read the word aloud when you play!
6. Action cards have special effects
7. First to empty their hand wins!`,
    },
    {
      emoji: '⚡',
      title: 'Action Cards',
      content: `🔄 Change Card - Pick any suit you want
⏭️ Miss-a-Turn - Next player skips their turn
🔃 Reverse - Changes the direction of play`,
    },
    {
      emoji: '💡',
      title: 'Tips',
      content: `• Listen for the vowel sound in each word
• Sound out the words as you play
• Watch for action cards to shake things up!
• Have fun learning phonics!`,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-400 to-cyan-600 p-4">
      <div className="container mx-auto max-w-lg pt-8 pb-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">📖 How to Play</h1>
          <p className="text-white/80">Learn the rules of Super Phonics!</p>
        </motion.div>

        {/* Rules sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="bg-white rounded-2xl p-5 shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-2xl">{section.emoji}</span>
                {section.title}
              </h2>
              <p className="text-gray-600 whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          className="mt-8 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => router.push('/online')}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Start Playing! 🎮
          </Button>
        </motion.div>

        {/* Back to home */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
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
