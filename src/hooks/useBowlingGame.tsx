import { useState, useEffect, useCallback } from 'react';
import { Game, Frame, SaveGameResult } from '../types/bowlingTypes';
import { calculateScoresForGame } from '../utils/bowlingScoreUtils';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useSaveGames } from './useSaveGames';

export interface BowlingSession {
  id: number;
  title: string;
  games: Game[];
  isVisible: boolean;
  createdAt: Date;
  savedToDatabase: boolean;
}

export const useBowlingGame = () => {
  const [sessions, setSessions] = useState<BowlingSession[]>(() => [{
    id: 1,
    title: 'New Session',
    games: [createInitialGame(1)],
    isVisible: true,
    createdAt: new Date(),
    savedToDatabase: false
  }]);
  
  const [activeSessionId, setActiveSessionId] = useState<number>(1);
  const [activeGameId, setActiveGameId] = useState<number>(1);
  const { isAuthenticated, user } = useAuth();
  const { saveSessionsToDatabase, isSaving } = useSaveGames();
  
  // Find the active session and game
  const activeSession = sessions.find(session => session.id === activeSessionId) || sessions[0];
  const activeSessionGames = activeSession?.games || [];
  const activeGame = activeSessionGames.find(game => game.id === activeGameId) || activeSessionGames[0];

  // Create initial game
  function createInitialGame(id: number): Game {
    const initialFrames: Frame[] = [];
    for (let frameNumber = 1; frameNumber <= 10; frameNumber++) {
      if (frameNumber === 10) {
        initialFrames.push({ balls: [null, null, null], score: null });
      } else {
        initialFrames.push({ balls: [null, null], score: null });
      }
    }
    
    return {
      id,
      frames: initialFrames,
      currentFrame: 1, // Start at frame 1
      currentBall: 0,
      totalScore: 0,
      gameComplete: false,
      editingFrame: null,
      editingBall: null,
      isVisible: true
    };
  }

  const updateActiveGame = useCallback((updates: Partial<Game>) => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            games: session.games.map(game => 
              game.id === activeGameId 
                ? { 
                    ...game,
                    ...updates,
                    frames: updates.frames || game.frames,
                    totalScore: typeof updates.totalScore === 'number' ? updates.totalScore : game.totalScore
                  }
                : game
            ),
            savedToDatabase: false
          };
        }
        return session;
      });
    });
  }, [activeSessionId, activeGameId]);

  useEffect(() => {
    if (!activeGame) return;
    
    const updatedGame = calculateScoresForGame(activeGame);
    
    const newTotalScore = typeof updatedGame.totalScore === 'number' && !isNaN(updatedGame.totalScore) 
      ? updatedGame.totalScore 
      : 0;
    
    if (
      newTotalScore !== activeGame.totalScore || 
      JSON.stringify(updatedGame.frames) !== JSON.stringify(activeGame.frames) ||
      updatedGame.gameComplete !== activeGame.gameComplete
    ) {
      updateActiveGame({
        frames: updatedGame.frames,
        totalScore: newTotalScore,
        gameComplete: updatedGame.gameComplete
      });
    }
  }, [activeGame?.frames, activeGameId, updateActiveGame]);

  const enterPins = (pins: number) => {
    if (!activeGame) return;
    
    const newFrames = [...activeGame.frames];
    let targetFrame: number, targetBall: number;
    
    if (activeGame.editingFrame !== null && activeGame.editingBall !== null) {
      targetFrame = activeGame.editingFrame;
      targetBall = activeGame.editingBall;
    } else {
      targetFrame = activeGame.currentFrame;
      targetBall = activeGame.currentBall;
    }
    
    const frameIndex = targetFrame - 1;
    const frame = newFrames[frameIndex];
    
    if (activeGame.editingFrame !== null && activeGame.editingBall !== null) {
      if (targetFrame === 10) {
        for (let i = targetBall; i < 3; i++) {
          frame.balls[i] = null;
        }
      } else {
        for (let i = targetBall; i < 2; i++) {
          frame.balls[i] = null;
        }
      }
      
      for (let i = frameIndex; i < 10; i++) {
        newFrames[i].score = null;
      }
    }
    
    if (targetFrame < 10) {
      if (targetBall === 0) {
        if (pins > 10) return;
        frame.balls[0] = pins;
        
        if (activeGame.editingFrame !== null) {
          if (pins === 10) {
            updateActiveGame({
              frames: newFrames,
              editingFrame: null,
              editingBall: null,
              currentFrame: targetFrame < 10 ? targetFrame + 1 : targetFrame,
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
      } else {
        if ((frame.balls[0] || 0) + pins > 10) return;
        frame.balls[1] = pins;
        
        if (activeGame.editingFrame !== null) {
          updateActiveGame({
            frames: newFrames,
            editingFrame: null,
            editingBall: null,
            currentFrame: targetFrame < 10 ? targetFrame + 1 : targetFrame,
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
        if (pins > 10) return;
        frame.balls[2] = pins;
        
        updateActiveGame({
          frames: newFrames,
          editingFrame: null,
          editingBall: null,
          currentBall: 3
        });
      }
    }
    
    const updatedGame = calculateScoresForGame({
      ...activeGame,
      frames: newFrames
    });
    
    updateActiveGame({
      frames: updatedGame.frames,
      totalScore: updatedGame.totalScore,
      gameComplete: updatedGame.gameComplete
    });
  };

  const addSession = () => {
    const newSessionId = Math.max(...sessions.map(s => s.id)) + 1;
    const newSession: BowlingSession = {
      id: newSessionId,
      title: `Session ${newSessionId}`,
      games: [createInitialGame(1)],
      isVisible: true,
      createdAt: new Date(),
      savedToDatabase: false
    };
    
    setSessions(prevSessions => [...prevSessions, newSession]);
    setActiveSessionId(newSessionId);
    setActiveGameId(1);
  };

  const addGameToSession = () => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const newGameId = session.games.length > 0 ? 
            Math.max(...session.games.map(g => g.id)) + 1 : 1;
            
          return {
            ...session,
            games: [...session.games, createInitialGame(newGameId)],
            savedToDatabase: false
          };
        }
        return session;
      })
    );
    
    const activeSessionGames = activeSession?.games || [];
    const newGameId = activeSessionGames.length > 0 ? 
      Math.max(...activeSessionGames.map(g => g.id)) + 1 : 1;
    setActiveGameId(newGameId);
  };

  // NEW: Function to set up games for a specific count
  const setupGamesForSession = (gameCount: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          // Create the exact number of games needed
          const newGames: Game[] = [];
          for (let i = 1; i <= gameCount; i++) {
            newGames.push(createInitialGame(i));
          }
          
          return {
            ...session,
            games: newGames,
            savedToDatabase: false
          };
        }
        return session;
      })
    );
    
    // Set the first game as active
    setActiveGameId(1);
  };

  const clearGame = (sessionId: number, gameId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            games: session.games.map(game => {
              if (game.id === gameId) {
                const clearedFrames: Frame[] = [];
                for (let i = 0; i < 10; i++) {
                  if (i === 9) {
                    clearedFrames.push({ balls: [null, null, null], score: null });
                  } else {
                    clearedFrames.push({ balls: [null, null], score: null });
                  }
                }
                
                return {
                  ...game,
                  frames: clearedFrames,
                  currentFrame: 1,
                  currentBall: 0,
                  totalScore: 0,
                  gameComplete: false,
                  editingFrame: null,
                  editingBall: null
                };
              }
              return game;
            }),
            savedToDatabase: false
          };
        }
        return session;
      })
    );
  };

  const deleteGame = (sessionId: number, gameId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            games: session.games.filter(game => game.id !== gameId),
            savedToDatabase: false
          };
        }
        return session;
      })
    );
  };

  const handleBallClick = (frameIndex: number, ballIndex: number) => {
    console.log('🔧 Original handleBallClick called with:', {
      frameIndex,
      ballIndex,
      activeGame: !!activeGame,
      gameComplete: activeGame?.gameComplete
    });

    if (!activeGame) {
      console.log('❌ No active game, returning early');
      return;
    }
    const targetBall = activeGame.frames[frameIndex].balls[ballIndex];
    const isCurrentPosition = frameIndex === activeGame.currentFrame && ballIndex === activeGame.currentBall;
    
    console.log('🔧 handleBallClick validation:', {
      targetBall,
      isCurrentPosition,
      currentFrame: activeGame.currentFrame,
      currentBall: activeGame.currentBall,
      gameComplete: activeGame.gameComplete
    });

    if (activeGame.frames[frameIndex].balls[ballIndex] === null && 
        !(frameIndex === activeGame.currentFrame && ballIndex === activeGame.currentBall) &&
        !activeGame.gameComplete) {
      console.log('❌ Blocked by null ball check');
      return;
    }
    
    if (activeGame.gameComplete && activeGame.frames[frameIndex].balls[ballIndex] === null) {
      console.log('❌ Blocked by game complete check');
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

  // Session and game visibility management
  const toggleSessionVisibility = (sessionId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => 
        session.id === sessionId ? { ...session, isVisible: !session.isVisible } : session
      )
    );
  };

  const toggleGameVisibility = (sessionId: number, gameId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            games: session.games.map(game =>
              game.id === gameId ? { ...game, isVisible: !game.isVisible } : game
            ),
            savedToDatabase: false
          };
        }
        return session;
      })
    );
  };

  const renameSession = (sessionId: number, newTitle: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId ? { ...session, title: newTitle, savedToDatabase: false } : session
      )
    );
  };

  const markSessionAsSaved = (sessionId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId ? { ...session, savedToDatabase: true } : session
      )
    );
  };

  const hasUnsavedGames = sessions.some(session => 
    session.isVisible && !session.savedToDatabase
  );

  const fetchUserGames = async () => {
    if (!isAuthenticated) return;
    
    try {
      // This would be implemented if we had actual backend fetching logic
      toast({
        title: "Feature Coming Soon",
        description: "Loading saved games from your account will be available soon.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error fetching user games:', error);
      toast({
        title: "Error",
        description: "Could not load your saved games. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSaveGames = async () => {
    console.log('Attempting to save games for user:', user?.id);
    await saveSessionsToDatabase(sessions, markSessionAsSaved);
  };

  return {
    sessions,
    activeSessionId,
    activeGameId,
    activeSession,
    activeGame,
    setActiveSessionId,
    setActiveGameId,
    updateActiveGame,
    enterPins,
    addSession,
    addGameToSession,
    setupGamesForSession,
    clearGame,
    deleteGame,
    handleBallClick,
    cancelEdit,
    toggleSessionVisibility,
    toggleGameVisibility,
    renameSession,
    markSessionAsSaved,
    hasUnsavedGames,
    fetchUserGames,
    handleSaveGames,
    saveSessionsToDatabase,
    isSaving
  };
};
