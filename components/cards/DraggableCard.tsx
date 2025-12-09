// Draggable Card component for toddler-friendly drag and drop
'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Card as CardType, isPhonicsCard, isActionCard } from '@/types/card';
import { PhonicsCard, ActionCard } from '@/components/cards';
import { cn } from '@/lib/utils';

export type DraggableCardProps = {
  card: CardType;
  size?: 'sm' | 'md' | 'lg';
  isPlayable?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export function DraggableCard({
  card,
  size = 'md',
  isPlayable = true,
  isSelected = false,
  disabled = false,
  onSelect,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card },
    disabled: disabled || !isPlayable,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  const renderCard = () => {
    if (isPhonicsCard(card)) {
      return <PhonicsCard card={card} size={size} playable={isPlayable} selected={isSelected} />;
    }
    if (isActionCard(card)) {
      return <ActionCard card={card} size={size} playable={isPlayable} selected={isSelected} />;
    }
    return null;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'touch-none select-none cursor-grab active:cursor-grabbing transition-all',
        isDragging && 'scale-110 rotate-3 shadow-2xl',
        isSelected && 'ring-4 ring-yellow-400 rounded-xl',
        !isPlayable && !disabled && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
      onClick={onSelect}
      whileHover={isPlayable && !disabled ? { y: -12, scale: 1.05 } : undefined}
      whileTap={isPlayable && !disabled ? { scale: 0.95 } : undefined}
      animate={
        isDragging
          ? { 
              scale: 1.1,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }
          : {
              scale: 1,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Wiggle animation when card is playable and it's player's turn */}
      <motion.div
        animate={
          isPlayable && !disabled && !isDragging
            ? {
                rotate: [0, -2, 2, -2, 0],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {renderCard()}
      </motion.div>

      {/* Drag hint for toddlers */}
      {isPlayable && !disabled && !isDragging && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white 
                     text-xs px-2 py-1 rounded-full opacity-0 pointer-events-none"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          Drag me! 👆
        </motion.div>
      )}
    </motion.div>
  );
}

export default DraggableCard;
