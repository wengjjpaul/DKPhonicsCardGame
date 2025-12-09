// GET /api/game/[code] - Get game state (for polling)
// DELETE /api/game/[code] - Delete game (host only)
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, deleteGame, updatePlayerLastSeen } from '@/lib/db/game';
import { ClientGameState } from '@/types/game';
import { PlayerGameState, CurrentPlayerState } from '@/types/player';

type RouteParams = { params: Promise<{ code: string }> };

export async function GET(
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

    // Update player's last seen
    const currentPlayer = game.players.find(p => p.sessionId === session.sessionId);
    if (currentPlayer) {
      await updatePlayerLastSeen(game.id, session.sessionId);
    }

    // Build client game state (hide other players' hands)
    const playerStates: PlayerGameState[] = game.players.map(p => ({
      id: p.id,
      name: p.name,
      cardCount: p.hand.length,
      position: p.position,
      isHost: p.isHost,
      isConnected: p.isConnected,
      isCurrentTurn: p.position === game.currentPlayerIndex,
    }));

    // Current player state with hand
    let currentPlayerState: CurrentPlayerState | null = null;
    if (currentPlayer) {
      currentPlayerState = {
        id: currentPlayer.id,
        name: currentPlayer.name,
        cardCount: currentPlayer.hand.length,
        position: currentPlayer.position,
        isHost: currentPlayer.isHost,
        isConnected: currentPlayer.isConnected,
        isCurrentTurn: currentPlayer.position === game.currentPlayerIndex,
        hand: currentPlayer.hand,
      };
    }

    const clientState: ClientGameState = {
      id: game.id,
      code: game.code,
      status: game.status,
      players: playerStates,
      currentPlayer: currentPlayerState!,
      currentPlayerIndex: game.currentPlayerIndex,
      direction: game.direction,
      currentSuit: game.currentSuit,
      topCard: game.playPile[game.playPile.length - 1] || null,
      drawPileCount: game.drawPile.length,
      playPileCount: game.playPile.length,
      winnerSessionId: game.winnerSessionId,
      settings: game.settings,
    };

    return NextResponse.json({
      success: true,
      game: clientState,
      isPlayer: !!currentPlayer,
      updatedAt: game.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json(
      { error: 'Failed to get game' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only host can delete
    if (game.hostSessionId !== session.sessionId) {
      return NextResponse.json(
        { error: 'Only host can delete the game' },
        { status: 403 }
      );
    }

    await deleteGame(game.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}
