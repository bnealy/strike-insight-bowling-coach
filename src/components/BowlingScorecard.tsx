import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const BowlingScorecard = () => {
  const { saveGames, isAuthenticated } = useAuth();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [games, setGames] = useState(() => [
    {
      id: 1,
      frames: (() => {
        const initialFrames = [];
        for (let i = 0; i < 10; i++) {
          if (i === 9) {
            initialFrames.push({ balls: [null, null, null], score: null });
          } else {
            initialFrames.push({ balls: [null, null], score: null });
          }
        }
        return initialFrames;
      })(),
      currentFrame: 0,
      currentBall: 0,
      totalScore: 0,
      gameComplete: false,
      editingFrame: null,
      editingBall: null
    }
  ]);

  const [activeGameId, setActiveGameId] = useState(1);

  const activeGame = games.find(game => game.id === activeGameId);
  const frames = activeGame.frames;
  const currentFrame = activeGame.currentFrame;
  const currentBall = activeGame.currentBall;
  const totalScore = activeGame.totalScore;
  const gameComplete = activeGame.gameComplete;
  const editingFrame = activeGame.editingFrame;
  const editingBall = activeGame.editingBall;

  const updateActiveGame = (updates) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === activeGameId 
          ? { ...game, ...updates }
          : game
      )
    );
  };

  useEffect(() => {
    calculateScoresForGame(activeGameId);
  }, [games, activeGameId]);

  const isStrike = (frameIndex, gameFrames = frames) => {
    return gameFrames[frameIndex].balls[0] === 10;
  };

  const isSpare = (frameIndex, gameFrames = frames) => {
    if (frameIndex === 9) return false;
    return !isStrike(frameIndex, gameFrames) && 
           gameFrames[frameIndex].balls[0] + gameFrames[frameIndex].balls[1] === 10;
  };

  const getNextTwoBalls = (frameIndex, gameFrames = frames) => {
    if (frameIndex >= 9) return [0, 0];
    
    const nextFrame = gameFrames[frameIndex + 1];
    if (isStrike(frameIndex + 1, gameFrames)) {
      if (frameIndex + 1 === 9) {
        return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
      } else {
        const frameAfterNext = gameFrames[frameIndex + 2];
        return [nextFrame.balls[0] || 0, frameAfterNext?.balls[0] || 0];
      }
    } else {
      return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
    }
  };

  const getNextBall = (frameIndex, gameFrames = frames) => {
    if (frameIndex >= 9) return 0;
    const nextFrame = gameFrames[frameIndex + 1];
    return nextFrame.balls[0] || 0;
  };

  const calculateFrameScore = (frameIndex, gameFrames = frames) => {
    const frame = gameFrames[frameIndex];
    
    if (frameIndex === 9) {
      let total = 0;
      for (let i = 0; i < 3; i++) {
        if (frame.balls[i] !== null) {
          total += frame.balls[i];
        }
      }
      return total;
    }

    if (isStrike(frameIndex, gameFrames)) {
      const [next1, next2] = getNextTwoBalls(frameIndex, gameFrames);
      return 10 + next1 + next2;
    } else if (isSpare(frameIndex, gameFrames)) {
      const nextBall = getNextBall(frameIndex, gameFrames);
      return 10 + nextBall;
    } else {
      return (frame.balls[0] || 0) + (frame.balls[1] || 0);
    }
  };

  const calculateScoresForGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    const gameFrames = game.frames;
    const newFrames = [...gameFrames];
    let runningTotal = 0;
    let allFramesComplete = true;

    for (let i = 0; i < 10; i++) {
      const frame = newFrames[i];
      let canScore = false;
      
      if (i === 9) {
        if (frame.balls[0] === 10) {
          canScore = frame.balls[1] !== null && frame.balls[2] !== null;
        } else if ((frame.balls[0] || 0) + (frame.balls[1] || 0) === 10) {
          canScore = frame.balls[2] !== null;
        } else {
          canScore = frame.balls[1] !== null;
        }
      } else {
        if (isStrike(i, gameFrames)) {
          const [next1, next2] = getNextTwoBalls(i, gameFrames);
          canScore = next1 !== 0 || next2 !== 0 || i >= 8;
        } else if (frame.balls[1] !== null) {
          if (isSpare(i, gameFrames)) {
            const nextBall = getNextBall(i, gameFrames);
            canScore = nextBall !== 0 || i >= 8;
          } else {
            canScore = true;
          }
        }
      }

      if (canScore) {
        const frameScore = calculateFrameScore(i, gameFrames);
        runningTotal += frameScore;
        newFrames[i].score = runningTotal;
      } else {
        newFrames[i].score = null;
        allFramesComplete = false;
      }
    }

    updateActiveGame({
      frames: newFrames,
      totalScore: runningTotal,
      gameComplete: allFramesComplete && newFrames[9].score !== null
    });
  };

  const enterPins = (pins) => {
    const newFrames = [...frames];
    let targetFrame, targetBall;
    
    if (editingFrame !== null && editingBall !== null) {
      targetFrame = editingFrame;
      targetBall = editingBall;
    } else {
      targetFrame = currentFrame;
      targetBall = currentBall;
    }
    
    const frame = newFrames[targetFrame];
    
    if (editingFrame !== null && editingBall !== null) {
      if (targetFrame === 9) {
        for (let i = targetBall; i < 3; i++) {
          frame.balls[i] = null;
        }
      } else {
        for (let i = targetBall; i < 2; i++) {
          frame.balls[i] = null;
        }
      }
      
      for (let i = targetFrame; i < 10; i++) {
        newFrames[i].score = null;
      }
    }
    
    if (targetFrame < 9) {
      if (targetBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        
        if (editingFrame !== null) {
          if (pins === 10) {
            updateActiveGame({
              frames: newFrames,
              editingFrame: null,
              editingBall: null,
              currentFrame: targetFrame < 9 ? targetFrame + 1 : targetFrame,
              currentBall: 0
            });
          } else {
            updateActiveGame({
              frames: newFrames,
              editingBall: 1
            });
          }
        } else {
          if (pins === 10) {
            updateActiveGame({
              frames: newFrames,
              currentFrame: currentFrame + 1,
              currentBall: 0
            });
          } else {
            updateActiveGame({
              frames: newFrames,
              currentBall: 1
            });
          }
        }
      } else if (targetBall === 1) {
        if ((frame.balls[0] || 0) + pins > 10) return;
        frame.balls[1] = pins;
        
        if (editingFrame !== null) {
          updateActiveGame({
            frames: newFrames,
            editingFrame: null,
            editingBall: null,
            currentFrame: targetFrame < 9 ? targetFrame + 1 : targetFrame,
            currentBall: 0
          });
        } else {
          updateActiveGame({
            frames: newFrames,
            currentFrame: currentFrame + 1,
            currentBall: 0
          });
        }
      }
    } else {
      if (targetBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        
        if (editingFrame !== null) {
          updateActiveGame({
            frames: newFrames,
            editingBall: 1
          });
        } else {
          updateActiveGame({
            frames: newFrames,
            currentBall: 1
          });
        }
      } else if (targetBall === 1) {
        if (frame.balls[0] === 10) {
          if (pins > 10) return;
          frame.balls[1] = pins;
          
          if (editingFrame !== null) {
            updateActiveGame({
              frames: newFrames,
              editingBall: 2
            });
          } else {
            updateActiveGame({
              frames: newFrames,
              currentBall: 2
            });
          }
        } else {
          if ((frame.balls[0] || 0) + pins > 10) return;
          frame.balls[1] = pins;
          
          if ((frame.balls[0] || 0) + pins === 10) {
            if (editingFrame !== null) {
              updateActiveGame({
                frames: newFrames,
                editingBall: 2
              });
            } else {
              updateActiveGame({
                frames: newFrames,
                currentBall: 2
              });
            }
          } else {
            updateActiveGame({
              frames: newFrames,
              editingFrame: null,
              editingBall: null,
              currentBall: 3
            });
          }
        }
      } else if (targetBall === 2) {
        if (frame.balls[0] === 10) {
          if (pins > 10) return;
          frame.balls[2] = pins;
        } else if ((frame.balls[0] || 0) + (frame.balls[1] || 0) === 10) {
          if (pins > 10) return;
          frame.balls[2] = pins;
        } else {
          return;
        }
        
        updateActiveGame({
          frames: newFrames,
          editingFrame: null,
          editingBall: null,
          currentBall: 3
        });
      }
    }
  };

  const addAnotherGame = () => {
    if (games.length >= 2) return;
    
    const newGameId = Math.max(...games.map(g => g.id)) + 1;
    const newGame = {
      id: newGameId,
      frames: (() => {
        const initialFrames = [];
        for (let i = 0; i < 10; i++) {
          if (i === 9) {
            initialFrames.push({ balls: [null, null, null], score: null });
          } else {
            initialFrames.push({ balls: [null, null], score: null });
          }
        }
        return initialFrames;
      })(),
      currentFrame: 0,
      currentBall: 0,
      totalScore: 0,
      gameComplete: false,
      editingFrame: null,
      editingBall: null
    };
    
    setGames(prevGames => [...prevGames, newGame]);
    setActiveGameId(newGameId);
  };

  const clearGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    const clearedFrames = [];
    for (let i = 0; i < 10; i++) {
      if (i === 9) {
        clearedFrames.push({ balls: [null, null, null], score: null });
      } else {
        clearedFrames.push({ balls: [null, null], score: null });
      }
    }
    
    setGames(prevGames => 
      prevGames.map(g => 
        g.id === gameId 
          ? {
              ...g,
              frames: clearedFrames,
              currentFrame: 0,
              currentBall: 0,
              totalScore: 0,
              gameComplete: false,
              editingFrame: null,
              editingBall: null
            }
          : g
      )
    );
  };

  const formatBall = (ball, frameIndex, ballIndex) => {
    if (ball === null) return '';
    if (ball === 0) return '-';
    if (ball === 10) {
      return 'X';
    }
    
    if (frameIndex < 9 && ballIndex === 1) {
      const frame = frames[frameIndex];
      if ((frame.balls[0] || 0) + ball === 10) return '/';
    } else if (frameIndex === 9 && ballIndex === 1 && frames[9].balls[0] !== 10) {
      if ((frames[9].balls[0] || 0) + ball === 10) return '/';
    } else if (frameIndex === 9 && ballIndex === 2 && frames[9].balls[1] !== 10) {
      if ((frames[9].balls[1] || 0) + ball === 10) return '/';
    }
    
    return ball.toString();
  };

  const handleBallClick = (frameIndex, ballIndex) => {
    if (frames[frameIndex].balls[ballIndex] === null && 
        !(frameIndex === currentFrame && ballIndex === currentBall) &&
        !gameComplete) {
      return;
    }
    
    if (gameComplete && frames[frameIndex].balls[ballIndex] === null) {
      return;
    }
    
    updateActiveGame({
      editingFrame: frameIndex,
      editingBall: ballIndex
    });
  };

  const cancelEdit = () => {
    updateActiveGame({
      editingFrame: null,
      editingBall: null
    });
  };

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

  const hasUnsavedGames = games.some(game => 
    game.frames.some(frame => 
      frame.balls.some(ball => ball !== null)
    )
  );
    const activeFrame = editingFrame !== null ? editingFrame : currentFrame;
    const activeBall = editingBall !== null ? editingBall : currentBall;
    
    if (activeFrame >= 10 || activeBall >= 3) return [];
    
    const buttons = [];
    let maxPins = 10;
    
    if (activeFrame < 9) {
      if (activeBall === 1) {
        maxPins = 10 - (frames[activeFrame].balls[0] || 0);
      }
    } else {
      if (activeBall === 1 && frames[9].balls[0] === 10) {
        maxPins = 10;
      } else if (activeBall === 1 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (activeBall === 2) {
        if (frames[9].balls[0] === 10) {
          if (frames[9].balls[1] === 10) {
            maxPins = 10;
          } else {
            maxPins = 10 - (frames[9].balls[1] || 0);
          }
        } else if ((frames[9].balls[0] || 0) + (frames[9].balls[1] || 0) === 10) {
          maxPins = 10;
        } else {
          maxPins = 0;
        }
      }
    }
    
    for (let i = 0; i <= maxPins; i++) {
      buttons.push(
        <button key={i} onClick={() => enterPins(i)}>{i}</button>
      );
    }
    
    return buttons;
  };

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Header onSaveGames={handleSaveGames} hasUnsavedGames={isAuthenticated && hasUnsavedGames} />
      
      {showSaveSuccess && (
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '1.1em'
        }}>
          ✅ Games saved successfully!
        </div>
      )}
      
      <div style={{ textAlign: 'center', color: 'white', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Bowling Score Calculator</h1>
        <p>Enter your pins knocked down for each ball</p>
      </div>
      
      {games.map((game, gameIndex) => (
        <div key={game.id} style={{ marginBottom: '30px' }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: game.id === activeGameId ? '3px solid #4CAF50' : '1px solid #ddd'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h2 style={{ 
                margin: 0, 
                color: '#333',
                cursor: 'pointer'
              }} onClick={() => setActiveGameId(game.id)}>
                Game {gameIndex + 1} {game.id === activeGameId ? '(Active)' : ''}
              </h2>
              <button
                onClick={() => clearGame(game.id)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear Game
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
              {game.frames.map((frame, frameIndex) => (
                <div 
                  key={frameIndex}
                  style={{
                    flex: frameIndex === 9 ? 1.5 : 1,
                    border: (game.id === activeGameId && frameIndex === game.currentFrame) ? '2px solid #4CAF50' : '2px solid #333',
                    background: (game.id === activeGameId && frameIndex === game.currentFrame) ? '#f0f8f0' : 'white',
                    minHeight: '80px',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {frameIndex + 1}
                  </div>
                  
                  <div style={{
                    display: frameIndex === 9 ? 'grid' : 'flex',
                    gridTemplateColumns: frameIndex === 9 ? '1fr 1fr 1fr' : undefined,
                    height: '40px',
                    marginTop: '15px'
                  }}>
                    {frameIndex === 9 ? (
                      <>
                        {[0, 1, 2].map(ballIndex => (
                          <div
                            key={ballIndex}
                            style={{
                              borderRight: ballIndex < 2 ? '1px solid #333' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              cursor: 'pointer',
                              backgroundColor: (game.id === activeGameId && game.editingFrame === frameIndex && game.editingBall === ballIndex) ? '#fff3cd' : '#f8f9fa'
                            }}
                            onClick={() => {
                              setActiveGameId(game.id);
                              handleBallClick(frameIndex, ballIndex);
                            }}
                          >
                            {formatBall(frame.balls[ballIndex], frameIndex, ballIndex)}
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {[0, 1].map(ballIndex => (
                          <div
                            key={ballIndex}
                            style={{
                              flex: 1,
                              borderRight: ballIndex === 0 ? '1px solid #333' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              cursor: 'pointer',
                              backgroundColor: (game.id === activeGameId && game.editingFrame === frameIndex && game.editingBall === ballIndex) ? '#fff3cd' : '#f8f9fa'
                            }}
                            onClick={() => {
                              setActiveGameId(game.id);
                              handleBallClick(frameIndex, ballIndex);
                            }}
                          >
                            {formatBall(frame.balls[ballIndex], frameIndex, ballIndex)}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  <div style={{
                    height: '25px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {frame.score !== null ? frame.score : ''}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              textAlign: 'center',
              fontSize: '2em',
              fontWeight: 'bold',
              color: '#333',
              margin: '20px 0'
            }}>
              Total Score: {game.totalScore}
            </div>
            
            {game.gameComplete && (
              <div style={{
                background: '#4CAF50',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '1.1em',
                marginTop: '15px'
              }}>
                🎉 Game Complete! Final Score: {game.totalScore}
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        textAlign: 'center'
      }}>
        {(!gameComplete || editingFrame !== null) && (
          <>
            <div style={{
              color: 'white',
              marginBottom: '20px',
              fontSize: '1.2em'
            }}>
              {editingFrame !== null && editingBall !== null ? (
                <>
                  Editing Game {games.findIndex(g => g.id === activeGameId) + 1}, Frame {editingFrame + 1}, Ball {editingBall + 1}
                  <button 
                    onClick={cancelEdit}
                    style={{
                      marginLeft: '15px',
                      padding: '5px 10px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
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
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {getPinButtons().map((button, index) => (
                <div
                  key={index}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none'
                  }}
                  onClick={button.props.onClick}
                >
                  {button.props.children}
                </div>
              ))}
            </div>
          </>
        )}
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {games.length < 2 && (
            <button 
              onClick={addAnotherGame}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
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