// Play page - main game screen
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/game';
import { GameOverScreen } from '@/components/screens';
import { recordGamePlayed, recordGameWon } from '@/lib/progress';

export default function PlayPage() {
  const router = useRouter();
  const { status, players, winnerSessionId } = useGame();
  const gameStartTracked = useRef(false);
  const gameWinTracked = useRef(false);

  // Redirect to setup if no game is active
  useEffect(() => {
    if (status === 'setup' || players.length === 0) {
      router.push('/setup');
    }
  }, [status, players, router]);

  // Track game start
  useEffect(() => {
    if (status === 'playing' && players.length > 0 && !gameStartTracked.current) {
      recordGamePlayed();
      gameStartTracked.current = true;
    }
  }, [status, players]);

  // Track game win
  useEffect(() => {
    if (status === 'finished' && winnerSessionId && !gameWinTracked.current) {
      recordGameWon();
      gameWinTracked.current = true;
    }
  }, [status, winnerSessionId]);

  // Show loading while checking
  if (status === 'setup' || players.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-100 to-green-200 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show game over screen if finished
  if (status === 'finished') {
    return <GameOverScreen />;
  }

  // Show game board
  return <GameBoard />;
}
