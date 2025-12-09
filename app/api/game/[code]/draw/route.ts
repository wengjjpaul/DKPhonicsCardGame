// POST /api/game/[code]/draw - Draw a card
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, updateGameState, updatePlayerHand } from '@/lib/db/game';
import { drawCard } from '@/lib/game/engine';

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

    if (game.status !== 'playing') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      );
    }

    // Use game engine to draw card
    const result = drawCard(game, session.sessionId);

    if (!result.success || !result.newState) {
      return NextResponse.json(
        { error: result.error || 'Failed to draw card' },
        { status: 400 }
      );
    }

    // Update database with new state
    const newState = result.newState;

    // Update game state
    await updateGameState(game.id, {
      currentPlayer: newState.currentPlayerIndex,
      drawPile: newState.drawPile,
      playPile: newState.playPile,
    });

    // Update player's hand (they now have one more card)
    const player = newState.players.find(p => p.sessionId === session.sessionId);
    if (player) {
      await updatePlayerHand(game.id, session.sessionId, player.hand);
    }

    return NextResponse.json({
      success: true,
      events: result.events,
    });
  } catch (error) {
    console.error('Error drawing card:', error);
    return NextResponse.json(
      { error: 'Failed to draw card' },
      { status: 500 }
    );
  }
}
