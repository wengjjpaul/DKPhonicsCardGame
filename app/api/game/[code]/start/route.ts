// POST /api/game/[code]/start - Start the game (host only)
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData } from '@/types/session';
import { getGameByCode, updateGameState, updatePlayersHands } from '@/lib/db/game';
import { createDeck, dealCards } from '@/lib/game/engine';
import { determineStartingPlayer } from '@/lib/game/rules';
import { isPhonicsCard, isActionCard } from '@/types/card';
import { shuffle } from '@/lib/game/engine';

type RouteParams = { params: Promise<{ code: string }> };

const MIN_PLAYERS = 2;

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

    // Only host can start
    if (game.hostSessionId !== session.sessionId) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      );
    }

    // Check if game is already started
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check minimum players
    const connectedPlayers = game.players.filter(p => p.isConnected);
    if (connectedPlayers.length < MIN_PLAYERS) {
      return NextResponse.json(
        { error: `Need at least ${MIN_PLAYERS} players to start` },
        { status: 400 }
      );
    }

    // Initialize game state
    const deck = createDeck();
    const { hands, remainingDeck } = dealCards(
      deck,
      connectedPlayers.length,
      game.settings.cardsPerPlayer
    );

    // Get starter card (must be phonics card)
    let starterCard = remainingDeck.shift()!;
    let drawPile = remainingDeck;

    if (isActionCard(starterCard)) {
      // Put action card back and find a phonics card
      drawPile = shuffle([starterCard, ...drawPile]);
      const phonicsIndex = drawPile.findIndex(c => isPhonicsCard(c));
      if (phonicsIndex !== -1) {
        starterCard = drawPile[phonicsIndex];
        drawPile = [...drawPile.slice(0, phonicsIndex), ...drawPile.slice(phonicsIndex + 1)];
      }
    }

    const playPile = [starterCard];
    const currentSuit = isPhonicsCard(starterCard) ? starterCard.suit : null;

    // Determine starting player
    const startingPlayerIndex = determineStartingPlayer(
      connectedPlayers.length,
      game.settings.startingPlayerMode,
      game.settings.startingPlayerIndex
    );

    // Update game state
    await updateGameState(game.id, {
      status: 'playing',
      currentPlayer: startingPlayerIndex,
      direction: 1,
      currentSuit,
      drawPile,
      playPile,
    });

    // Update players' hands (only connected players, in position order)
    const handUpdates = connectedPlayers
      .sort((a, b) => a.position - b.position)
      .map((player, index) => ({
        gameId: game.id,
        sessionId: player.sessionId,
        hand: hands[index],
      }));

    await updatePlayersHands(handUpdates);

    return NextResponse.json({
      success: true,
      message: 'Game started',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
