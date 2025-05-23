
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import BowlingGame from './BowlingGame';
import SaveGameAlert from './alerts/SaveGameAlert';
import PageHeader from './PageHeader';
import GameEditorPanel from './GameEditorPanel';
import { useBowlingGame } from '../hooks/useBowlingGame';
import SessionManager from './SessionManager';
import { useToast } from "@/hooks/use-toast";

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    sessions,
    activeSessionId,
    activeGameId,
    activeSession,
    activeGame,
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
    renameSession
  } = useBowlingGame();
  
  // Destructure the active game properties for easier access
  const { frames, currentFrame, currentBall, gameComplete, editingFrame, editingBall } = activeGame || {};
  
  // Find the index of the active game in the active session
  const visibleGames = activeSession?.games.filter(game => game.isVisible) || [];
  const activeGameIndex = visibleGames.findIndex(g => g.id === activeGameId);

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
        setTimeout(() => setShowSaveSuccess(false), 5000);
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
      
      <PageHeader 
        title="Bowling Score Calculator" 
        subtitle="Track and save your bowling scores" 
      />
      
      <SessionManager 
        sessions={sessions.filter(s => s.isVisible)}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        addSession={addSession}
        renameSession={renameSession}
        toggleVisibility={toggleSessionVisibility}
      />
      
      {activeSession && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeSession.title}
            {activeSession.savedToDatabase && (
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                Saved
              </span>
            )}
          </h2>
          
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
              savedStatus={activeSession.savedToDatabase}
            />
          ))}
          
          {visibleGames.length === 0 && (
            <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center text-white">
              <p>No visible games in this session. Add a game to get started.</p>
            </div>
          )}
          
          <button 
            onClick={() => addGameToSession()}
            className="mt-4 bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
          >
            Add New Game
          </button>
        </div>
      )}
      
      {activeGame && (
        <GameEditorPanel
          gameIndex={activeGameIndex}
          currentFrame={currentFrame || 0}
          currentBall={currentBall || 0}
          frames={frames || []}
          editingFrame={editingFrame}
          editingBall={editingBall}
          gameComplete={gameComplete || false}
          enterPins={enterPins}
          cancelEdit={cancelEdit}
          addAnotherGame={addGameToSession}
          gameCount={visibleGames.length}
        />
      )}
    </div>
  );
};

export default BowlingScorecard;
