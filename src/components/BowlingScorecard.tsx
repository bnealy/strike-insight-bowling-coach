import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import AuthModal from './AuthModal';
import SaveGameAlert from './alerts/SaveGameAlert';
import SignInRequiredDialog from './alerts/SignInRequiredDialog';
import { useBowlingGame } from '../hooks/useBowlingGame';
import { useUserStats } from '@/hooks/useUserStats';
import { useToast } from "@/hooks/use-toast";
import { FlowState, BowlingFlowStep } from '@/types/flowTypes';
import BowlingGame from './BowlingGame';
import GameEditorPanel from './GameEditorPanel';

import WelcomeScreen from './flow/WelcomeScreen';
import GameCountSelector from './flow/GameCountSelector';
import GameEntryScreen from './flow/GameEntryScreen';

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();
  const { updateUserStats } = useUserStats();
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Flow state management (only for authenticated users)
  const [flowState, setFlowState] = useState<FlowState>({
    currentStep: 'welcome',
    gameCount: 1
  });
  
  const {
    sessions,
    activeSessionId,
    activeGameId,
    activeSession,
    setActiveSessionId,
    setActiveGameId,
    enterPins,
    addGameToSession,
    setupGamesForSession,
    clearGame,
    handleBallClick,
    cancelEdit,
    hasUnsavedGames,
    addSession,
    markSessionAsSaved,
    toggleSessionVisibility,
    toggleGameVisibility,
    renameSession,
    updateActiveGame,
    deleteGame
  } = useBowlingGame();
  
  // Navigation handlers for the flow (only for authenticated users)
  const handleNextStep = (nextStep: BowlingFlowStep) => {
    if (nextStep === 'gameCount' && flowState.currentStep === 'welcome') {
      if (sessions.filter(s => s.isVisible).length === 0) {
        addSession();
      }
    }
    
    if (nextStep === 'gameEntry' && flowState.currentStep === 'gameCount') {
      console.log('Transitioning to game entry with game count:', flowState.gameCount);
      // Use the new function to set up the exact number of games
      setupGamesForSession(flowState.gameCount);
    }
    
    setFlowState(prev => ({ ...prev, currentStep: nextStep }));
  };
  
  const handlePreviousStep = (prevStep: BowlingFlowStep) => {
    setFlowState(prev => ({ ...prev, currentStep: prevStep }));
  };
  
  const handleGameCountChange = (count: number) => {
    setFlowState(prev => ({ ...prev, gameCount: count }));
  };

  const handleSaveGames = async () => {
    if (!isAuthenticated) {
      setShowSignInDialog(true);
      return;
    }
    
    try {
      setSaveError(null);
      console.info("Attempting to save games for user:", isAuthenticated);
      
      // DEBUG: Log the current state before filtering
      console.log('=== SAVE DEBUG START ===');
      console.log('Original flowState.gameCount:', flowState.gameCount);
      console.log('All sessions:', sessions.map(s => ({ 
        id: s.id, 
        title: s.title, 
        isVisible: s.isVisible, 
        totalGames: s.games.length,
        visibleGames: s.games.filter(g => g.isVisible).length,
        gameDetails: s.games.map(g => ({ id: g.id, isVisible: g.isVisible, totalScore: g.totalScore }))
      })));
      
      // Get sessions that are visible and have at least one visible game
      const validSessions = sessions.filter(s => {
        const hasVisibleGames = s.isVisible && s.games.some(g => g.isVisible);
        console.log('Session validation:', s.title, 'visible:', s.isVisible, 'hasVisibleGames:', hasVisibleGames, 'gameCount:', s.games.filter(g => g.isVisible).length);
        return hasVisibleGames;
      });
      
      if (validSessions.length === 0) {
        setSaveError("No sessions with games to save.");
        toast({
          title: "Error",
          description: "No sessions with games to save.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      console.log('Valid sessions to save:', validSessions.map(s => ({ title: s.title, gameCount: s.games.filter(g => g.isVisible).length })));
      console.log('=== SAVE DEBUG END ===');
      
      const result = await saveGames(validSessions);
      
      if (result.success) {
        setShowSaveSuccess(true);
        markSessionAsSaved(activeSessionId);
        toast({
          title: "Success",
          description: "Games saved successfully!",
          duration: 3000,
        });
        
        const completedGames = validSessions.flatMap(s => 
          s.games.filter(g => g.isVisible && g.gameComplete && g.totalScore != null)
        );
        await updateUserStats(completedGames);
        
        setTimeout(() => setShowSaveSuccess(false), 5000);
        
        setFlowState({ currentStep: 'welcome', gameCount: 1 });
      } else {
        setSaveError(result.error || 'Unknown error saving games');
        toast({
          title: "Error",
          description: result.error || "Failed to save games. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch (error: any) {
      console.error('Error in handleSaveGames:', error);
      setSaveError(error.message || 'Unexpected error saving games');
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving games.",
        variant: "destructive",
        duration: 3000,
      });
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  // Handle delete for non-authenticated users
  const handleDeleteGame = (gameId: number) => {
    deleteGame(activeSessionId, gameId);
    
    // If we deleted the active game, find another game to make active
    const remainingGames = activeSession?.games.filter(g => g.isVisible && g.id !== gameId) || [];
    if (remainingGames.length > 0 && gameId === activeGameId) {
      setActiveGameId(remainingGames[0].id);
    }
  };

  // Find the active game for non-authenticated users
  const activeGame = activeSession?.games.find(game => game.id === activeGameId);
  const visibleGames = activeSession?.games.filter(game => game.isVisible) || [];
  const activeGameIndex = visibleGames.findIndex(g => g.id === activeGameId);

  const handleOpenAuthModal = () => {
    setShowSignInDialog(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-5 min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 font-sans">
      <Header 
        onSaveGames={handleSaveGames} 
        hasUnsavedGames={hasUnsavedGames} 
        onAddGame={addGameToSession}
        isAuthenticated={isAuthenticated}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />
      
      <SaveGameAlert 
        showSuccess={showSaveSuccess} 
        errorMessage={saveError} 
      />
      
      <SignInRequiredDialog 
        isOpen={showSignInDialog} 
        onClose={() => setShowSignInDialog(false)} 
        onSignIn={handleOpenAuthModal}
      />
      
      {isAuthenticated ? (
        // Show flow for authenticated users
        <>
          {flowState.currentStep === 'welcome' && (
            <WelcomeScreen onNext={handleNextStep} />
          )}
          
          {flowState.currentStep === 'gameCount' && (
            <GameCountSelector 
              gameCount={flowState.gameCount}
              onGameCountChange={handleGameCountChange}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
          
          {flowState.currentStep === 'gameEntry' && activeSession && (
            <GameEntryScreen 
              gameCount={flowState.gameCount}
              activeSession={activeSession}
              activeSessionId={activeSessionId}
              activeGameId={activeGameId}
              games={activeSession.games}
              setActiveGameId={setActiveGameId}
              clearGame={clearGame}
              handleBallClick={handleBallClick}
              toggleGameVisibility={toggleGameVisibility}
              enterPins={enterPins}
              cancelEdit={cancelEdit}
              addGameToSession={addGameToSession}
              onBack={handlePreviousStep}
              hasUnsavedGames={hasUnsavedGames}
              onSaveGames={handleSaveGames}
            />
          )}
        </>
      ) : (
        // Show original simple interface for non-authenticated users
        <div className="w-full">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {activeSession?.title || "New Session"}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={addGameToSession}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
                >
                  Add Another Game
                </button>
                
                <button
                  onClick={handleSaveGames}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
                >
                  Save Games
                </button>
              </div>
            </div>
            
            {visibleGames.map((game, index) => (
              <BowlingGame
                key={game.id}
                game={game}
                isActive={game.id === activeGameId}
                gameIndex={index}
                setActiveGameId={setActiveGameId}
                clearGame={() => clearGame(activeSessionId, game.id)}
                handleBallClick={(frameIndex, ballIndex) => {
                  setActiveGameId(game.id);
                  handleBallClick(frameIndex, ballIndex);
                }}
                toggleVisibility={() => toggleGameVisibility(activeSessionId, game.id)}
                savedStatus={false}
                isAuthenticated={isAuthenticated}
                onDeleteGame={() => handleDeleteGame(game.id)}
              />
            ))}
            
            {visibleGames.length === 0 && (
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center text-white">
                <p>No games in this session. Add a game to get started.</p>
              </div>
            )}
          </div>
          
          {activeGame && (
            <GameEditorPanel
              gameIndex={activeGameIndex}
              currentFrame={activeGame.currentFrame || 0}
              currentBall={activeGame.currentBall || 0}
              frames={activeGame.frames || []}
              editingFrame={activeGame.editingFrame}
              editingBall={activeGame.editingBall}
              gameComplete={activeGame.gameComplete || false}
              enterPins={enterPins}
              cancelEdit={cancelEdit}
            />
          )}
        </div>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default BowlingScorecard;
