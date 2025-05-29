import { useState } from 'react';
import { useBowlingGame } from './useBowlingGame';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

export const useGameManagement = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  // Add these functions to your useGameManagement hook if they don't exist:

const deleteGame = (gameId: number) => {
  // Remove game from current session
  // Update state accordingly
};

const updateGameScore = (gameId: number, totalScore: number) => {
  // Update specific game's total score
  // Mark game as complete
};
  
  const bowlingGame = useBowlingGame();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSaveGames = async () => {
    if (!isAuthenticated) {
      setShowSignInDialog(true);
      return;
    }
    
    try {
      setSaveError(null);
      console.log('Attempting to save games...');
      
      const visibleSessions = bowlingGame.sessions.filter(s => s.isVisible);
      
      if (visibleSessions.length === 0) {
        setSaveError("No sessions to save.");
        toast({
          title: "Error",
          description: "No sessions to save.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await bowlingGame.saveSessionsToDatabase(visibleSessions, bowlingGame.markSessionAsSaved);
      
      toast({
        title: "Success",
        description: "Games saved successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving games:', error);
      setSaveError(error instanceof Error ? error.message : "An error occurred while saving games");
      toast({
        title: "Error",
        description: "Failed to save games. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    ...bowlingGame,
    handleSaveGames,
    saveError,
    isAuthModalOpen,
    setIsAuthModalOpen,
    showSignInDialog,
    setShowSignInDialog,
    hasUnsavedGames: bowlingGame.sessions.some(s => !s.savedToDatabase && s.isVisible)
  };
};
