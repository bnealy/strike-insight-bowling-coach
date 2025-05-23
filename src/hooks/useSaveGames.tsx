
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { BowlingSession } from './useBowlingGame';
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from './useUserStats';

export const useSaveGames = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateUserStats } = useUserStats();

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
        const visibleGames = session.games.filter(game => game.isVisible);
        
        if (visibleGames.length === 0) continue;

        // Create session in database
        const { data: sessionData, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .insert([{
            user_id: user.id,
            title: session.title,
            total_games: visibleGames.length
          }])
          .select()
          .single();

        if (sessionError) {
          console.error('Error saving session:', sessionError);
          throw sessionError;
        }

        console.log('Session saved:', sessionData);

        // Save all games in this session
        for (const game of visibleGames) {
          // Insert game
          const { data: gameData, error: gameError } = await supabase
            .from('bowling_games')
            .insert([{
              session_id: sessionData.id,
              game_number: game.id,
              total_score: game.totalScore || 0,
              is_complete: game.gameComplete
            }])
            .select()
            .single();

          if (gameError) {
            console.error('Error saving game:', gameError);
            throw gameError;
          }

          console.log('Game saved:', gameData);

          // Save all frames for this game
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

        // Update user stats with completed games
        const completedGames = visibleGames.filter(game => game.gameComplete);
        if (completedGames.length > 0) {
          await updateUserStats(completedGames);
        }

        // Mark session as saved
        markSessionAsSaved(session.id);
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
