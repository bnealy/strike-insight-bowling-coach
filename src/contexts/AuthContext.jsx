
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
          setSession(existingSession);
          setUser(existingSession.user);
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
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', currentSession?.user?.email);
        toast({
          title: "Successfully signed in",
          description: `Welcome ${currentSession?.user?.email || 'back'}!`,
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

  // Clean up auth state
  const cleanupAuthState = () => {
    console.log('Cleaning up auth state');
    // Remove all auth related items from storage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('bowlingUser');
  };

  const login = async (email, password) => {
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
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during login' };
    }
  };

  const register = async (name, email, password) => {
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
        
        // Save profile info - can be enhanced later to save to BowlerProfiles table
        try {
          const { error: profileError } = await supabase
            .from('BowlerProfiles')
            .insert({
              user_id: data.user.id,
              first_name: name,
              email_address: email,
            });
            
          if (profileError) {
            console.error('Error creating bowler profile:', profileError);
            // Don't return error to user as auth was successful
          } else {
            console.log('Bowler profile created successfully');
          }
        } catch (profileErr) {
          console.error('Unexpected error creating bowler profile:', profileErr);
        }
        
        return { success: true };
      } else {
        console.error('Registration returned no user');
        return { success: false, error: 'No user returned from registration' };
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during registration' };
    }
  };

  const logout = async () => {
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
  };

  const saveGames = async (games) => {
    if (!user) {
      console.error('Cannot save games: User not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      console.log('Attempting to save games for user:', user.id);
      
      // In a real implementation, we would save to Supabase here
      // For now, we'll maintain compatibility with the existing localStorage approach
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        console.error('User not found in localStorage');
        throw new Error('User not found');
      }

      const gameSession = {
        id: Date.now().toString(),
        games: games,
        savedAt: new Date().toISOString(),
        totalGames: games.length
      };

      if (!users[userIndex].savedGames) {
        users[userIndex].savedGames = [];
      }
      
      users[userIndex].savedGames.push(gameSession);
      localStorage.setItem('bowlingUsers', JSON.stringify(users));
      
      console.log('Games saved successfully');
      return { success: true, sessionId: gameSession.id };
    } catch (error) {
      console.error('Error saving games:', error);
      return { success: false, error: error.message };
    }
  };

  const getSavedGames = () => {
    if (!user) {
      console.log('Cannot get saved games: User not logged in');
      return [];
    }

    try {
      console.log('Attempting to get saved games for user:', user.id);
      
      // In a real implementation, we would fetch from Supabase here
      // For now, we'll maintain compatibility with the existing localStorage approach
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      const foundUser = users.find(u => u.id === user.id);
      const savedGames = foundUser?.savedGames || [];
      
      console.log(`Found ${savedGames.length} saved game sessions`);
      return savedGames;
    } catch (error) {
      console.error('Error getting saved games:', error);
      return [];
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    saveGames,
    getSavedGames,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
