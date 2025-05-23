
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/useUserStats';

const UserStatistics = () => {
  const { isAuthenticated } = useAuth();
  const { stats, isLoading } = useUserStats();
  
  // If user is not authenticated, don't show the stats card
  if (!isAuthenticated) return null;
  
  return (
    <Card className="bg-white bg-opacity-95 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Your Bowling Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {isLoading ? (
          // Loading skeleton
          <>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </>
        ) : stats ? (
          // Display stats
          <>
            <StatItem label="Games Played" value={stats.games_played.toString()} />
            <StatItem label="Average Score" value={stats.average_score.toFixed(1)} />
            <StatItem 
              label="Highest Score" 
              value={stats.highest_score ? stats.highest_score.toString() : 'N/A'} 
            />
            <StatItem 
              label="Lowest Score" 
              value={stats.lowest_score ? stats.lowest_score.toString() : 'N/A'} 
            />
            <StatItem label="Total Strikes" value={stats.total_strikes.toString()} />
            <StatItem label="Total Spares" value={stats.total_spares.toString()} />
          </>
        ) : (
          // No stats found
          <div className="col-span-2 text-center py-4">
            <p className="text-muted-foreground">No stats available yet. Start bowling to track your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for displaying each stat item
const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default UserStatistics;
