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
        gameCount={1}
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
        addGameToSession={gameManagement.addGameToSession}
        hasUnsavedGames={gameManagement.hasUnsavedGames}
        onSaveGames={gameManagement.handleSaveGames}
        onBack={() => {}}
        updateGameFrames={updateGameFrames}
        // Add the missing props for saving functionality
        sessions={gameManagement.sessions || []}
        markSessionAsSaved={gameManagement.markSessionAsSaved}
      />
      
      <AuthModal
        isOpen={gameManagement.isAuthModalOpen}
        onClose={() => gameManagement.setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default BowlingScorecard;