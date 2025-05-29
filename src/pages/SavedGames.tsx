import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, ArrowLeft, TrendingUp, Target, Trophy, Zap, Award, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SavedSession {
  id: string;
  title: string;
  created_at: string;
  total_games: number;
  games: SavedGame[];
}

interface SavedGame {
  id: string;
  game_number: number;
  total_score: number;
  is_complete: boolean;
  frames: SavedFrame[];
}

interface SavedFrame {
  frame_number: number;
  ball1_pins: number | null;
  ball2_pins: number | null;
  ball3_pins: number | null;
  score: number | null;
}

interface UserBowlingStats {
  games_played: number;
  average_score: number;
  highest_score: number | null;
  lowest_score: number | null;
  total_strikes: number;
  total_spares: number;
  last_calculated_at: string;
}

interface AdditionalStats {
  recentGames: Array<{total_score: number; created_at: string}>;
  thisMonthGames: Array<{total_score: number; created_at: string}>;
  allCompletedGames: Array<{total_score: number; created_at: string}>;
}

const SavedGames = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [userStats, setUserStats] = useState<UserBowlingStats | null>(null);
  const [additionalStats, setAdditionalStats] = useState<AdditionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchSavedSessions();
      fetchUserStats();
      fetchAdditionalStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // First try to get existing stats
      let { data: existingStats, error: fetchError } = await supabase
        .from('user_bowling_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no stats exist, refresh them
      if (!existingStats) {
        const { error: refreshError } = await supabase.rpc('refresh_user_bowling_stats', {
          target_user_id: user.id
        });

        if (refreshError) {
          console.error('Error refreshing stats:', refreshError);
          // Continue without stats rather than failing completely
          return;
        }

        // Fetch the newly created stats
        const { data: refreshedStats, error: refetchError } = await supabase
          .from('user_bowling_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (refetchError) throw refetchError;
        existingStats = refreshedStats;
      }

      setUserStats(existingStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Don't show error toast for stats - it's not critical to the page function
    }
  };

  const fetchAdditionalStats = async () => {
    try {
      // Use a simpler query approach - fetch games directly
      const { data: gameData, error: gameError } = await supabase
        .from('bowling_games')
        .select(`
          total_score,
          is_complete,
          created_at,
          bowling_game_sessions!inner (
            user_id
          )
        `)
        .eq('bowling_game_sessions.user_id', user.id)
        .eq('is_complete', true)
        .order('created_at', { ascending: false });

      if (gameError) {
        console.error('Error fetching additional stats:', gameError);
        return;
      }

      console.log('Successfully fetched game data:', gameData);

      const allGames = gameData || [];

      setAdditionalStats({
        recentGames: allGames.slice(0, 5),
        thisMonthGames: allGames.filter(game => {
          const gameDate = new Date(game.created_at);
          const now = new Date();
          return gameDate.getMonth() === now.getMonth() && 
                 gameDate.getFullYear() === now.getFullYear();
        }),
        allCompletedGames: allGames
      });

    } catch (error) {
      console.error('Error fetching additional stats:', error);
    }
  };

  const fetchSavedSessions = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions with games and frames
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('bowling_game_sessions')
        .select(`
          id,
          title,
          created_at,
          total_games,
          bowling_games (
            id,
            game_number,
            total_score,
            is_complete,
            bowling_frames (
              frame_number,
              ball1_pins,
              ball2_pins,
              ball3_pins,
              score
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const formattedSessions: SavedSession[] = sessionsData?.map(session => ({
        id: session.id,
        title: session.title,
        created_at: session.created_at,
        total_games: session.total_games,
        games: session.bowling_games?.map(game => ({
          id: game.id,
          game_number: game.game_number,
          total_score: game.total_score,
          is_complete: game.is_complete,
          frames: game.bowling_frames?.sort((a, b) => a.frame_number - b.frame_number) || []
        }))?.sort((a, b) => a.game_number - b.game_number) || []
      })) || [];

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching saved sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load saved games. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate basic stats (working)
  const calculateStrikePercentage = () => {
    if (!userStats || userStats.games_played === 0) return 0;
    const totalFrames = userStats.games_played * 10;
    return Math.round((userStats.total_strikes / totalFrames) * 100);
  };

  const calculateSparePercentage = () => {
    if (!userStats || userStats.games_played === 0) return 0;
    const totalFrames = userStats.games_played * 10;
    const possibleSpareFrames = totalFrames - userStats.total_strikes;
    if (possibleSpareFrames === 0) return 0;
    return Math.round((userStats.total_spares / possibleSpareFrames) * 100);
  };

  // COMMENTED OUT - Advanced stats causing loading issues
   const calculateRecentAverage = () => {
     if (!additionalStats?.recentGames || additionalStats.recentGames.length === 0) return 0;
     const total = additionalStats.recentGames.reduce((sum, game) => sum + game.total_score, 0);
     return Math.round(total / additionalStats.recentGames.length);
   };

   const calculateThisMonthAverage = () => {
     if (!additionalStats?.thisMonthGames || additionalStats.thisMonthGames.length === 0) return 0;
     const total = additionalStats.thisMonthGames.reduce((sum, game) => sum + game.total_score, 0);
     return Math.round(total / additionalStats.thisMonthGames.length);
   };

   const getTrendIndicator = (recent: number, overall: number) => {
     if (recent > overall) return { text: '↗️', color: 'text-green-300' };
     if (recent < overall) return { text: '↘️', color: 'text-red-300' };
     return { text: '→', color: 'text-yellow-300' };
 };

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const calculateAverageScore = (games: SavedGame[]) => {
    const completedGames = games.filter(game => game.is_complete && game.total_score > 0);
    if (completedGames.length === 0) return 0;
    const total = completedGames.reduce((sum, game) => sum + game.total_score, 0);
    return Math.round(total / completedGames.length);
  };

  const handleEditSession = (sessionId: string) => {
    // TODO: Implement session editing functionality
    toast({
      title: "Coming Soon",
      description: "Session editing functionality will be available soon.",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <>
        <div className="saved-games-container">
          {/* Background Image */}
          <div 
            className="background-image"
            style={{
              backgroundImage: "url('/bowling_alley_photo.jpeg')"
            }}
          />
          
          {/* Dark Overlay */}
          <div className="overlay" />
          
          <div className="content-wrapper">
            <div className="loading-content">
              <p>Loading your saved games...</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .saved-games-container {
            position: relative;
            min-height: 100vh;
            font-family: 'Comfortaa', cursive;
          }

          .background-image {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }

          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1;
          }

          .content-wrapper {
            position: relative;
            z-index: 10;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .loading-content {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50vh;
            color: white;
            font-size: 1.2rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="saved-games-container">
        {/* Background Image */}
        <div 
          className="background-image"
          style={{
            backgroundImage: "url('/bowling_alley_photo.jpeg')"
          }}
        />
        
        {/* Dark Overlay */}
        <div className="overlay" />
        
        <div className="content-wrapper">
          {/* Header */}
          <div className="header-section">
            <div className="header-actions">
              <button
                onClick={() => navigate('/')}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game
              </button>
              <h1 className="page-title">Your Saved Games</h1>
            </div>

            {/* User Stats Section */}
            {userStats && (
              <div className="stats-grid">
                {/* Basic Stats */}
                <div className="stat-card">
                  <div className="stat-header">
                    <Trophy className="w-5 h-5 text-yellow-300 mr-2" />
                    <span className="stat-label">Games Played</span>
                  </div>
                  <p className="stat-value">{userStats.games_played}</p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <TrendingUp className="w-5 h-5 text-green-300 mr-2" />
                    <span className="stat-label">Average Score</span>
                  </div>
                  <p className="stat-value">{Number(userStats.average_score).toFixed(0)}</p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <Target className="w-5 h-5 text-red-300 mr-2" />
                    <span className="stat-label">High Score</span>
                  </div>
                  <p className="stat-value">{userStats.highest_score || 'N/A'}</p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <Zap className="w-5 h-5 text-blue-300 mr-2" />
                    <span className="stat-label">Strike %</span>
                  </div>
                  <p className="stat-value">{calculateStrikePercentage()}%</p>
                  <p className="stat-sub">{userStats.total_strikes} strikes</p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <Award className="w-5 h-5 text-purple-300 mr-2" />
                    <span className="stat-label">Spare %</span>
                  </div>
                  <p className="stat-value">{calculateSparePercentage()}%</p>
                  <p className="stat-sub">{userStats.total_spares} spares</p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <Calendar className="w-5 h-5 text-orange-300 mr-2" />
                    <span className="stat-label">Recent Trend</span>
                  </div>
                  {additionalStats && additionalStats.recentGames.length > 0 ? (
                    <>
                      <div className="trend-container">
                        <p className="stat-value">{calculateRecentAverage()}</p>
                        <span className={`trend-indicator ${getTrendIndicator(calculateRecentAverage(), Number(userStats.average_score)).color}`}>
                          {getTrendIndicator(calculateRecentAverage(), Number(userStats.average_score)).text}
                        </span>
                      </div>
                      <p className="stat-sub">Last {additionalStats.recentGames.length} games</p>
                    </>
                  ) : (
                    <p className="stat-value">N/A</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sessions Section */}
          {sessions.length === 0 ? (
            <div className="no-sessions-card">
              <p>No saved games found. Start bowling to see your sessions here!</p>
            </div>
          ) : (
            <div className="sessions-container">
              {sessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div 
                    className="session-header"
                    onClick={() => toggleSessionExpansion(session.id)}
                  >
                    <div className="session-info">
                      {expandedSessions.has(session.id) ? (
                        <ChevronDown className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-white" />
                      )}
                      <div className="session-details">
                        <h3 className="session-title">{session.title}</h3>
                        <div className="session-meta">
                          {format(new Date(session.created_at), 'MMMM dd, yyyy')} • {session.total_games} games • Avg: {calculateAverageScore(session.games)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSessions.has(session.id) && (
                    <div className="session-content">
                      <div className="games-header">
                        <h4>Games in this session:</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSession(session.id);
                          }}
                          className="edit-button"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Session
                        </button>
                      </div>
                      
                      <div className="games-list">
                        {session.games.map((game) => (
                          <div key={game.id} className="game-card">
                            <div className="game-header">
                              <span className="game-number">Game {game.game_number}</span>
                              <span className="game-score">
                                {game.is_complete ? game.total_score : 'In Progress'}
                              </span>
                            </div>
                            
                            <div className="frames-grid">
                              {game.frames.map((frame) => (
                                <div key={frame.frame_number} className="frame-card">
                                  <div className="frame-number">Frame {frame.frame_number}</div>
                                  <div className="frame-content">
                                    {frame.frame_number === 10 ? (
                                      <div className="frame-display">
                                        <div className="balls-display">
                                          <span>{frame.ball1_pins ?? '-'}</span>
                                          <span>{frame.ball2_pins ?? '-'}</span>
                                          <span>{frame.ball3_pins ?? '-'}</span>
                                        </div>
                                        <div className="frame-score">{frame.score ?? ''}</div>
                                      </div>
                                    ) : (
                                      <div className="frame-display">
                                        <div className="balls-display">
                                          <span>{frame.ball1_pins ?? '-'}</span>
                                          <span>{frame.ball2_pins ?? '-'}</span>
                                        </div>
                                        <div className="frame-score">{frame.score ?? ''}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .saved-games-container {
          position: relative;
          min-height: 100vh;
          font-family: 'Comfortaa', cursive;
        }

        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .header-section {
          margin-bottom: 30px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .back-button {
          display: flex;
          align-items: center;
          background: rgba(139, 69, 19, 0.8);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Comfortaa', cursive;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .back-button:hover {
          background: rgba(139, 69, 19, 0.9);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-2px);
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 100%);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .stat-label {
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-value {
          color: white;
          font-size: 2rem;
          font-weight: bold;
          margin: 8px 0;
        }

        .stat-sub {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          margin: 0;
        }

        .trend-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .trend-indicator {
          font-size: 1.2rem;
        }

        .no-sessions-card {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 0%);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          color: white;
        }

        .sessions-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .session-card {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 80%);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .session-header {
          cursor: pointer;
          padding: 20px;
          transition: background-color 0.3s ease;
        }

        .session-header:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .session-details {
          flex: 1;
        }

        .session-title {
          color: white;
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0 0 4px 0;
        }

        .session-meta {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .session-content {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px;
        }

        .games-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .games-header h4 {
          color: white;
          font-weight: 600;
          margin: 0;
        }

        .edit-button {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .edit-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .games-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .game-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .game-number {
          color: white;
          font-weight: 600;
        }

        .game-score {
          color: white;
          font-weight: bold;
          font-size: 1.125rem;
        }

        .frames-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
        }

        .frame-card {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 8px;
          text-align: center;
        }

        .frame-number {
          color: white;
          font-size: 0.75rem;
          margin-bottom: 4px;
        }

        .frame-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .balls-display {
          display: flex;
          justify-content: center;
          gap: 4px;
          color: white;
          font-size: 0.875rem;
        }

        .frame-score {
          color: white;
          font-weight: bold;
          font-size: 0.875rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 16px;
          }

          .header-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .frames-grid {
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 4px;
          }

          .games-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default SavedGames;