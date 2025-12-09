// Session type definitions for DK Super Phonics Card Game

// Session data stored in encrypted cookie
export type SessionData = {
  sessionId: string; // Auto-generated unique ID
  playerName?: string; // Set when user enters name
  createdAt: string; // ISO timestamp
};

// Default empty session
export const DEFAULT_SESSION: SessionData = {
  sessionId: '',
  playerName: undefined,
  createdAt: '',
};

// Session API response
export type SessionResponse = {
  session: SessionData;
  isNew: boolean;
};

// Update session request
export type UpdateSessionRequest = {
  playerName?: string;
};
