// Database operations for Game model
import prisma from './prisma';
import { Card } from '@/types/card';
import { GameSettings, DEFAULT_GAME_SETTINGS, GameState, PlayDirection } from '@/types/game';
import { Player } from '@/types/player';
import { getCardById } from '@/lib/game/cards';

// ============================================
// Serialization Helpers
// ============================================

/**
 * Serialize card array to JSON string (store card IDs only)
 */
export function serializeCards(cards: Card[]): string {
  return JSON.stringify(cards.map(c => c.id));
}

/**
 * Deserialize JSON string to card array
 */
export function deserializeCards(json: string): Card[] {
  const cardIds: string[] = JSON.parse(json);
  return cardIds.map(id => getCardById(id)).filter((c): c is Card => c !== undefined);
}

/**
 * Serialize settings to JSON string
 */
export function serializeSettings(settings: GameSettings): string {
  return JSON.stringify(settings);
}

/**
 * Deserialize JSON string to settings
 */
export function deserializeSettings(json: string): GameSettings {
  return { ...DEFAULT_GAME_SETTINGS, ...JSON.parse(json) };
}

// ============================================
// Type for DB Game with Players
// ============================================

type DbGameWithPlayers = {
  id: string;
  code: string;
  status: string;
  hostSessionId: string;
  currentPlayer: number;
  direction: number;
  currentSuit: string | null;
  drawPile: string;
  playPile: string;
  winnerSessionId: string | null;
  settings: string;
  createdAt: Date;
  updatedAt: Date;
  players: Array<{
    id: string;
    sessionId: string;
    name: string;
    hand: string;
    position: number;
    isHost: boolean;
    isConnected: boolean;
    lastSeen: Date;
  }>;
};

// ============================================
// Convert DB Game to GameState
// ============================================

