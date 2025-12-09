// Celebration overlay component with fun animations
'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type CelebrationProps = {
  message: string | null;
  isVisible: boolean;
};

export function Celebration({ message, isVisible }: CelebrationProps) {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Animated message */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.5,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-300 rounded-3xl blur-xl opacity-50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main message box */}
            <motion.div
              className="relative bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 
                         px-8 py-6 rounded-3xl shadow-2xl border-4 border-white"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              <motion.span
                className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.5)' 
                }}
              >
                {message}
              </motion.span>
            </motion.div>

            {/* Floating stars */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0 
                }}
                animate={{
                  x: (i % 2 === 0 ? 1 : -1) * (50 + i * 20),
                  y: -40 - i * 15,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                {['⭐', '🌟', '✨', '💫', '🎉', '💖'][i]}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Celebration;
