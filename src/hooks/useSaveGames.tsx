
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
        const visibleGames = session.games.filter(game => game.isVisible);
        
        if (visibleGames.length === 0) continue;

        console.log('Attempting to save session:', session.title, 'with games:', visibleGames.length);

        // Create session in database with the correct total_games count
        const { data: sessionData, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .insert([{
            user_id: user.id,
            title: session.title,
            total_games: visibleGames.length // Use actual visible games count
          }])
          .select()
          .single();

        if (sessionError) {
          console.error('Error saving session:', sessionError);
          throw sessionError;
        }

        console.log('Created game session:', sessionData);

        // Save all games in this session
        for (const game of visibleGames) {
          console.log('Saving game:', game.id, 'with total score:', game.totalScore);
          
          // Ensure total_score is never null - use 0 as default
          const totalScore = game.totalScore ?? 0;
          
          // Insert game
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

        // Mark session as saved
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
