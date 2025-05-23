import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Create context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to clean up auth state
const cleanupAuthState = () => {
  console.log('Cleaning up auth state');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem('bowlingUser');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and set up listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // First check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (existingSession) {
          console.log('Found existing session:', existingSession.user.email);
          console.log('User data:', JSON.stringify(existingSession.user));
          setSession(existingSession);
          
          // Extract user data with proper name mapping
          const userData = {
            ...existingSession.user,
            name: existingSession.user.user_metadata?.name || existingSession.user.email?.split('@')[0] || 'User'
          };
          console.log('Mapped user data:', JSON.stringify(userData));
          setUser(userData);
        } else {
          console.log('No existing session found');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Extract user data with proper name mapping
        const userData = {
          ...currentSession.user,
          name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User'
        };
        console.log('Setting user with mapped data:', JSON.stringify(userData));
        setUser(userData);
      } else {
        setUser(null);
      }
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', currentSession?.user?.email);
        toast({
          title: "Successfully signed in",
          description: `Welcome ${currentSession?.user?.user_metadata?.name || currentSession?.user?.email?.split('@')[0] || 'back'}!`,
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    });

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const authMethods = {
    login: async (email, password) => {
      try {
        console.log('Attempting login for:', email);
        
        // Clean up existing state first
        cleanupAuthState();
        
        // Try to sign out any existing session
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          console.warn('Error during pre-login signout:', err);
          // Continue even if this fails
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message };
        }
        
        console.log('Login successful:', data.user.email);
        console.log('User data after login:', JSON.stringify(data.user));
        return { success: true };
      } catch (error) {
        console.error('Unexpected login error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred during login' };
      }
    },

    register: async (name, email, password) => {
      try {
        console.log('Attempting registration for:', email);
        
        // Clean up existing state first
        cleanupAuthState();
        
        // Try to sign out any existing session
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          console.warn('Error during pre-registration signout:', err);
          // Continue even if this fails
        }
        
        // Register the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });
        
        if (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message };
        }
        
        if (data?.user) {
          console.log('Registration successful:', data.user.email);
          console.log('User metadata:', JSON.stringify(data.user.user_metadata));
          
          // Create profile in bowlerprofiles table with 250ms delay to ensure auth is settled
          setTimeout(async () => {
            try {
              console.log('Creating bowler profile for user:', data.user.id);
              const { error: profileError } = await supabase
                .from('bowlerprofiles')
                .insert({
                  user_id: data.user.id,
                  first_name: name,
                  email_address: email,
                });
                
              if (profileError) {
                console.error('Error creating bowler profile:', profileError);
              } else {
                console.log('Bowler profile created successfully');
              }
            } catch (profileErr) {
              console.error('Unexpected error creating bowler profile:', profileErr);
            }
          }, 250);
          
          return { success: true };
        } else {
          console.error('Registration returned no user');
          return { success: false, error: 'No user returned from registration' };
        }
      } catch (error) {
        console.error('Unexpected registration error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred during registration' };
      }
    },

    logout: async () => {
      try {
        console.log('Attempting logout');
        
        // Clean up auth state
        cleanupAuthState();
        
        // Sign out
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Logout error:', error);
          return;
        }
        
        console.log('Logout successful');
        
      } catch (error) {
        console.error('Unexpected logout error:', error);
      }
    },
  };

  // Game management methods
  const gameMethods = {
    saveGames: async (games) => {
      if (!user) {
        console.error('Cannot save games: User not logged in');
        return { success: false, error: 'User not logged in' };
      }

      try {
        console.log('Attempting to save games for user:', user.id);
        
        // Create a new game session
        const { data: sessionData, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .insert({
            user_id: user.id,
            title: `Bowling Session ${new Date().toLocaleDateString()}`,
            total_games: games.length
          })
          .select()
          .single();
        
        if (sessionError) {
          console.error('Error creating game session:', sessionError);
          return { success: false, error: sessionError.message };
        }
        
        console.log('Created game session:', sessionData);
        
        // Save each game in the session
        for (let i = 0; i < games.length; i++) {
          const game = games[i];
          
          // Insert the game
          const { data: gameData, error: gameError } = await supabase
            .from('bowling_games')
            .insert({
              session_id: sessionData.id,
              game_number: i + 1,
              total_score: game.totalScore,
              is_complete: game.gameComplete
            })
            .select()
            .single();
          
          if (gameError) {
            console.error(`Error saving game ${i + 1}:`, gameError);
            continue;
          }
          
          console.log(`Saved game ${i + 1}:`, gameData);
          
          // Save each frame for the game
          for (let j = 0; j < game.frames.length; j++) {
            const frame = game.frames[j];
            
            const { error: frameError } = await supabase
              .from('bowling_frames')
              .insert({
                game_id: gameData.id,
                frame_number: j,
                ball1_pins: frame.balls[0],
                ball2_pins: frame.balls[1],
                ball3_pins: j === 9 ? frame.balls[2] : null, // Only 10th frame has a 3rd ball
                score: frame.score
              });
            
            if (frameError) {
              console.error(`Error saving frame ${j + 1} for game ${i + 1}:`, frameError);
            }
          }
        }
        
        toast({
          title: "Games saved",
          description: `Successfully saved ${games.length} game${games.length !== 1 ? 's' : ''} to your profile.`,
        });
        
        return { success: true, sessionId: sessionData.id };
      } catch (error) {
        console.error('Error saving games:', error);
        return { success: false, error: error.message || 'An unexpected error occurred while saving games' };
      }
    },

    getSavedGames: async () => {
      if (!user) {
        console.log('Cannot get saved games: User not logged in');
        return [];
      }

      try {
        console.log('Fetching saved games for user:', user.id);
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('bowling_game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (sessionsError) {
          console.error('Error fetching game sessions:', sessionsError);
          return [];
        }
        
        console.log(`Found ${sessions.length} saved game sessions`);
        return sessions;
      } catch (error) {
        console.error('Error getting saved games:', error);
        return [];
      }
    },
    
    getSavedGameDetails: async (sessionId) => {
      if (!user) {
        console.log('Cannot get saved game details: User not logged in');
        return null;
      }

      try {
        // Fetch the session first to verify user ownership
        const { data: session, error: sessionError } = await supabase
          .from('bowling_game_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();
        
        if (sessionError) {
          console.error('Error fetching game session or unauthorized access:', sessionError);
          return null;
        }
        
        // Fetch games in the session
        const { data: games, error: gamesError } = await supabase
          .from('bowling_games')
          .select('*')
          .eq('session_id', sessionId)
          .order('game_number', { ascending: true });
        
        if (gamesError) {
          console.error('Error fetching games:', gamesError);
          return null;
        }
        
        // Fetch frames for each game
        const gamesWithFrames = [];
        for (const game of games) {
          const { data: frames, error: framesError } = await supabase
            .from('bowling_frames')
            .select('*')
            .eq('game_id', game.id)
            .order('frame_number', { ascending: true });
          
          if (framesError) {
            console.error(`Error fetching frames for game ${game.id}:`, framesError);
            continue;
          }
          
          gamesWithFrames.push({
            ...game,
            frames
          });
        }
        
        return {
          session,
          games: gamesWithFrames
        };
      } catch (error) {
        console.error('Error getting saved game details:', error);
        return null;
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    ...authMethods,
    ...gameMethods,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
