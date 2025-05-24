
import { useState } from 'react';
import { useBowlingGame } from './useBowlingGame';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from './useUserStats';
import { useToast } from "@/hooks/use-toast";
import { FlowState, BowlingFlowStep } from '@/types/flowTypes';

export const useGameManagement = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();
  const { updateUserStats } = useUserStats();
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [flowState, setFlowState] = useState<FlowState>({
    currentStep: 'welcome',
    gameCount: 1
  });
  
  const bowlingGame = useBowlingGame();

  const handleNextStep = (nextStep: BowlingFlowStep) => {
    if (nextStep === 'gameCount' && flowState.currentStep === 'welcome') {
      if (bowlingGame.sessions.filter(s => s.isVisible).length === 0) {
        bowlingGame.addSession();
      }
    }
    
    if (nextStep === 'gameEntry' && flowState.currentStep === 'gameCount') {
      console.log('Transitioning to game entry with game count:', flowState.gameCount);
      bowlingGame.setupGamesForSession(flowState.gameCount);
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
      
      console.log('=== SAVE DEBUG START ===');
      console.log('Original flowState.gameCount:', flowState.gameCount);
      console.log('All sessions:', bowlingGame.sessions.map(s => ({ 
        id: s.id, 
        title: s.title, 
        isVisible: s.isVisible, 
        totalGames: s.games.length,
        visibleGames: s.games.filter(g => g.isVisible).length,
        gameDetails: s.games.map(g => ({ 
          id: g.id, 
          isVisible: g.isVisible, 
          totalScore: g.totalScore,
          hasFrames: !!g.frames,
          frameCount: g.frames?.length || 0
        }))
      })));
      
      const validSessions = bowlingGame.sessions.filter(s => {
        const hasVisibleGames = s.isVisible && s.games.some(g => g.isVisible);
        console.log('Session validation:', s.title, 'visible:', s.isVisible, 'hasVisibleGames:', hasVisibleGames, 'gameCount:', s.games.filter(g => g.isVisible).length);
        return hasVisibleGames;
      }).map(session => ({
        ...session,
        games: session.games.filter(g => g.isVisible).map(game => ({
          ...game,
          frames: game.frames || []
        }))
      }));
      
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
      
      console.log('Valid sessions to save:', validSessions.map(s => ({ 
        title: s.title, 
        gameCount: s.games.length,
        gamesWithFrames: s.games.filter(g => g.frames && g.frames.length > 0).length
      })));
      console.log('=== SAVE DEBUG END ===');
      
      const result = await saveGames(validSessions);
      
      if (result.success) {
        setShowSaveSuccess(true);
        bowlingGame.markSessionAsSaved(bowlingGame.activeSessionId);
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

  const handleOpenAuthModal = () => {
    setShowSignInDialog(false);
    setIsAuthModalOpen(true);
  };

  return {
    ...bowlingGame,
    flowState,
    showSaveSuccess,
    saveError,
    showSignInDialog,
    isAuthModalOpen,
    handleNextStep,
    handlePreviousStep,
    handleGameCountChange,
    handleSaveGames,
    handleOpenAuthModal,
    setShowSignInDialog,
    setIsAuthModalOpen
  };
};
