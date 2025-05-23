
import React, { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import BowlingGame from './BowlingGame';
import SaveGameAlert from './alerts/SaveGameAlert';
import PageHeader from './PageHeader';
import GameEditorPanel from './GameEditorPanel';
import { useBowlingGame } from '../hooks/useBowlingGame';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const {
    games,
    activeGameId,
    activeGame,
    setActiveGameId,
    enterPins,
    addAnotherGame,
    clearGame,
    handleBallClick,
    cancelEdit,
    hasUnsavedGames
  } = useBowlingGame();
  
  const { frames, currentFrame, currentBall, gameComplete, editingFrame, editingBall } = activeGame;
  const activeGameIndex = games.findIndex(g => g.id === activeGameId);

  const handleSaveGames = async () => {
    if (!isAuthenticated) return;
    
    try {
      setSaveError(null);
      const result = await saveGames(games);
      if (result.success) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 5000);
      } else {
        setSaveError(result.error || 'Unknown error saving games');
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch (error) {
      console.error('Error in handleSaveGames:', error);
      setSaveError('Unexpected error saving games');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  return (
    <div style={cssProps({ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    })}>
      <Header onSaveGames={handleSaveGames} hasUnsavedGames={isAuthenticated && hasUnsavedGames} />
      
      <SaveGameAlert 
        showSuccess={showSaveSuccess} 
        errorMessage={saveError} 
      />
      
      <PageHeader 
        title="Bowling Score Calculator" 
        subtitle="Enter your pins knocked down for each ball" 
      />
      
      {games.map((game, gameIndex) => (
        <BowlingGame
          key={game.id}
          game={game}
          isActive={game.id === activeGameId}
          gameIndex={gameIndex}
          setActiveGameId={setActiveGameId}
          clearGame={clearGame}
          handleBallClick={(frameIndex, ballIndex) => {
            setActiveGameId(game.id);
            handleBallClick(frameIndex, ballIndex);
          }}
        />
      ))}
      
      <GameEditorPanel
        gameIndex={activeGameIndex}
        currentFrame={currentFrame}
        currentBall={currentBall}
        frames={frames}
        editingFrame={editingFrame}
        editingBall={editingBall}
        gameComplete={gameComplete}
        enterPins={enterPins}
        cancelEdit={cancelEdit}
        addAnotherGame={addAnotherGame}
        gameCount={games.length}
      />
    </div>
  );
};

export default BowlingScorecard;
