
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import SaveGameAlert from './alerts/SaveGameAlert';
import { useBowlingGame } from '../hooks/useBowlingGame';
import { useToast } from "@/hooks/use-toast";
import { FlowState, BowlingFlowStep } from '@/types/flowTypes';

import WelcomeScreen from './flow/WelcomeScreen';
import GameCountSelector from './flow/GameCountSelector';
import GameEntryScreen from './flow/GameEntryScreen';

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Flow state management
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
    clearGame,
    handleBallClick,
    cancelEdit,
    hasUnsavedGames,
    addSession,
    markSessionAsSaved,
    toggleSessionVisibility,
    toggleGameVisibility,
    renameSession,
    updateUserStats
  } = useBowlingGame();
  
  // Navigation handlers for the flow
  const handleNextStep = (nextStep: BowlingFlowStep) => {
    // If moving from welcome to gameCount and no session exists, create one
    if (nextStep === 'gameCount' && flowState.currentStep === 'welcome') {
      if (sessions.filter(s => s.isVisible).length === 0) {
        addSession();
      }
    }
    
    // If moving to gameEntry, ensure we have the right number of games
    if (nextStep === 'gameEntry' && flowState.currentStep === 'gameCount') {
      // Add games until we reach the desired count
      const visibleGames = activeSession?.games.filter(g => g.isVisible) || [];
      const gamesNeeded = flowState.gameCount - visibleGames.length;
      
      for (let i = 0; i < gamesNeeded; i++) {
        addGameToSession();
      }
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
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your games.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      setSaveError(null);
      console.info("Attempting to save games for user:", isAuthenticated);
      
      // Filter out sessions with no games or games with no total score
      const validSessions = sessions.filter(s => {
        return s.isVisible && s.games.some(g => g.isVisible && g.totalScore !== null);
      });
      
      if (validSessions.length === 0) {
        setSaveError("No valid games to save. Please complete at least one game.");
        toast({
          title: "Error",
          description: "No valid games to save. Please complete at least one game.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      const result = await saveGames(validSessions);
      
      if (result.success) {
        setShowSaveSuccess(true);
        markSessionAsSaved(activeSessionId);
        toast({
          title: "Success",
          description: "Games saved successfully!",
          duration: 3000,
        });
        
        // Update user statistics with completed games
        const completedGames = validSessions.flatMap(s => 
          s.games.filter(g => g.isVisible && g.gameComplete && g.totalScore != null)
        );
        await updateUserStats(completedGames);
        
        setTimeout(() => setShowSaveSuccess(false), 5000);
        
        // After successful save, return to welcome step for a fresh start
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

  return (
    <div className="max-w-[1200px] mx-auto p-5 min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 font-sans">
      <Header onSaveGames={handleSaveGames} hasUnsavedGames={isAuthenticated && hasUnsavedGames} />
      
      <SaveGameAlert 
        showSuccess={showSaveSuccess} 
        errorMessage={saveError} 
      />
      
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
        />
      )}
    </div>
  );
};

export default BowlingScorecard;
