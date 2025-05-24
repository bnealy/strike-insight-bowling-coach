
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import AuthModal from './AuthModal';
import SaveGameAlert from './alerts/SaveGameAlert';
import SignInRequiredDialog from './alerts/SignInRequiredDialog';
import AuthenticatedBowlingFlow from './AuthenticatedBowlingFlow';
import GuestBowlingInterface from './GuestBowlingInterface';
import { useGameManagement } from '../hooks/useGameManagement';

const BowlingScorecard = () => {
  const { isAuthenticated } = useAuth();
  const gameManagement = useGameManagement();

  const handleDeleteGame = (gameId: number) => {
    gameManagement.deleteGame(gameManagement.activeSessionId, gameId);
    
    const remainingGames = gameManagement.activeSession?.games.filter(g => g.isVisible && g.id !== gameId) || [];
    if (remainingGames.length > 0 && gameId === gameManagement.activeGameId) {
      gameManagement.setActiveGameId(remainingGames[0].id);
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
        showSuccess={gameManagement.showSaveSuccess} 
        errorMessage={gameManagement.saveError} 
      />
      
      <SignInRequiredDialog 
        isOpen={gameManagement.showSignInDialog} 
        onClose={() => gameManagement.setShowSignInDialog(false)} 
        onSignIn={gameManagement.handleOpenAuthModal}
      />
      
      {isAuthenticated ? (
        <AuthenticatedBowlingFlow
          flowState={gameManagement.flowState}
          activeSession={gameManagement.activeSession}
          activeSessionId={gameManagement.activeSessionId}
          activeGameId={gameManagement.activeGameId}
          onNextStep={gameManagement.handleNextStep}
          onPreviousStep={gameManagement.handlePreviousStep}
          onGameCountChange={gameManagement.handleGameCountChange}
          setActiveGameId={gameManagement.setActiveGameId}
          clearGame={gameManagement.clearGame}
          handleBallClick={gameManagement.handleBallClick}
          toggleGameVisibility={gameManagement.toggleGameVisibility}
          enterPins={gameManagement.enterPins}
          cancelEdit={gameManagement.cancelEdit}
          addGameToSession={gameManagement.addGameToSession}
          hasUnsavedGames={gameManagement.hasUnsavedGames}
          onSaveGames={gameManagement.handleSaveGames}
        />
      ) : (
        <GuestBowlingInterface
          activeSession={gameManagement.activeSession}
          activeGameId={gameManagement.activeGameId}
          addGameToSession={gameManagement.addGameToSession}
          onSaveGames={gameManagement.handleSaveGames}
          setActiveGameId={gameManagement.setActiveGameId}
          clearGame={gameManagement.clearGame}
          handleBallClick={gameManagement.handleBallClick}
          toggleGameVisibility={gameManagement.toggleGameVisibility}
          onDeleteGame={handleDeleteGame}
          enterPins={gameManagement.enterPins}
          cancelEdit={gameManagement.cancelEdit}
          activeSessionId={gameManagement.activeSessionId}
        />
      )}
      
      <AuthModal 
        isOpen={gameManagement.isAuthModalOpen} 
        onClose={() => gameManagement.setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default BowlingScorecard;
