
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { BowlingSession } from './useBowlingGame';
import { useToast } from "@/hooks/use-toast";

export const useSaveGames = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveSessionsToDatabase = async (sessions: BowlingSession[], markSessionAsSaved: (sessionId: number) => void) => {
    if (!user || sessions.length === 0) {
      toast({
        title: "Error",
        description: "You must be logged in to save games.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const visibleSessions = sessions.filter(session => session.isVisible && !session.savedToDatabase);
    
    if (visibleSessions.length === 0) {
      toast({
        title: "No Games to Save",
        description: "All visible sessions have already been saved.",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      for (const session of visibleSessions) {
        // Only save games that have been started (have at least one frame with data)
        const savableGames = session.games.filter(game => {
          const isVisible = game.isVisible;
          const hasValidScore = typeof game.totalScore === 'number' && !isNaN(game.totalScore);
          const hasFrameData = game.frames && game.frames.some(frame => 
            frame.balls && frame.balls.some(ball => ball !== null)
          );
          
          console.log('Game save check:', {
            id: game.id,
            isVisible,
            hasValidScore,
            totalScore: game.totalScore,
            hasFrameData,
            shouldSave: isVisible && hasValidScore && hasFrameData
          });
          
          return isVisible && hasValidScore && hasFrameData;
        });
        
        if (savableGames.length === 0) {
          console.log('No savable games in session:', session.title);
          continue;
        }
        
        console.log('Saving session:', session.title, 'with', savableGames.length, 'games');

        // Create session in database
        const { data: sessionData, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .insert([{
            user_id: user.id,
            title: session.title,
            total_games: savableGames.length
          }])
          .select()
          .single();

        if (sessionError) {
          console.error('Error saving session:', sessionError);
          throw sessionError;
        }

        console.log('Created game session:', sessionData);

        // Save games
        for (const game of savableGames) {
          const totalScore = Math.floor(Number(game.totalScore)) || 0;
          
          console.log('Saving game:', game.id, 'with score:', totalScore);
          
          const { data: gameData, error: gameError } = await supabase
            .from('bowling_games')
            .insert([{
              session_id: sessionData.id,
              game_number: game.id,
              total_score: totalScore,
              is_complete: game.gameComplete || false
            }])
            .select()
            .single();

          if (gameError) {
            console.error('Error saving game:', game.id, gameError);
            throw gameError;
          }

          console.log('Game saved successfully:', gameData);

          // Save frames
          const frameData = game.frames.map((frame, index) => ({
            game_id: gameData.id,
            frame_number: index + 1,
            ball1_pins: frame.balls[0],
            ball2_pins: frame.balls[1],
            ball3_pins: index === 9 ? frame.balls[2] : null,
            score: frame.score
          }));

          const { error: framesError } = await supabase
            .from('bowling_frames')
            .insert(frameData);

          if (framesError) {
            console.error('Error saving frames:', framesError);
            throw framesError;
          }

          console.log('Frames saved for game:', gameData.id);
        }

        markSessionAsSaved(session.id);
        console.log('Session marked as saved:', session.id);
      }

      toast({
        title: "Games Saved Successfully",
        description: `Saved ${visibleSessions.length} session${visibleSessions.length !== 1 ? 's' : ''} to your account.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error saving games:', error);
      toast({
        title: "Error Saving Games",
        description: "There was an error saving your games. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveSessionsToDatabase,
    isSaving
  };
};
