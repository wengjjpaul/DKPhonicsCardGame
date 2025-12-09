// POST /api/game - Create a new game
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { createGame, isGameCodeAvailable } from '@/lib/db/game';
import { generateGameCode } from '@/lib/game/engine';
import { DEFAULT_GAME_SETTINGS, GameSettings } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // Auto-create session if none exists
    if (!session.sessionId) {
      session.sessionId = generateSessionId();
      session.createdAt = new Date().toISOString();
      await session.save();
    }

    // Get request body
    const body = await request.json().catch(() => ({}));
    const playerName = body.playerName || session.playerName || 'Player 1';
    const settings: GameSettings = { ...DEFAULT_GAME_SETTINGS, ...body.settings };

    // Generate unique game code
    let code = generateGameCode();
    let attempts = 0;
    while (!(await isGameCodeAvailable(code)) && attempts < 10) {
      code = generateGameCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Unable to generate game code. Please try again.' },
        { status: 500 }
      );
    }

    // Create game
    const game = await createGame(code, session.sessionId, playerName, settings);

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        code: game.code,
        status: game.status,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isConnected: p.isConnected,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
