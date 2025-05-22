
import { useState, useEffect, useCallback } from 'react';
import { Game, Frame } from '../types/bowlingTypes';
import { calculateScoresForGame } from '../utils/bowlingScoreUtils';

export const useBowlingGame = () => {
  const [games, setGames] = useState<Game[]>(() => [createInitialGame(1)]);
  const [activeGameId, setActiveGameId] = useState<number>(1);
  
  const activeGame = games.find(game => game.id === activeGameId) || games[0];

  // Create initial game
  function createInitialGame(id: number): Game {
    const initialFrames: Frame[] = [];
    for (let i = 0; i < 10; i++) {
      if (i === 9) {
        initialFrames.push({ balls: [null, null, null], score: null });
      } else {
        initialFrames.push({ balls: [null, null], score: null });
      }
    }
    
    return {
      id,
      frames: initialFrames,
      currentFrame: 0,
      currentBall: 0,
      totalScore: 0,
      gameComplete: false,
      editingFrame: null,
      editingBall: null
    };
  }

  const updateActiveGame = useCallback((updates: Partial<Game>) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === activeGameId 
          ? { ...game, ...updates }
          : game
      )
    );
  }, [activeGameId]);

  useEffect(() => {
    const updatedGame = calculateScoresForGame(activeGame);
    if (
      updatedGame.totalScore !== activeGame.totalScore || 
      JSON.stringify(updatedGame.frames) !== JSON.stringify(activeGame.frames) ||
      updatedGame.gameComplete !== activeGame.gameComplete
    ) {
      updateActiveGame({
        frames: updatedGame.frames,
        totalScore: updatedGame.totalScore,
        gameComplete: updatedGame.gameComplete
      });
    }
  }, [activeGame.frames, activeGameId, updateActiveGame]);

  const enterPins = (pins: number) => {
    const newFrames = [...activeGame.frames];
    let targetFrame: number, targetBall: number;
    
    if (activeGame.editingFrame !== null && activeGame.editingBall !== null) {
      targetFrame = activeGame.editingFrame;
      targetBall = activeGame.editingBall;
    } else {
      targetFrame = activeGame.currentFrame;
      targetBall = activeGame.currentBall;
    }
    
    const frame = newFrames[targetFrame];
    
    if (activeGame.editingFrame !== null && activeGame.editingBall !== null) {
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
        
        if (activeGame.editingFrame !== null) {
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
              currentFrame: activeGame.currentFrame + 1,
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
        
        if (activeGame.editingFrame !== null) {
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
            currentFrame: activeGame.currentFrame + 1,
            currentBall: 0
          });
        }
      }
    } else {
      if (targetBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        
        if (activeGame.editingFrame !== null) {
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
          
          if (activeGame.editingFrame !== null) {
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
            if (activeGame.editingFrame !== null) {
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
    const newGame = createInitialGame(newGameId);
    
    setGames(prevGames => [...prevGames, newGame]);
    setActiveGameId(newGameId);
  };

  const clearGame = (gameId: number) => {
    const clearedFrames: Frame[] = [];
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

  const handleBallClick = (frameIndex: number, ballIndex: number) => {
    if (activeGame.frames[frameIndex].balls[ballIndex] === null && 
        !(frameIndex === activeGame.currentFrame && ballIndex === activeGame.currentBall) &&
        !activeGame.gameComplete) {
      return;
    }
    
    if (activeGame.gameComplete && activeGame.frames[frameIndex].balls[ballIndex] === null) {
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

  const hasUnsavedGames = games.some(game => 
    game.frames.some(frame => 
      frame.balls.some(ball => ball !== null)
    )
  );

  return {
    games,
    activeGameId,
    activeGame,
    setActiveGameId,
    updateActiveGame,
    enterPins,
    addAnotherGame,
    clearGame,
    handleBallClick,
    cancelEdit,
    hasUnsavedGames
  };
};
