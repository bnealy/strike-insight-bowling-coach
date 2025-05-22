
import React, { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import BowlingGame from './BowlingGame';
import PinButtons from './PinButtons';
import { useBowlingGame } from '../hooks/useBowlingGame';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
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

  const handleSaveGames = () => {
    if (!isAuthenticated) return;
    
    const result = saveGames(games);
    if (result.success) {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } else {
      alert('Error saving games: ' + result.error);
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
      
      {showSaveSuccess && (
        <div style={cssProps({
          background: '#4CAF50',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '1.1em'
        })}>
          ✅ Games saved successfully!
        </div>
      )}
      
      <div style={cssProps({ textAlign: 'center', color: 'white', marginBottom: '30px' })}>
        <h1 style={cssProps({ fontSize: '2.5em', marginBottom: '10px' })}>Bowling Score Calculator</h1>
        <p>Enter your pins knocked down for each ball</p>
      </div>
      
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
      
      <div style={cssProps({
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        textAlign: 'center'
      })}>
        {(!gameComplete || editingFrame !== null) && (
          <>
            <div style={cssProps({
              color: 'white',
              marginBottom: '20px',
              fontSize: '1.2em'
            })}>
              {editingFrame !== null && editingBall !== null ? (
                <>
                  Editing Game {games.findIndex(g => g.id === activeGameId) + 1}, Frame {editingFrame + 1}, Ball {editingBall + 1}
                  <button 
                    onClick={cancelEdit}
                    style={cssProps({
                      marginLeft: '15px',
                      padding: '5px 10px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    })}
                  >
                    Cancel Edit
                  </button>
                </>
              ) : gameComplete ? (
                "Click any ball to edit"
              ) : (
                `Game ${games.findIndex(g => g.id === activeGameId) + 1} - Frame ${currentFrame + 1}, Ball ${currentBall + 1}`
              )}
            </div>
            
            <PinButtons
              activeFrame={editingFrame !== null ? editingFrame : currentFrame}
              activeBall={editingBall !== null ? editingBall : currentBall}
              frames={frames}
              enterPins={enterPins}
            />
          </>
        )}
        
        <div style={cssProps({ display: 'flex', gap: '10px', justifyContent: 'center' })}>
          {games.length < 2 && (
            <button 
              onClick={addAnotherGame}
              style={cssProps({
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: 'pointer'
              })}
            >
              Add Another Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BowlingScorecard;
