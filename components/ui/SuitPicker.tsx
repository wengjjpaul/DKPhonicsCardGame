// Suit Picker component - modal for selecting a new suit (Change card)
'use client';

import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { ALL_SUITS, SuitInfo } from '@/lib/game/suits';
import { cn } from '@/lib/utils';

export type SuitPickerProps = {
  isOpen: boolean;
  onSelect: (suit: string) => void;
  onClose: () => void;
};

export function SuitPicker({ isOpen, onSelect, onClose }: SuitPickerProps) {
  const handleSelect = (suit: SuitInfo) => {
    onSelect(suit.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a New Suit"
      showCloseButton={true}
      closeOnOverlayClick={false}
    >
      <div className="text-center mb-4 text-gray-600">
        Pick the suit that the next player must match
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ALL_SUITS.map((suit, index) => (
          <motion.button
            key={suit.id}
            onClick={() => handleSelect(suit)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              'flex flex-col items-center gap-2',
              'hover:shadow-lg',
              suit.bgColor,
              suit.borderColor
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shape indicator */}
            <span className={cn('text-4xl', suit.color)}>{suit.shape}</span>

            {/* Suit name */}
            <span className={cn('text-lg font-bold uppercase', suit.color)}>
              {suit.name}
            </span>

            {/* Example words */}
            <span className="text-xs text-gray-500">
              {suit.examples.slice(0, 2).join(', ')}...
            </span>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}

export default SuitPicker;
