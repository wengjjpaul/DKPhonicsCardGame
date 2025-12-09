// POST /api/game/[code]/leave - Leave the game
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, removePlayerFromGame, deleteGame, handlePlayerLeaveGame } from '@/lib/db/game';

type RouteParams = { params: Promise<{ code: string }> };

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

    // Get game
    const game = await getGameByCode(code.toUpperCase());

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if player is in game
    const player = game.players.find(p => p.sessionId === session.sessionId);
    if (!player) {
      return NextResponse.json(
        { error: 'You are not in this game' },
        { status: 400 }
      );
    }

    // If host leaves waiting game, delete the game
    if (player.isHost && game.status === 'waiting') {
      await deleteGame(game.id);
      return NextResponse.json({
        success: true,
        message: 'Game deleted',
        gameDeleted: true,
      });
    }

    // If game is in progress, handle mid-game leave
    if (game.status === 'playing') {
      const { gameEnded, reason } = await handlePlayerLeaveGame(game.id, session.sessionId);
      
      return NextResponse.json({
        success: true,
        message: gameEnded ? reason : 'Disconnected from game',
        gameDeleted: false,
        gameEnded,
      });
    }

    // If game is waiting, remove player entirely
    const hardDelete = game.status === 'waiting';
    await removePlayerFromGame(game.id, session.sessionId, hardDelete);

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Left game' : 'Disconnected from game',
      gameDeleted: false,
    });
  } catch (error) {
    console.error('Error leaving game:', error);
    return NextResponse.json(
      { error: 'Failed to leave game' },
      { status: 500 }
    );
  }
}
