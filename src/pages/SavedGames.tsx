
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, ArrowLeft } from 'lucide-react';
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

const SavedGames = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchSavedSessions();
    }
  }, [user]);

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
      <div className="max-w-4xl mx-auto p-5 min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <p>Loading your saved games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-5 min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          <h1 className="text-2xl font-bold text-white">Your Saved Games</h1>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md border-white border-opacity-20">
          <CardContent className="p-6 text-center text-white">
            <p>No saved games found. Start bowling to see your sessions here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md border-white border-opacity-20">
              <Collapsible open={expandedSessions.has(session.id)} onOpenChange={() => toggleSessionExpansion(session.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white hover:bg-opacity-5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedSessions.has(session.id) ? (
                          <ChevronDown className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white" />
                        )}
                        <div>
                          <CardTitle className="text-white text-lg">{session.title}</CardTitle>
                          <div className="text-white text-sm opacity-80">
                            {format(new Date(session.created_at), 'MMMM dd, yyyy')} • {session.total_games} games • Avg: {calculateAverageScore(session.games)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-semibold">Games in this session:</h3>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-white border-white hover:bg-white hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Session
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {session.games.map((game) => (
                        <div key={game.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">Game {game.game_number}</span>
                            <span className="text-white font-bold text-lg">
                              {game.is_complete ? game.total_score : 'In Progress'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-10 gap-1">
                            {game.frames.map((frame) => (
                              <div key={frame.frame_number} className="bg-white bg-opacity-20 rounded p-2 text-center">
                                <div className="text-white text-xs mb-1">Frame {frame.frame_number}</div>
                                <div className="text-white text-sm">
                                  {frame.frame_number === 10 ? (
                                    <div className="flex flex-col">
                                      <div className="flex justify-center gap-1">
                                        <span>{frame.ball1_pins ?? '-'}</span>
                                        <span>{frame.ball2_pins ?? '-'}</span>
                                        <span>{frame.ball3_pins ?? '-'}</span>
                                      </div>
                                      <div className="font-bold">{frame.score ?? ''}</div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col">
                                      <div className="flex justify-center gap-1">
                                        <span>{frame.ball1_pins ?? '-'}</span>
                                        <span>{frame.ball2_pins ?? '-'}</span>
                                      </div>
                                      <div className="font-bold">{frame.score ?? ''}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedGames;
