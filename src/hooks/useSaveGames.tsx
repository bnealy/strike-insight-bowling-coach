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
    if (!user) {
      throw new Error("You must be logged in to save games.");
    }

    setIsSaving(true);

    try {
      for (const session of sessions) {
        const savableGames = session.games.filter(game => 
          game.isVisible && 
          Array.isArray(game.frames) && 
          game.frames.length === 10 && 
          game.frames.some(frame => frame.balls.some(ball => ball !== null))
        );
        
        if (savableGames.length === 0) continue;

        const { data: sessionData, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .insert([{
            user_id: user.id,
            title: session.title,
            total_games: savableGames.length
          }])
          .select()
          .single();

        if (sessionError) throw sessionError;

        for (const game of savableGames) {
          const lastScoredFrame = [...game.frames].reverse().find(f => f.score !== null);
          const finalScore = lastScoredFrame?.score || game.totalScore || 0;

          const { data: gameData, error: gameError } = await supabase
            .from('bowling_games')
            .insert([{
              session_id: sessionData.id,
              game_number: game.id,
              total_score: finalScore,
              is_complete: game.gameComplete
            }])
            .select()
            .single();

          if (gameError) throw gameError;

          const frameData = game.frames.map((frame, index) => {
            const frameNumber = index + 1;
            
            if (frameNumber < 1 || frameNumber > 10) {
              throw new Error(`Invalid frame number: ${frameNumber}`);
            }

            return {
              game_id: gameData.id,
              frame_number: frameNumber,
              ball1_pins: frame.balls[0] === null ? null : frame.balls[0],
              ball2_pins: frame.balls[1] === null ? null : frame.balls[1],
              ball3_pins: frameNumber === 10 ? (frame.balls[2] === null ? null : frame.balls[2]) : null,
              score: frame.score === null ? null : frame.score
            };
          });

          for (const frame of frameData) {
            const frameToInsert = {
              game_id: frame.game_id,
              frame_number: frame.frame_number,
              ball1_pins: frame.ball1_pins === null ? null : Math.floor(Number(frame.ball1_pins)),
              ball2_pins: frame.ball2_pins === null ? null : Math.floor(Number(frame.ball2_pins)),
              ball3_pins: frame.ball3_pins === null ? null : Math.floor(Number(frame.ball3_pins)),
              score: frame.score === null ? null : Math.floor(Number(frame.score))
            };

            const { error: singleFrameError } = await supabase
              .from('bowling_frames')
              .insert([frameToInsert])
              .select();

            if (singleFrameError) {
              toast({
                title: "Error Saving Frame",
                description: "Failed to save frame data. The game was saved but some frame data may be missing.",
                variant: "destructive"
              });
              throw singleFrameError;
            }
          }
        }

        markSessionAsSaved(session.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveSessionsToDatabase
  };
};
