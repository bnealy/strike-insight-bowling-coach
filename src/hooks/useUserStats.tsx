
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/bowlingTypes';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  games_played: number;
  average_score: number;
  highest_score: number | null;
  lowest_score: number | null;
  total_strikes: number;
  total_spares: number;
}

export const useUserStats = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Query for fetching user stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async (): Promise<UserStats | null> => {
      if (!isAuthenticated || !user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('user_bowling_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user stats:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Unexpected error fetching stats:', err);
        return null;
      }
    },
    enabled: !!isAuthenticated && !!user?.id,
  });
  
  // Function to update user stats when games are saved
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
  
  return {
    stats,
    isLoading,
    error,
    updateUserStats
  };
};