export function dbGameToGameState(dbGame: DbGameWithPlayers): GameState {
  const players: Player[] = dbGame.players
    .sort((a, b) => a.position - b.position)
    .map(p => ({
      id: p.id,
      sessionId: p.sessionId,
      name: p.name,
      hand: deserializeCards(p.hand),
      position: p.position,
      isHost: p.isHost,
      isConnected: p.isConnected,
      lastSeen: p.lastSeen,
    }));

  return {
    id: dbGame.id,
    code: dbGame.code,
    status: dbGame.status as GameState['status'],
    hostSessionId: dbGame.hostSessionId,
    players,
    currentPlayerIndex: dbGame.currentPlayer,
    direction: dbGame.direction as PlayDirection,
    currentSuit: dbGame.currentSuit,
    drawPile: deserializeCards(dbGame.drawPile),
    playPile: deserializeCards(dbGame.playPile),
    winnerSessionId: dbGame.winnerSessionId,
    settings: deserializeSettings(dbGame.settings),
    createdAt: dbGame.createdAt,
    updatedAt: dbGame.updatedAt,
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new game in the database
 */
export async function createGame(
  code: string,
  hostSessionId: string,
  hostName: string,
  settings: GameSettings = DEFAULT_GAME_SETTINGS
): Promise<GameState> {
  const dbGame = await prisma.game.create({
    data: {
      code,
      status: 'waiting',
      hostSessionId,
      currentPlayer: 0,
      direction: 1,
      currentSuit: null,
      drawPile: '[]',
      playPile: '[]',
      winnerSessionId: null,
      settings: serializeSettings(settings),
      players: {
        create: {
          sessionId: hostSessionId,
          name: hostName,
          hand: '[]',
          position: 0,
          isHost: true,
          isConnected: true,
        },
      },
    },
    include: { players: true },
  });

  return dbGameToGameState(dbGame);
}

/**
 * Get game by code
 */
export async function getGameByCode(code: string): Promise<GameState | null> {
  const dbGame = await prisma.game.findUnique({
    where: { code },
    include: { players: true },
  });

  if (!dbGame) return null;
  return dbGameToGameState(dbGame);
}

/**
 * Get game by ID
 */
export async function getGameById(id: string): Promise<GameState | null> {
  const dbGame = await prisma.game.findUnique({
    where: { id },
    include: { players: true },
  });

  if (!dbGame) return null;
  return dbGameToGameState(dbGame);
}

/**
 * Add a player to a game
 */
export async function addPlayerToGame(
  gameId: string,
  sessionId: string,
  name: string
): Promise<GameState | null> {
  // Get current player count for position
  const currentPlayers = await prisma.player.count({
    where: { gameId },
  });

  // Check if player already in game
  const existingPlayer = await prisma.player.findUnique({
    where: { gameId_sessionId: { gameId, sessionId } },
  });

  if (existingPlayer) {
    // Update existing player (reconnect)
    await prisma.player.update({
      where: { id: existingPlayer.id },
      data: { isConnected: true, lastSeen: new Date(), name },
    });
  } else {
    // Add new player
    await prisma.player.create({
      data: {
        gameId,
        sessionId,
        name,
        hand: '[]',
        position: currentPlayers,
        isHost: false,
        isConnected: true,
      },
    });
  }

  // Touch game updatedAt to trigger polling updates for other players
  await prisma.game.update({
    where: { id: gameId },
    data: { updatedAt: new Date() },
  });

  return getGameById(gameId);
}

/**
 * Remove a player from a game (or mark as disconnected)
 */
export async function removePlayerFromGame(
  gameId: string,
  sessionId: string,
  hardDelete: boolean = false
): Promise<GameState | null> {
  const player = await prisma.player.findUnique({
    where: { gameId_sessionId: { gameId, sessionId } },
  });

  if (!player) return getGameById(gameId);

  if (hardDelete) {
    await prisma.player.delete({
      where: { id: player.id },
    });
  } else {
    await prisma.player.update({
      where: { id: player.id },
      data: { isConnected: false, lastSeen: new Date() },
    });
  }

  // Touch game updatedAt to trigger polling updates for other players
  await prisma.game.update({
    where: { id: gameId },
    data: { updatedAt: new Date() },
  });

  return getGameById(gameId);
}

/**
 * Update game state (for starting game, playing cards, etc.)
 */
export async function updateGameState(
  gameId: string,
  updates: {
    status?: string;
    currentPlayer?: number;
    direction?: number;
    currentSuit?: string | null;
    drawPile?: Card[];
    playPile?: Card[];
    winnerSessionId?: string | null;
  }
): Promise<GameState | null> {
  const data: Record<string, unknown> = {};

  if (updates.status !== undefined) data.status = updates.status;
  if (updates.currentPlayer !== undefined) data.currentPlayer = updates.currentPlayer;
  if (updates.direction !== undefined) data.direction = updates.direction;
  if (updates.currentSuit !== undefined) data.currentSuit = updates.currentSuit;
  if (updates.drawPile !== undefined) data.drawPile = serializeCards(updates.drawPile);
  if (updates.playPile !== undefined) data.playPile = serializeCards(updates.playPile);
  if (updates.winnerSessionId !== undefined) data.winnerSessionId = updates.winnerSessionId;

  await prisma.game.update({
    where: { id: gameId },
    data,
  });

  return getGameById(gameId);
}

/**
 * Update player's hand
 */
export async function updatePlayerHand(
  gameId: string,
  sessionId: string,
  hand: Card[]
): Promise<void> {
  await prisma.player.update({
    where: { gameId_sessionId: { gameId, sessionId } },
    data: { hand: serializeCards(hand) },
  });
}

/**
 * Update multiple players' hands in a transaction
 */
export async function updatePlayersHands(
  updates: Array<{ gameId: string; sessionId: string; hand: Card[] }>
): Promise<void> {
  await prisma.$transaction(
    updates.map(u =>
      prisma.player.update({
        where: { gameId_sessionId: { gameId: u.gameId, sessionId: u.sessionId } },
        data: { hand: serializeCards(u.hand) },
      })
    )
  );
}

/**
 * Update player's last seen timestamp
 */
export async function updatePlayerLastSeen(
  gameId: string,
  sessionId: string
): Promise<void> {
  await prisma.player.update({
    where: { gameId_sessionId: { gameId, sessionId } },
    data: { lastSeen: new Date(), isConnected: true },
  });
}

/**
 * Delete a game and all its players
 */
export async function deleteGame(gameId: string): Promise<void> {
  await prisma.game.delete({
    where: { id: gameId },
  });
}

/**
 * Check if a game code is available
 */
export async function isGameCodeAvailable(code: string): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { code },
    select: { id: true },
  });
  return !game;
}

