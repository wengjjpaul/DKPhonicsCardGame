// Online game room page - lobby and game play
'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { Button, Input, SuitPicker } from '@/components/ui';
import { PhonicsCard, ActionCard } from '@/components/cards';
import { Card, isActionCard, isPhonicsCard } from '@/types/card';
import { generateFunName, getNameEmoji } from '@/lib/names';

// Helper component to render the correct card type
function GameCard({ card, size = 'md', ...props }: { card: Card; size?: 'sm' | 'md' | 'lg'; selected?: boolean; playable?: boolean; onClick?: () => void }) {
  if (isPhonicsCard(card)) {
    return <PhonicsCard card={card} size={size} {...props} />;
  }
  if (isActionCard(card)) {
    return <ActionCard card={card} size={size} {...props} />;
  }
  return null;
}
import { cn } from '@/lib/utils';

type PageProps = {
  params: Promise<{ code: string }>;
};

export default function OnlineGameRoomPage({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [nameEmoji, setNameEmoji] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    game,
    isLoading,
    error,
    isPlayer,
    isMyTurn,
    canPlayCard,
    mustDraw,
    joinGame,
    startGame,
    playCard,
    drawCard,
    leaveGame,
  } = useOnlineGame(code);

  // Generate a fun name
  const generateNewName = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const newName = generateFunName();
      setPlayerName(newName);
      setNameEmoji(getNameEmoji(newName));
      setIsGenerating(false);
    }, 150);
  }, []);

  // Show join form if not a player and game is waiting
  useEffect(() => {
    if (!isLoading && game && !isPlayer && game.status === 'waiting') {
      setShowJoinForm(true);
      // Generate initial name for joining player
      if (!playerName) {
        generateNewName();
      }
    }
  }, [isLoading, game, isPlayer, playerName, generateNewName]);

  // Handle browser/tab close to notify server
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery during page unload
      if (isPlayer && game?.status === 'playing') {
        navigator.sendBeacon(`/api/game/${code}/leave`, '');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [code, isPlayer, game?.status]);

  // Handle joining the game
  const handleJoin = async () => {
    if (!playerName.trim()) return;
    const result = await joinGame(playerName.trim());
    if (result.success) {
      setShowJoinForm(false);
    } else {
      setActionError(result.error || 'Failed to join');
    }
  };

  // Handle starting the game
  const handleStart = async () => {
    const result = await startGame();
    if (!result.success) {
      setActionError(result.error || 'Failed to start game');
    }
  };

  // Handle playing a card
  const handlePlayCard = async (declaredSuit?: string) => {
    if (!selectedCardId) return;
    
    const card = game?.currentPlayer?.hand.find(c => c.id === selectedCardId);
    
    // If it's a change card and no suit selected, show picker
    if (card && isActionCard(card) && card.action === 'change' && !declaredSuit) {
      setShowSuitPicker(true);
      return;
    }
    
    const result = await playCard(selectedCardId, declaredSuit);
    if (result.success) {
      setSelectedCardId(null);
      setShowSuitPicker(false);
    } else {
      setActionError(result.error || 'Failed to play card');
    }
  };

  // Handle drawing a card
  const handleDraw = async () => {
    const result = await drawCard();
    if (!result.success) {
      setActionError(result.error || 'Failed to draw card');
    }
  };

  // Handle leaving the game
  const handleLeave = async () => {
    await leaveGame();
    router.push('/online');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 p-4">
        <div className="container mx-auto max-w-md pt-12">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">
              {error || 'Game not found'}
            </h2>
            <Button onClick={() => router.push('/online')}>
              Back to Online Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Join form for non-players
  if (showJoinForm && !isPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 p-4">
        <div className="container mx-auto max-w-md pt-12">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Join Game
            </h2>
            <div className="text-center mb-6">
              <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-mono text-xl tracking-widest">
                {code}
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Name display with emoji */}
              <div className="text-center mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={playerName}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    {nameEmoji && (
                      <motion.span
                        className="text-5xl block mb-2"
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        {nameEmoji}
                      </motion.span>
                    )}
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
                    >
                      <span className="text-2xl font-bold">
                        {isGenerating ? '✨' : playerName || 'Your Name'}
                      </span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Regenerate button */}
              <motion.button
                onClick={generateNewName}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 
                          hover:from-purple-200 hover:to-pink-200 transition-all duration-300
                          text-purple-700 font-medium flex items-center justify-center gap-2
                          disabled:opacity-50 border-2 border-dashed border-purple-300
                          hover:border-purple-400 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  animate={isGenerating ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5, repeat: isGenerating ? Infinity : 0 }}
                  className="text-xl"
                >
                  🎲
                </motion.span>
                <span>Generate New Name</span>
                <motion.span
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✨
                </motion.span>
              </motion.button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or type your own</span>
                </div>
              </div>

              {/* Manual input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    setNameEmoji(null);
                  }}
                  placeholder="Enter your name"
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleJoin();
                  }}
                />
              </div>
              
              {actionError && (
                <motion.p 
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {actionError}
                </motion.p>
              )}
              
              <Button
                onClick={handleJoin}
                disabled={!playerName.trim()}
                className="w-full"
                size="lg"
              >
                Join Game 🎮
              </Button>
              
              <button
                onClick={() => router.push('/online')}
                className="w-full text-gray-500 hover:text-gray-700 py-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Waiting lobby
  if (game.status === 'waiting') {
    const isHost = game.currentPlayer?.isHost;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-indigo-600 p-4">
        <div className="container mx-auto max-w-md pt-8">
          {/* Game code */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/80 mb-2">Game Code</p>
            <div className="bg-white rounded-xl px-6 py-4 inline-block">
              <span className="text-4xl font-bold tracking-widest text-indigo-600">
                {game.code}
              </span>
            </div>
            <p className="text-white/80 mt-2 text-sm">
              Share this code with friends to join!
            </p>
          </motion.div>

          {/* Players list */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-gray-800 mb-4">
              Players ({game.players.length}/6)
            </h3>
            <div className="space-y-2">
              {game.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    player.isHost ? 'bg-yellow-50' : 'bg-gray-50'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="font-medium">
                    {player.name}
                    {player.isHost && ' 👑'}
                  </span>
                  <span
                    className={cn(
                      'text-sm px-2 py-1 rounded',
                      player.isConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {player.isConnected ? 'Ready' : 'Disconnected'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isHost && (
              <Button
                onClick={handleStart}
                disabled={game.players.length < 2}
                className="w-full"
                size="lg"
              >
                {game.players.length < 2
                  ? 'Need at least 2 players'
                  : 'Start Game 🚀'}
              </Button>
            )}
            
            {!isHost && (
              <div className="text-center text-white/80 p-4 bg-white/20 rounded-xl">
                Waiting for host to start the game...
              </div>
            )}
            
            {actionError && (
              <p className="text-red-200 text-sm text-center">{actionError}</p>
            )}
            
            <button
              onClick={handleLeave}
              className="w-full text-white/80 hover:text-white py-2"
            >
              Leave Game
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game finished
  if (game.status === 'finished') {
    const winner = game.players.find(p => p.id === game.winnerSessionId) ||
                   game.players.find((_, i) => game.players[i].cardCount === 0);
    
    // Check if game ended due to players leaving
    const connectedPlayers = game.players.filter(p => p.isConnected);
    const gameEndedDueToLeaving = connectedPlayers.length < 2 && game.players.length >= 2;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-orange-500 p-4">
        <div className="container mx-auto max-w-md pt-12">
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {gameEndedDueToLeaving ? '😢' : '🏆'}
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            {gameEndedDueToLeaving ? (
              <p className="text-lg text-gray-600 mb-6">
                {winner ? `${winner.name} wins by default - other players left the game` : 'Game ended - not enough players'}
              </p>
            ) : (
              <p className="text-xl text-indigo-600 font-bold mb-6">
                {winner?.name || 'Unknown'} wins!
              </p>
            )}
            
            <div className="space-y-3">
              <Button onClick={() => router.push('/online')} className="w-full">
                Back to Online Games
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game in progress
  const hand = game.currentPlayer?.hand || [];
  const playableCardIds = hand.filter(c => canPlayCard(c)).map(c => c.id);
  const disconnectedPlayers = game.players.filter(p => !p.isConnected);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      {/* Suit Picker Modal */}
      <SuitPicker
        isOpen={showSuitPicker}
        onSelect={(suit) => handlePlayCard(suit)}
        onClose={() => setShowSuitPicker(false)}
      />

      {/* Disconnected players banner */}
      {disconnectedPlayers.length > 0 && (
        <motion.div
          className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg mb-4 text-center text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {disconnectedPlayers.map(p => p.name).join(', ')} {disconnectedPlayers.length === 1 ? 'has' : 'have'} left the game
        </motion.div>
      )}

      {/* Top - Players */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {game.players.map((player) => (
            <motion.div
              key={player.id}
              className={cn(
                'px-3 py-2 rounded-lg text-sm',
                player.isCurrentTurn && player.isConnected
                  ? 'bg-yellow-400 text-yellow-900 font-bold'
                  : player.isConnected
                    ? 'bg-white/80 text-gray-700'
                    : 'bg-gray-300 text-gray-500 line-through',
                !player.isConnected && 'opacity-60'
              )}
              animate={player.isCurrentTurn && player.isConnected ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {player.name} ({player.cardCount})
              {player.isCurrentTurn && player.isConnected && ' 👈'}
              {!player.isConnected && ' (left)'}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Middle - Play area */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Current suit */}
        {game.currentSuit && (
          <motion.div
            className="bg-white rounded-xl p-3 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-2xl font-bold text-indigo-600">
              {game.currentSuit.toUpperCase()}
            </span>
          </motion.div>
        )}

        {/* Top card */}
        {game.topCard && (
          <div className="relative">
            <GameCard card={game.topCard} size="lg" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              {game.playPileCount} cards
            </span>
          </div>
        )}

        {/* Draw pile */}
        <motion.button
          className={cn(
            'w-20 h-28 rounded-xl shadow-lg flex items-center justify-center',
            'bg-gradient-to-br from-blue-600 to-blue-800',
            mustDraw && isMyTurn ? 'ring-4 ring-yellow-400' : ''
          )}
          onClick={handleDraw}
          disabled={!mustDraw || !isMyTurn}
          whileHover={mustDraw && isMyTurn ? { scale: 1.05 } : {}}
          whileTap={mustDraw && isMyTurn ? { scale: 0.98 } : {}}
        >
          <span className="text-white text-sm font-bold">
            Draw
            <br />({game.drawPileCount})
          </span>
        </motion.button>
      </div>

      {/* Turn indicator */}
      <motion.div
        className={cn(
          'text-center mb-4 py-2 px-4 rounded-lg mx-auto max-w-xs',
          isMyTurn ? 'bg-yellow-400 text-yellow-900' : 'bg-white/80 text-gray-600'
        )}
        animate={isMyTurn ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {isMyTurn ? "🎯 Your turn!" : `Waiting for ${game.players[game.currentPlayerIndex]?.name}...`}
      </motion.div>

      {/* Player's hand */}
      <div className="mt-4">
        <div className="flex flex-wrap justify-center gap-2">
          {hand.map((card) => (
            <motion.div
              key={card.id}
              className={cn(
                'cursor-pointer transition-transform',
                selectedCardId === card.id && 'ring-4 ring-yellow-400 rounded-xl',
                !playableCardIds.includes(card.id) && isMyTurn && 'opacity-50'
              )}
              onClick={() => isMyTurn && setSelectedCardId(card.id)}
              whileHover={isMyTurn ? { y: -10 } : {}}
              whileTap={isMyTurn ? { scale: 0.95 } : {}}
            >
              <GameCard card={card} size="md" />
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        {isMyTurn && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => handlePlayCard()}
              disabled={!selectedCardId || !playableCardIds.includes(selectedCardId)}
              size="lg"
            >
              Play Card
            </Button>
            {mustDraw && (
              <Button onClick={handleDraw} variant="secondary" size="lg">
                Draw Card
              </Button>
            )}
          </div>
        )}

        {actionError && (
          <p className="text-red-500 text-center mt-4">{actionError}</p>
        )}
      </div>

      {/* Leave button */}
      <div className="text-center mt-8">
        <button
          onClick={handleLeave}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
}
