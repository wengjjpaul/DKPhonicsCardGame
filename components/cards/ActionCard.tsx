// Action Card component - displays Change, Miss-a-turn, Reverse cards
'use client';

import { ActionCardType } from '@/types/card';
import { Card, CardProps, CardSize } from './Card';
import { cn } from '@/lib/utils';

export type ActionCardProps = {
  card: ActionCardType;
  size?: CardSize;
} & Omit<CardProps, 'children' | 'size'>;

// Action card configurations
const actionConfig = {
  change: {
    title: 'CHANGE',
    icon: '🔄',
    description: 'Pick a new suit',
    bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-700',
  },
  'miss-a-turn': {
    title: 'MISS A TURN',
    icon: '⏭️',
    description: 'Next player skips',
    bgColor: 'bg-gradient-to-br from-orange-100 to-red-100',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
  },
  reverse: {
    title: 'REVERSE',
    icon: '↩️',
    description: 'Change direction',
    bgColor: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-700',
  },
};

export function ActionCard({
  card,
  size = 'md',
  className,
  ...props
}: ActionCardProps) {
  const config = actionConfig[card.action];

  return (
    <Card
      size={size}
      className={cn(config.bgColor, config.borderColor, className)}
      {...props}
    >
      {/* Top corner indicator */}
      <div className={cn('absolute top-2 left-2', config.textColor)}>
        <span className="text-xl">{config.icon}</span>
      </div>

      {/* Bottom corner indicator (inverted) */}
      <div className={cn('absolute bottom-2 right-2 rotate-180', config.textColor)}>
        <span className="text-xl">{config.icon}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 px-2 text-center">
        <span className="text-3xl mb-2">{config.icon}</span>
        <span className={cn('text-sm font-bold uppercase tracking-tight', config.textColor)}>
          {config.title}
        </span>
        <span className={cn('text-xs mt-1 opacity-70', config.textColor)}>
          {config.description}
        </span>
      </div>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-xl">
        <div className="absolute inset-0 flex flex-wrap gap-2 p-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="text-2xl">
              {config.icon}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default ActionCard;
