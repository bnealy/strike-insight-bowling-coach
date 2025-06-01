import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameManagement } from '../hooks/useGameManagement';
import Header from './Header';
import AuthModal from './AuthModal';
import SignInRequiredDialog from './alerts/SignInRequiredDialog';
import SaveGameAlert from './alerts/SaveGameAlert';
import GameEntryScreen from './flow/GameEntryScreen';

const BowlingScorecard = () => {
  const { isAuthenticated } = useAuth();
  const gameManagement = useGameManagement();

  const updateGameFrames = (gameId: number, frames: any[], totalScore: number) => {
    console.log('🔄 Updating game frames via parent:', { gameId, totalScore });
    // Use the actual updateActiveGame function from gameManagement
    gameManagement.updateActiveGame({
      frames: frames,
      totalScore: totalScore,
      gameComplete: frames.every(frame => frame.score !== null)
    });
  };

  // New function to handle adding games - maps to existing functionality
  const handleAddNewGame = (sessionId: number) => {
    console.log('🎮 Adding new game to session:', sessionId);
    gameManagement.addGameToSession();
  };

  // New function to handle deleting games
  const handleDeleteGame = (sessionId: number, gameId: number) => {
    console.log('🗑️ Deleting game:', { sessionId, gameId });
    // You may need to add this to useGameManagement hook if it doesn't exist
    if (gameManagement.deleteGame) {
      gameManagement.deleteGame(gameId);
    } else {
      console.warn('Delete game functionality not implemented in useGameManagement');
      // Fallback: you might need to implement this in the hook
    }
  };

  // New function to handle updating just the final score
  const handleUpdateGameScore = (gameId: number, totalScore: number) => {
    console.log('📊 Updating game score:', { gameId, totalScore });
    
    // Find the game and create minimal frames structure for final score
    const games = gameManagement.activeSession?.games || [];
    const targetGame = games.find(game => game.id === gameId);
    
    if (targetGame) {
      // Create empty frames structure but set the total score
      const emptyFrames = targetGame.frames.map(frame => ({
        ...frame,
        // Keep existing frame data if any, otherwise create empty structure
        balls: frame.balls.some(ball => ball !== null) ? frame.balls : [null, null, null],
        score: null // We're only setting total score, not frame-by-frame
      }));
      
      // Use existing updateActiveGame but with just the total score
      if (gameManagement.setActiveGameId) {
        gameManagement.setActiveGameId(gameId);
      }
      
      // You might need to add a specific method for this in useGameManagement
      if (gameManagement.updateGameScore) {
        gameManagement.updateGameScore(gameId, totalScore);
      } else {
        // Fallback: update via updateActiveGame
        gameManagement.updateActiveGame({
          frames: emptyFrames,
          totalScore: totalScore,
          gameComplete: true // Mark as complete since we have final score
        });
      }
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-5 min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 font-sans">
      <Header
        onSaveGames={gameManagement.handleSaveGames}
        hasUnsavedGames={gameManagement.hasUnsavedGames}
        onAddGame={gameManagement.addGameToSession}
        isAuthenticated={isAuthenticated}
        setIsAuthModalOpen={gameManagement.setIsAuthModalOpen}
      />

      <SaveGameAlert
        showSuccess={false}
        errorMessage={gameManagement.saveError}
      />

      <SignInRequiredDialog
        isOpen={gameManagement.showSignInDialog}
        onClose={() => gameManagement.setShowSignInDialog(false)}
        onSignIn={() => gameManagement.setIsAuthModalOpen(true)}
      />

      <GameEntryScreen
        // Existing props
        gameCount={gameManagement.activeSession?.games?.length || 1}
        activeSession={gameManagement.activeSession}
        activeSessionId={gameManagement.activeSessionId}
        activeGameId={gameManagement.activeGameId}
        games={gameManagement.activeSession?.games || []}
        activeGame={gameManagement.activeGame}
        setActiveGameId={gameManagement.setActiveGameId}
        clearGame={gameManagement.clearGame}
        handleBallClick={gameManagement.handleBallClick}
        toggleGameVisibility={gameManagement.toggleGameVisibility}
        enterPins={gameManagement.enterPins}
        cancelEdit={gameManagement.cancelEdit}
        onBack={() => {}}
        updateGameFrames={updateGameFrames}
        sessions={gameManagement.sessions || []}
        markSessionAsSaved={gameManagement.markSessionAsSaved}
        updateActiveGame={gameManagement.updateActiveGame}
        
        // New props for multiple game functionality
        addNewGame={handleAddNewGame}
        deleteGame={handleDeleteGame}
        updateGameScore={handleUpdateGameScore}
      />

      <AuthModal
        isOpen={gameManagement.isAuthModalOpen}
        onClose={() => gameManagement.setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default BowlingScorecard;