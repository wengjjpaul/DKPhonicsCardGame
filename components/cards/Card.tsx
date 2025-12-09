// Base Card component with animations
'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CardSize = 'sm' | 'md' | 'lg';

export type CardProps = {
  children?: ReactNode;
  size?: CardSize;
  selected?: boolean;
  playable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'onClick'>;

const sizeClasses: Record<CardSize, string> = {
  sm: 'w-16 h-24 text-sm',
  md: 'w-24 h-36 text-base',
  lg: 'w-32 h-48 text-lg',
};

export function Card({
  children,
  size = 'md',
  selected = false,
  playable = true,
  disabled = false,
  onClick,
  className,
  ...motionProps
}: CardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 shadow-lg cursor-pointer transition-colors',
        'flex flex-col items-center justify-center',
        'bg-white',
        sizeClasses[size],
        selected && 'ring-4 ring-yellow-400 border-yellow-400',
        playable && !disabled && 'hover:shadow-xl hover:-translate-y-1',
        !playable && !disabled && 'opacity-60',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled && playable ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      layout
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// Card flip animation variants
export const cardFlipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.3 },
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.3 },
  },
};

// Card play animation (moving to pile)
export const cardPlayVariants = {
  initial: { scale: 1, x: 0, y: 0 },
  playing: {
    scale: 0.8,
    x: 0,
    y: -100,
    transition: { duration: 0.3 },
  },
  played: {
    scale: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.2 },
  },
};

// Card draw animation
export const cardDrawVariants = {
  initial: { scale: 0.5, opacity: 0, x: -100 },
  drawn: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export default Card;
