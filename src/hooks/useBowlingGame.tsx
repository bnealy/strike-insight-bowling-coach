import { useState, useEffect, useCallback } from 'react';
import { Game, Frame, SaveGameResult } from '../types/bowlingTypes';
import { calculateScoresForGame } from '../utils/bowlingScoreUtils';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  // Find the active session and game
  const activeSession = sessions.find(session => session.id === activeSessionId) || sessions[0];
  const activeSessionGames = activeSession?.games || [];
  const activeGame = activeSessionGames.find(game => game.id === activeGameId) || activeSessionGames[0];

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
      editingBall: null,
      isVisible: true
    };
  }

  const updateActiveGame = useCallback((updates: Partial<Game>) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            games: session.games.map(game => 
              game.id === activeGameId 
                ? { ...game, ...updates }
                : game
            ),
            savedToDatabase: false // Mark as not saved when changes occur
          };
        }
        return session;
      })
    );
  }, [activeSessionId, activeGameId]);

  useEffect(() => {
    if (!activeGame) return;
    
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
    
    const newGameId = Math.max(...activeSession.games.map(g => g.id)) + 1;
    setActiveGameId(newGameId);
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
                  currentFrame: 0,
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

  const handleBallClick = (frameIndex: number, ballIndex: number) => {
    if (!activeGame) return;
    
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

  // Soft deletion - just toggle visibility
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

  // New function to update user stats when games are saved
  const updateUserStats = async (completedGames: Game[]) => {
    if (!isAuthenticated || !user?.id || completedGames.length === 0) {
      return;
    }
    
    try {
      // Count strikes and spares
      let totalStrikes = 0;
      let totalSpares = 0;
      
      completedGames.forEach(game => {
        game.frames.forEach((frame, index) => {
          // Count strikes
          if (frame.balls[0] === 10) {
            totalStrikes++;
          } 
          // Count spares (not counting after a strike)
          else if (frame.balls[0] !== null && frame.balls[1] !== null && 
                  frame.balls[0]! + frame.balls[1]! === 10) {
            totalSpares++;
          }
          
          // Special case for 10th frame
          if (index === 9) {
            // Count additional strike in 10th frame second ball
            if (frame.balls[1] === 10) {
              totalStrikes++;
            }
            // Count additional strike in 10th frame third ball
            if (frame.balls[2] === 10) {
              totalStrikes++;
            }
            // Count spare in 10th frame if first two balls make 10 (and first wasn't a strike)
            if (frame.balls[0] !== 10 && frame.balls[0] !== null && frame.balls[1] !== null && 
                frame.balls[0]! + frame.balls[1]! === 10) {
              totalSpares++;
            }
          }
        });
      });
      
      // Calculate score metrics
      const scores = completedGames.map(game => game.totalScore || 0);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / scores.length;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      
      // Get current stats
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_bowling_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        console.error('Error fetching user stats:', fetchError);
        return;
      }
      
      // If we have stats, update them
      if (currentStats) {
        const updatedStats = {
          games_played: currentStats.games_played + completedGames.length,
          average_score: ((currentStats.average_score * currentStats.games_played) + totalScore) / 
                          (currentStats.games_played + completedGames.length),
          highest_score: currentStats.highest_score ? 
                          Math.max(currentStats.highest_score, highestScore) : 
                          highestScore,
          lowest_score: currentStats.lowest_score ? 
                          Math.min(currentStats.lowest_score, lowestScore) : 
                          lowestScore,
          total_strikes: currentStats.total_strikes + totalStrikes,
          total_spares: currentStats.total_spares + totalSpares,
          updated_at: new Date().toISOString()
        };
        
        const { error: updateError } = await supabase
          .from('user_bowling_stats')
          .update(updatedStats)
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('Error updating user stats:', updateError);
          return;
        }
      } else {
        // Create new stats record if none exists
        const newStats = {
          user_id: user.id,
          games_played: completedGames.length,
          average_score: averageScore,
          highest_score: highestScore,
          lowest_score: lowestScore,
          total_strikes: totalStrikes,
          total_spares: totalSpares
        };
        
        const { error: insertError } = await supabase
          .from('user_bowling_stats')
          .insert([newStats]);
          
        if (insertError) {
          console.error('Error creating user stats:', insertError);
          return;
        }
      }
      
      // Invalidate the stats query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
    } catch (error) {
      console.error('Unexpected error updating user stats:', error);
    }
  };

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
    clearGame,
    handleBallClick,
    cancelEdit,
    toggleSessionVisibility,
    toggleGameVisibility,
    renameSession,
    markSessionAsSaved,
    hasUnsavedGames,
    fetchUserGames,
    updateUserStats
  };
};
