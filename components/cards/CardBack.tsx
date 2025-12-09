// Card Back component - face-down card display
'use client';

import { motion } from 'framer-motion';
import { Card, CardProps, CardSize } from './Card';
import { cn } from '@/lib/utils';

export type CardBackProps = {
  size?: CardSize;
  count?: number; // Optional: show count for deck
} & Omit<CardProps, 'children' | 'size'>;

export function CardBack({
  size = 'md',
  count,
  className,
  ...props
}: CardBackProps) {
  return (
    <Card
      size={size}
      className={cn(
        'bg-linear-to-br from-indigo-500 to-purple-600 border-indigo-700',
        className
      )}
      {...props}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-2 rounded-lg border-2 border-white/30 flex items-center justify-center overflow-hidden">
        {/* Diamond pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 gap-1 p-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/50 rotate-45 transform scale-75"
              />
            ))}
          </div>
        </div>

        {/* Center logo/text */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-3xl">📚</span>
          <span className="text-white/80 text-xs font-bold mt-1 tracking-wider">
            PHONICS
          </span>
        </div>
      </div>

      {/* Count badge */}
      {count !== undefined && count > 0 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={count}
        >
          {count}
        </motion.div>
      )}
    </Card>
  );
}

export default CardBack;
