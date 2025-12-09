// POST /api/game/[code]/play - Play a card
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, updateGameState, updatePlayerHand } from '@/lib/db/game';
import { playCard } from '@/lib/game/engine';

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

    // Get request body
    const body = await request.json();
    const { cardId, declaredSuit } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
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

    // Use game engine to play card
    const result = playCard(game, session.sessionId, cardId, declaredSuit);

    if (!result.success || !result.newState) {
      return NextResponse.json(
        { error: result.error || 'Failed to play card' },
        { status: 400 }
      );
    }

    // Update database with new state
    const newState = result.newState;

    // Update game state
    await updateGameState(game.id, {
      status: newState.status,
      currentPlayer: newState.currentPlayerIndex,
      direction: newState.direction,
      currentSuit: newState.currentSuit,
      drawPile: newState.drawPile,
      playPile: newState.playPile,
      winnerSessionId: newState.winnerSessionId,
    });

    // Update player's hand
    const currentPlayer = newState.players.find(p => p.sessionId === session.sessionId);
    if (currentPlayer) {
      await updatePlayerHand(game.id, session.sessionId, currentPlayer.hand);
    }

    return NextResponse.json({
      success: true,
      events: result.events,
    });
  } catch (error) {
    console.error('Error playing card:', error);
    return NextResponse.json(
      { error: 'Failed to play card' },
      { status: 500 }
    );
  }
}