/**
 * Clean up old games (waiting for more than 24h or finished more than 1h ago)
 */
export async function cleanupOldGames(): Promise<number> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const result = await prisma.game.deleteMany({
    where: {
      OR: [
        { status: 'waiting', createdAt: { lt: oneDayAgo } },
        { status: 'finished', updatedAt: { lt: oneHourAgo } },
      ],
    },
  });

  return result.count;
}

/**
 * Handle player leaving mid-game
 * - Mark player as disconnected
 * - If it was their turn, advance to next connected player
 * - If fewer than 2 connected players remain, end the game
 * Returns updated game state and any special events
 */
export async function handlePlayerLeaveGame(
  gameId: string,
  sessionId: string
): Promise<{ game: GameState | null; gameEnded: boolean; reason?: string }> {
  const game = await getGameById(gameId);
  if (!game) {
    return { game: null, gameEnded: false };
  }

  const leavingPlayer = game.players.find(p => p.sessionId === sessionId);
  if (!leavingPlayer) {
    return { game, gameEnded: false };
  }

  // Mark player as disconnected
  await prisma.player.update({
    where: { gameId_sessionId: { gameId, sessionId } },
    data: { isConnected: false, lastSeen: new Date() },
  });

  // Count connected players
  const connectedPlayersCount = game.players.filter(
    p => p.sessionId !== sessionId && p.isConnected
  ).length;

  // If fewer than 2 connected players remain, end the game
  if (connectedPlayersCount < 2) {
    // Find the remaining connected player (if any) to declare as winner
    const remainingPlayer = game.players.find(
      p => p.sessionId !== sessionId && p.isConnected
    );

    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'finished',
        winnerSessionId: remainingPlayer?.sessionId || null,
        updatedAt: new Date(),
      },
    });

    const updatedGame = await getGameById(gameId);
    return { 
      game: updatedGame, 
      gameEnded: true, 
      reason: 'Not enough players to continue' 
    };
  }

  // If it was the leaving player's turn, advance to next connected player
  const wasTheirTurn = leavingPlayer.position === game.currentPlayerIndex;
  if (wasTheirTurn) {
    // Import dynamically to avoid circular dependency
    const { getNextConnectedPlayerIndex } = await import('@/lib/game/rules');
    
    // Create a temporary updated players array for the calculation
    const playersWithDisconnected = game.players.map(p => ({
      ...p,
      isConnected: p.sessionId === sessionId ? false : p.isConnected,
    }));
    
    const nextPlayerIndex = getNextConnectedPlayerIndex(
      game.currentPlayerIndex,
      playersWithDisconnected,
      game.direction
    );

    if (nextPlayerIndex !== -1) {
      await prisma.game.update({
        where: { id: gameId },
        data: {
          currentPlayer: nextPlayerIndex,
          updatedAt: new Date(),
        },
      });
    }
  } else {
    // Just touch updatedAt to trigger polling updates
    await prisma.game.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    });
  }

  const updatedGame = await getGameById(gameId);
  return { game: updatedGame, gameEnded: false };
}
