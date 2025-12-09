// Player type definitions for DK Super Phonics Card Game

import { Card } from './card';

export type Player = {
  id: string;
  sessionId: string;
  name: string;
  hand: Card[];
  position: number; // Order in turn sequence (0-indexed)
  isHost: boolean;
  isConnected: boolean;
  lastSeen: Date;
};

// For creating/joining games (minimal info needed)
export type PlayerJoinInfo = {
  sessionId: string;
  name: string;
};

// Player state during gameplay
export type PlayerGameState = {
  id: string;
  name: string;
  cardCount: number; // Other players only see card count, not cards
  position: number;
  isHost: boolean;
  isConnected: boolean;
  isCurrentTurn: boolean;
};

// For the current player (can see their own hand)
export type CurrentPlayerState = PlayerGameState & {
  hand: Card[];
};
