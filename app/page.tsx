// Home page - landing page with game options
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            📚 Super Phonics
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The Fun Card Game for Learning to Read!
          </motion.p>
        </motion.div>

        {/* Card preview animation */}
        <motion.div
          className="flex gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {['cat', 'dog', 'sun'].map((word, i) => (
            <motion.div
              key={word}
              className="w-20 h-28 bg-white rounded-xl shadow-xl flex items-center justify-center"
              initial={{ y: 50, rotate: -10 + i * 10 }}
              animate={{ y: 0, rotate: -10 + i * 10 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
              whileHover={{ y: -10, scale: 1.1 }}
            >
              <span className="text-2xl font-bold text-indigo-600">{word}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Game options */}
        <motion.div
          className="w-full max-w-md space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Local Game */}
          <Link href="/setup" className="block">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎮</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Local Game</h2>
                  <p className="text-gray-600">Play on one device (pass & play)</p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Online Game */}
          <Link href="/online" className="block">
            <motion.div
              className="bg-white/90 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌐</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Online Game</h2>
                  <p className="text-gray-600">Play with friends online</p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* How to Play */}
          <motion.div
            className="bg-white/80 rounded-2xl p-6 shadow-xl cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📖</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">How to Play</h2>
                <p className="text-gray-600">Learn the rules</p>
              </div>
            </div>
          </motion.div>

          {/* Progress */}
          <Link href="/progress" className="block">
            <motion.div
              className="bg-white/70 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Progress</h2>
                  <p className="text-gray-600">See words you have learned</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-12 text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          A digital version of DK Super Phonics Card Game
        </motion.footer>
      </div>
    </div>
  );
}
