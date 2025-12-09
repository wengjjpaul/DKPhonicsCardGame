// Phonics Card component - displays CVC word with suit indicator
'use client';

import { PhonicsCardType } from '@/types/card';
import { getSuitBgColor, getSuitBorderColor, getSuitColor, getSuitShape } from '@/lib/game/suits';
import { Card, CardProps, CardSize } from './Card';
import { cn } from '@/lib/utils';
import { useTTS } from '@/hooks/useTTS';

export type PhonicsCardProps = {
  card: PhonicsCardType;
  showGraphemes?: boolean; // For teaching mode
  size?: CardSize;
  speakOnClick?: boolean; // Enable TTS when clicking word
} & Omit<CardProps, 'children' | 'size'>;

export function PhonicsCard({
  card,
  showGraphemes = false,
  size = 'md',
  speakOnClick = true,
  className,
  ...props
}: PhonicsCardProps) {
  const bgColor = getSuitBgColor(card.suit);
  const borderColor = getSuitBorderColor(card.suit);
  const textColor = getSuitColor(card.suit);
  const shape = getSuitShape(card.suit);
  const { speak, isSpeaking } = useTTS();

  const handleWordClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card selection
    if (speakOnClick) {
      speak(card.word);
    }
  };

  const handleWordTouch = (e: React.TouchEvent) => {
    e.stopPropagation(); // Don't trigger card drag
    e.preventDefault(); // Prevent subsequent click event
    if (speakOnClick) {
      speak(card.word);
    }
  };

  return (
    <Card
      size={size}
      className={cn(bgColor, borderColor, className)}
      {...props}
    >
      {/* Full card TTS tap area */}
      {speakOnClick && (
        <button
          onClick={handleWordClick}
          onTouchEnd={handleWordTouch}
          className="absolute inset-0 z-10 cursor-pointer touch-auto"
          aria-label={`Hear the word: ${card.word}`}
        />
      )}

      {/* Suit indicator - top left */}
      <div className={cn('absolute top-2 left-2 flex items-center gap-1', textColor)}>
        <span className="text-lg font-bold">{shape}</span>
        <span className="text-xs font-semibold uppercase">{card.suit}</span>
      </div>

      {/* Suit indicator - bottom right (inverted) */}
      <div className={cn('absolute bottom-2 right-2 flex items-center gap-1 rotate-180', textColor)}>
        <span className="text-lg font-bold">{shape}</span>
        <span className="text-xs font-semibold uppercase">{card.suit}</span>
      </div>

      {/* Word display */}
      <div className="flex flex-col items-center justify-center flex-1 px-2">
        {showGraphemes ? (
          // Teaching mode: show graphemes separately
          <div className="flex gap-0.5">
            {card.graphemes.map((g, i) => (
              <span
                key={i}
                className={cn(
                  'text-2xl font-bold px-1 rounded',
                  // Highlight vowel differently
                  ['a', 'e', 'i', 'o', 'u'].includes(g)
                    ? cn(textColor, 'bg-white/50')
                    : 'text-gray-800'
                )}
              >
                {g}
              </span>
            ))}
          </div>
        ) : (
          // Normal mode: show word
          <span 
            className={cn(
              'text-2xl font-bold tracking-wide',
              textColor,
              isSpeaking && 'animate-pulse'
            )}
          >
            {card.word}
          </span>
        )}
        {/* Speaker icon - visual indicator only */}
        <span
          className={cn(
            'text-sm mt-1 opacity-60',
            textColor,
            isSpeaking && 'opacity-100'
          )}
        >
          🔊
        </span>
      </div>

      {/* Small decorative elements */}
      <div className={cn('absolute top-1/2 -translate-y-1/2 left-1 opacity-20', textColor)}>
        <span className="text-3xl">{shape}</span>
      </div>
      <div className={cn('absolute top-1/2 -translate-y-1/2 right-1 opacity-20', textColor)}>
        <span className="text-3xl">{shape}</span>
      </div>
    </Card>
  );
}

export default PhonicsCard;
