// POST /api/game/[code]/join - Join an existing game
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, addPlayerToGame } from '@/lib/db/game';

type RouteParams = { params: Promise<{ code: string }> };

const MAX_PLAYERS = 6;

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;
    
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
    const playerName = body.playerName || session.playerName || 'Player';

    // Get game
    const game = await getGameByCode(code.toUpperCase());

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is joinable
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check if already in game
    const existingPlayer = game.players.find(p => p.sessionId === session.sessionId);
    if (existingPlayer) {
      // Already in game, just return success
      return NextResponse.json({
        success: true,
        message: 'Already in game',
        game: {
          id: game.id,
          code: game.code,
          status: game.status,
        },
      });
    }

    // Check max players
    if (game.players.length >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: 'Game is full' },
        { status: 400 }
      );
    }

    // Add player to game
    const updatedGame = await addPlayerToGame(game.id, session.sessionId, playerName);

    if (!updatedGame) {
      return NextResponse.json(
        { error: 'Failed to join game' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      game: {
        id: updatedGame.id,
        code: updatedGame.code,
        status: updatedGame.status,
        players: updatedGame.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isConnected: p.isConnected,
        })),
      },
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
