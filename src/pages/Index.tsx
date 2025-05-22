import React, { useState, useEffect } from 'react';

const BowlingScoreCalculator = () => {
  // Initialize game state
  const [frames, setFrames] = useState(() => {
    const initialFrames = [];
    for (let i = 0; i < 10; i++) {
      if (i === 9) { // 10th frame
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

  // Calculate scores whenever frames change
  useEffect(() => {
    calculateScores();
  }, [frames]);

  const isStrike = (frameIndex) => {
    return frames[frameIndex].balls[0] === 10;
  };

  const isSpare = (frameIndex) => {
    if (frameIndex === 9) return false; // 10th frame spares handled differently
    return !isStrike(frameIndex) && 
           frames[frameIndex].balls[0] + frames[frameIndex].balls[1] === 10;
  };

  const getNextTwoBalls = (frameIndex) => {
    if (frameIndex >= 9) return [0, 0]; // No next balls after 10th frame
    
    const nextFrame = frames[frameIndex + 1];
    if (isStrike(frameIndex + 1)) {
      // Next frame is a strike
      if (frameIndex + 1 === 9) {
        // Next frame is 10th frame
        return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
      } else {
        // Look at frame after next
        const frameAfterNext = frames[frameIndex + 2];
        return [nextFrame.balls[0] || 0, frameAfterNext?.balls[0] || 0];
      }
    } else {
      // Next frame is not a strike
      return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
    }
  };

  const getNextBall = (frameIndex) => {
    if (frameIndex >= 9) return 0; // No next ball after 10th frame
    const nextFrame = frames[frameIndex + 1];
    return nextFrame.balls[0] || 0;
  };

  const calculateFrameScore = (frameIndex) => {
    const frame = frames[frameIndex];
    
    if (frameIndex === 9) {
      // 10th frame scoring
      let total = 0;
      for (let i = 0; i < 3; i++) {
        if (frame.balls[i] !== null) {
          total += frame.balls[i];
        }
      }
      return total;
    }

    // Regular frames (1-9)
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
      
      // Check if frame is complete enough to score
      let canScore = false;
      
      if (i === 9) {
        // 10th frame: need all applicable balls
        if (frame.balls[0] === 10) {
          canScore = frame.balls[1] !== null && frame.balls[2] !== null;
        } else if ((frame.balls[0] || 0) + (frame.balls[1] || 0) === 10) {
          canScore = frame.balls[2] !== null;
        } else {
          canScore = frame.balls[1] !== null;
        }
      } else {
        // Regular frames
        if (isStrike(i)) {
          // Need next two balls to score
          const [next1, next2] = getNextTwoBalls(i);
          canScore = next1 !== 0 || next2 !== 0 || i >= 8; // Can score if we have next balls or it's frame 9
        } else if (frame.balls[1] !== null) {
          if (isSpare(i)) {
            // Need next ball to score
            const nextBall = getNextBall(i);
            canScore = nextBall !== 0 || i >= 8; // Can score if we have next ball or it's frame 9
          } else {
            // Open frame, can score immediately
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
    const frame = newFrames[currentFrame];
    
    // Validate input
    if (currentFrame < 9) {
      // Regular frames (1-9)
      if (currentBall === 0) {
        if (pins > 10) return; // Can't knock down more than 10 pins
        frame.balls[0] = pins;
        
        if (pins === 10) {
          // Strike - move to next frame
          setCurrentFrame(currentFrame + 1);
          setCurrentBall(0);
        } else {
          // Move to second ball
          setCurrentBall(1);
        }
      } else if (currentBall === 1) {
        if ((frame.balls[0] || 0) + pins > 10) return; // Total can't exceed 10
        frame.balls[1] = pins;
        
        // Move to next frame
        setCurrentFrame(currentFrame + 1);
        setCurrentBall(0);
      }
    } else {
      // 10th frame
      if (currentBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        setCurrentBall(1);
      } else if (currentBall === 1) {
        // Second ball in 10th frame
        if (frame.balls[0] !== 10 && (frame.balls[0] || 0) + pins > 10) return;
        frame.balls[1] = pins;
        
        // Check if we need a third ball
        if (frame.balls[0] === 10 || (frame.balls[0] || 0) + pins === 10) {
          setCurrentBall(2);
        } else {
          // Game complete
          setCurrentBall(3);
        }
      } else if (currentBall === 2) {
        // Third ball in 10th frame
        if (frame.balls[1] !== 10 && frame.balls[0] !== 10 && 
            (frame.balls[1] || 0) + pins > 10) return;
        frame.balls[2] = pins;
        setCurrentBall(3); // Game complete
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
  };

  const formatBall = (ball, frameIndex, ballIndex) => {
    if (ball === null) return '';
    if (ball === 0) return '-';
    if (ball === 10) {
      if (frameIndex === 9 || ballIndex === 0) return 'X';
      return 'X';
    }
    
    // Check for spare
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

  const getPinButtons = () => {
    if (currentFrame >= 10 || currentBall >= 3) return [];
    
    const buttons = [];
    let maxPins = 10;
    
    if (currentFrame < 9) {
      // Regular frames
      if (currentBall === 1) {
        maxPins = 10 - (frames[currentFrame].balls[0] || 0);
      }
    } else {
      // 10th frame
      if (currentBall === 1 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (currentBall === 2 && frames[9].balls[1] !== 10 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[1] || 0);
      }
    }
    
    for (let i = 0; i <= maxPins; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => enterPins(i)}
          className="pin-button"
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  const styles = {
    bowlingCalculator: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center' as const,
      color: 'white',
      marginBottom: '30px'
    },
    headerTitle: {
      fontSize: '2.5em',
      marginBottom: '10px',
      margin: '0 0 10px 0'
    },
    scorecard: {
      background: 'white',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    },
    framesContainer: {
      display: 'flex',
      gap: '2px',
      marginBottom: '20px'
    },
    frame: {
      flex: 1,
      border: '2px solid #333',
      background: 'white',
      minHeight: '80px',
      position: 'relative' as const
    },
    frameCurrent: {
      flex: 1,
      border: '2px solid #4CAF50',
      background: '#f0f8f0',
      minHeight: '80px',
      position: 'relative' as const
    },
    tenthFrame: {
      flex: 1.5,
      border: '2px solid #333',
      background: 'white',
      minHeight: '80px',
      position: 'relative' as const
    },
    tenthFrameCurrent: {
      flex: 1.5,
      border: '2px solid #4CAF50',
      background: '#f0f8f0',
      minHeight: '80px',
      position: 'relative' as const
    },
    frameNumber: {
      position: 'absolute' as const,
      top: '2px',
      left: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    ballsRow: {
      display: 'flex',
      height: '40px',
      marginTop: '15px'
    },
    ballsRowTenth: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      height: '40px',
      marginTop: '15px'
    },
    ball: {
      flex: 1,
      borderRight: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    ballTenth: {
      borderRight: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    scoreRow: {
      height: '25px',
      borderTop: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    totalScore: {
      textAlign: 'center' as const,
      fontSize: '2em',
      fontWeight: 'bold',
      color: '#333',
      margin: '20px 0'
    },
    controls: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '20px',
      textAlign: 'center' as const
    },
    currentFrameInfo: {
      color: 'white',
      marginBottom: '20px',
      fontSize: '1.2em'
    },
    pinButtons: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '10px',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    pinButton: {
      width: '50px',
      height: '50px',
      border: 'none',
      borderRadius: '50%',
      background: '#4CAF50',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    resetButton: {
      background: '#f44336',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '25px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    gameComplete: {
      background: '#4CAF50',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center' as const,
      fontSize: '1.3em',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.bowlingCalculator}>
      
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🎳 Bowling Score Calculator</h1>
        <p>Enter your pins knocked down for each ball</p>
      </div>
      
      <div style={styles.scorecard}>
        <div style={styles.framesContainer}>
          {frames.map((frame, frameIndex) => {
            const isCurrent = frameIndex === currentFrame;
            const isTenth = frameIndex === 9;
            
            let frameStyle = styles.frame;
            if (isTenth && isCurrent) frameStyle = styles.tenthFrameCurrent;
            else if (isTenth) frameStyle = styles.tenthFrame;
            else if (isCurrent) frameStyle = styles.frameCurrent;
            
            return (
              <div 
                key={frameIndex}
                style={frameStyle}
              >
                <div style={styles.frameNumber}>{frameIndex + 1}</div>
                <div style={frameIndex === 9 ? styles.ballsRowTenth : styles.ballsRow}>
                  {frameIndex === 9 ? (
                    // 10th frame - 3 balls
                    <>
                      <div style={{...styles.ballTenth, borderRight: frameIndex === 9 ? '1px solid #333' : 'none'}}>
                        {formatBall(frame.balls[0], frameIndex, 0)}
                      </div>
                      <div style={{...styles.ballTenth, borderRight: frameIndex === 9 ? '1px solid #333' : 'none'}}>
                        {formatBall(frame.balls[1], frameIndex, 1)}
                      </div>
                      <div style={{...styles.ballTenth, borderRight: 'none'}}>
                        {formatBall(frame.balls[2], frameIndex, 2)}
                      </div>
                    </>
                  ) : (
                    // Regular frames - 2 balls
                    <>
                      <div style={styles.ball}>
                        {formatBall(frame.balls[0], frameIndex, 0)}
                      </div>
                      <div style={{...styles.ball, borderRight: 'none'}}>
                        {formatBall(frame.balls[1], frameIndex, 1)}
                      </div>
                    </>
                  )}
                </div>
                <div style={styles.scoreRow}>
                  {frame.score !== null ? frame.score : ''}
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={styles.totalScore}>
          Total Score: {totalScore}
        </div>
      </div>
      
      {gameComplete && (
        <div style={styles.gameComplete}>
          🎉 Game Complete! Final Score: {totalScore}
        </div>
      )}
      
      <div style={styles.controls}>
        {!gameComplete && (
          <>
            <div style={styles.currentFrameInfo}>
              Frame {currentFrame + 1}, Ball {currentBall + 1}
            </div>
            
            <div style={styles.pinButtons}>
              {getPinButtons().map((button, index) => (
                <button
                  key={index}
                  onClick={button.props.onClick}
                  style={styles.pinButton}
                  className="hover:bg-green-600 active:scale-95"
                >
                  {button.props.children}
                </button>
              ))}
            </div>
          </>
        )}
        
        <button 
          onClick={resetGame} 
          style={styles.resetButton}
          className="hover:bg-red-700"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default BowlingScoreCalculator;
