// Game DnD Context - Provider and handlers for drag and drop
'use client';

import { ReactNode, useCallback, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core';
import { Card as CardType, isPhonicsCard, isActionCard } from '@/types/card';
import { PhonicsCard, ActionCard } from '@/components/cards';
import { playSound } from '@/lib/audio';
import { useSettingsStore } from '@/store/settingsStore';

export type GameDndContextProps = {
  children: ReactNode;
  onCardDrop: (cardId: string) => void;
  canPlayCard: (card: CardType) => boolean;
  hand: CardType[];
};

export function GameDndContext({
  children,
  onCardDrop,
  canPlayCard,
  hand,
}: GameDndContextProps) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isValidDrop, setIsValidDrop] = useState(false);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  // Configure sensors for both mouse and touch with activation constraints
  // Slightly delay for toddler touch - prevents accidental drags
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const card = hand.find(c => c.id === active.id);
    if (card) {
      setActiveCard(card);
      setIsValidDrop(canPlayCard(card));
      // Play pickup sound
      if (soundEnabled) {
        playSound('cardPickup');
      }
    }
  }, [hand, canPlayCard, soundEnabled]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (over?.id === 'play-pile' && activeCard) {
      setIsValidDrop(canPlayCard(activeCard));
    }
  }, [activeCard, canPlayCard]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over?.id === 'play-pile' && activeCard && canPlayCard(activeCard)) {
      onCardDrop(String(active.id));
    } else if (over?.id === 'play-pile' && activeCard && !canPlayCard(activeCard)) {
      // Invalid drop - play error sound
      if (soundEnabled) {
        playSound('cardDrop');
      }
    }
    
    setActiveCard(null);
    setIsValidDrop(false);
  }, [activeCard, canPlayCard, onCardDrop, soundEnabled]);

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
    setIsValidDrop(false);
  }, []);

  const renderDragOverlay = () => {
    if (!activeCard) return null;

    if (isPhonicsCard(activeCard)) {
      return (
        <div className="rotate-6 scale-110 drop-shadow-2xl">
          <PhonicsCard card={activeCard} size="md" playable={true} />
        </div>
      );
    }
    if (isActionCard(activeCard)) {
      return (
        <div className="rotate-6 scale-110 drop-shadow-2xl">
          <ActionCard card={activeCard} size="md" playable={true} />
        </div>
      );
    }
    return null;
  };

  return (
    <GameDndState.Provider value={{ activeCard, isValidDrop }}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        
        {/* Drag overlay - the card following the cursor */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </GameDndState.Provider>
  );
}

// Context for sharing drag state
import { createContext, useContext } from 'react';

type GameDndStateType = {
  activeCard: CardType | null;
  isValidDrop: boolean;
};

const GameDndState = createContext<GameDndStateType>({
  activeCard: null,
  isValidDrop: false,
});

export function useGameDndState() {
  return useContext(GameDndState);
}

export default GameDndContext;
