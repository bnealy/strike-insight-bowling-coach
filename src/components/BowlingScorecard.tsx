import React, { useState, useEffect } from 'react';

const BowlingScorecard = () => {
  // Initialize game state
  const [frames, setFrames] = useState(() => {
    const initialFrames = [];
    for (let i = 0; i < 10; i++) {
      if (i === 9) {
        initialFrames.push({ balls: [null, null, null], score: null });
      } else {
        initialFrames.push({ balls: [null, null], score: null });
      }
    }
    return initialFrames;
  });

  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const [editingBall, setEditingBall] = useState(null);

  // Calculate scores whenever frames change
  useEffect(() => {
    calculateScores();
  }, [frames]);

  const isStrike = (frameIndex) => {
    return frames[frameIndex].balls[0] === 10;
  };

  const isSpare = (frameIndex) => {
    if (frameIndex === 9) return false;
    return !isStrike(frameIndex) && 
           frames[frameIndex].balls[0] + frames[frameIndex].balls[1] === 10;
  };

  const getNextTwoBalls = (frameIndex) => {
    if (frameIndex >= 9) return [0, 0];
    
    const nextFrame = frames[frameIndex + 1];
    if (isStrike(frameIndex + 1)) {
      if (frameIndex + 1 === 9) {
        return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
      } else {
        const frameAfterNext = frames[frameIndex + 2];
        return [nextFrame.balls[0] || 0, frameAfterNext?.balls[0] || 0];
      }
    } else {
      return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
    }
  };

  const getNextBall = (frameIndex) => {
    if (frameIndex >= 9) return 0;
    const nextFrame = frames[frameIndex + 1];
    return nextFrame.balls[0] || 0;
  };

  const calculateFrameScore = (frameIndex) => {
    const frame = frames[frameIndex];
    
    if (frameIndex === 9) {
      let total = 0;
      for (let i = 0; i < 3; i++) {
        if (frame.balls[i] !== null) {
          total += frame.balls[i];
        }
      }
      return total;
    }

    if (isStrike(frameIndex)) {
      const [next1, next2] = getNextTwoBalls(frameIndex);
      return 10 + next1 + next2;
    } else if (isSpare(frameIndex)) {
      const nextBall = getNextBall(frameIndex);
      return 10 + nextBall;
    } else {
      return (frame.balls[0] || 0) + (frame.balls[1] || 0);
    }
  };

  const calculateScores = () => {
    const newFrames = [...frames];
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
        if (isStrike(i)) {
          const [next1, next2] = getNextTwoBalls(i);
          canScore = next1 !== 0 || next2 !== 0 || i >= 8;
        } else if (frame.balls[1] !== null) {
          if (isSpare(i)) {
            const nextBall = getNextBall(i);
            canScore = nextBall !== 0 || i >= 8;
          } else {
            canScore = true;
          }
        }
      }

      if (canScore) {
        const frameScore = calculateFrameScore(i);
        runningTotal += frameScore;
        newFrames[i].score = runningTotal;
      } else {
        newFrames[i].score = null;
        allFramesComplete = false;
      }
    }

    setFrames(newFrames);
    setTotalScore(runningTotal);
    setGameComplete(allFramesComplete && newFrames[9].score !== null);
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
      
      // Only clear scores, not the ball data from subsequent frames
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
            setEditingFrame(null);
            setEditingBall(null);
            if (targetFrame < 9) {
              setCurrentFrame(targetFrame + 1);
              setCurrentBall(0);
            }
          } else {
            setEditingBall(1);
          }
        } else {
          if (pins === 10) {
            setCurrentFrame(currentFrame + 1);
            setCurrentBall(0);
          } else {
            setCurrentBall(1);
          }
        }
      } else if (targetBall === 1) {
        if ((frame.balls[0] || 0) + pins > 10) return;
        frame.balls[1] = pins;
        
        if (editingFrame !== null) {
          setEditingFrame(null);
          setEditingBall(null);
          if (targetFrame < 9) {
            setCurrentFrame(targetFrame + 1);
            setCurrentBall(0);
          }
        } else {
          setCurrentFrame(currentFrame + 1);
          setCurrentBall(0);
        }
      }
    } else {
      if (targetBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        
        if (editingFrame !== null) {
          setEditingBall(1);
        } else {
          setCurrentBall(1);
        }
      } else if (targetBall === 1) {
        if (frame.balls[0] === 10) {
          if (pins > 10) return;
          frame.balls[1] = pins;
          
          if (editingFrame !== null) {
            setEditingBall(2);
          } else {
            setCurrentBall(2);
          }
        } else {
          if ((frame.balls[0] || 0) + pins > 10) return;
          frame.balls[1] = pins;
          
          if ((frame.balls[0] || 0) + pins === 10) {
            if (editingFrame !== null) {
              setEditingBall(2);
            } else {
              setCurrentBall(2);
            }
          } else {
            setEditingFrame(null);
            setEditingBall(null);
            setCurrentBall(3);
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
        
        setEditingFrame(null);
        setEditingBall(null);
        setCurrentBall(3);
      }
    }
    
    setFrames(newFrames);
  };

  const resetGame = () => {
    const initialFrames = [];
    for (let i = 0; i < 10; i++) {
      if (i === 9) {
        initialFrames.push({ balls: [null, null, null], score: null });
      } else {
        initialFrames.push({ balls: [null, null], score: null });
      }
    }
    setFrames(initialFrames);
    setCurrentFrame(0);
    setCurrentBall(0);
    setTotalScore(0);
    setGameComplete(false);
    setEditingFrame(null);
    setEditingBall(null);
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
    
    setEditingFrame(frameIndex);
    setEditingBall(ballIndex);
  };

  const cancelEdit = () => {
    setEditingFrame(null);
    setEditingBall(null);
  };

  const getPinButtons = () => {
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
      // 10th frame logic
      if (activeBall === 1 && frames[9].balls[0] === 10) {
        // After a strike in 10th frame, second ball can be 0-10
        maxPins = 10;
      } else if (activeBall === 1 && frames[9].balls[0] !== 10) {
        // After non-strike in 10th frame, normal spare logic
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (activeBall === 2) {
        // Third ball in 10th frame
        if (frames[9].balls[0] === 10) {
          // First ball was strike
          if (frames[9].balls[1] === 10) {
            // Strike-Strike, third ball can be 0-10
            maxPins = 10;
          } else {
            // Strike-NonStrike, third ball limited by second ball
            maxPins = 10 - (frames[9].balls[1] || 0);
          }
        } else if ((frames[9].balls[0] || 0) + (frames[9].balls[1] || 0) === 10) {
          // First two balls made a spare, third ball can be 0-10
          maxPins = 10;
        } else {
          // Should not happen - no third ball for open frame
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
      <div style={{ textAlign: 'center', color: 'white', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Bowling Score Calculator</h1>
        <p>Enter your pins knocked down for each ball</p>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
          {frames.map((frame, frameIndex) => (
            <div 
              key={frameIndex}
              style={{
                flex: frameIndex === 9 ? 1.5 : 1,
                border: frameIndex === currentFrame ? '2px solid #4CAF50' : '2px solid #333',
                background: frameIndex === currentFrame ? '#f0f8f0' : 'white',
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
                          backgroundColor: editingFrame === frameIndex && editingBall === ballIndex ? '#fff3cd' : '#f8f9fa'
                        }}
                        onClick={() => handleBallClick(frameIndex, ballIndex)}
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
                          backgroundColor: editingFrame === frameIndex && editingBall === ballIndex ? '#fff3cd' : '#f8f9fa'
                        }}
                        onClick={() => handleBallClick(frameIndex, ballIndex)}
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
          Total Score: {totalScore}
        </div>
      </div>
      
      {gameComplete && (
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '1.3em',
          marginBottom: '20px'
        }}>
          🎉 Game Complete! Final Score: {totalScore}
        </div>
      )}
      
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
                  Editing Frame {editingFrame + 1}, Ball {editingBall + 1}
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
                `Frame ${currentFrame + 1}, Ball ${currentBall + 1}`
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
        
        <button 
          onClick={resetGame}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default BowlingScorecard;