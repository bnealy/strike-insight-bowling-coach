// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bowlingUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with real authentication
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const userSession = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt
      };

      setUser(userSession);
      localStorage.setItem('bowlingUser', JSON.stringify(userSession));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Simulate API call - replace with real authentication
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists with this email');
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In real app, this would be hashed
        createdAt: new Date().toISOString(),
        savedGames: []
      };

      users.push(newUser);
      localStorage.setItem('bowlingUsers', JSON.stringify(users));

      const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      };

      setUser(userSession);
      localStorage.setItem('bowlingUser', JSON.stringify(userSession));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bowlingUser');
  };

  const saveGames = (games) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
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
      
      return { success: true, sessionId: gameSession.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getSavedGames = () => {
    if (!user) return [];

    try {
      const users = JSON.parse(localStorage.getItem('bowlingUsers') || '[]');
      const foundUser = users.find(u => u.id === user.id);
      return foundUser?.savedGames || [];
    } catch (error) {
      console.error('Error fetching saved games:', error);
      return [];
    }
  };

  const value = {
    user,
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
