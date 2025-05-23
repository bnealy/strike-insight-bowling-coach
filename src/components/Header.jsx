
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './header/UserMenu';
import LoginButton from './header/LoginButton';
import { Save } from 'lucide-react';

const Header = ({ 
  onSaveGames, 
  hasUnsavedGames, 
  onAddGame,
  isAuthenticated,
  setIsAuthModalOpen
}) => {
  const { user, logout } = useAuth();

  const handleSaveGames = () => {
    if (onSaveGames) {
      // Call the save games function
      console.log('Attempting to save games');
      onSaveGames();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md p-4 flex justify-between items-center mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-white m-0">🎳 BowlTracker</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onAddGame}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
          >
            Add Another Game
          </button>
          
          <button
            onClick={handleSaveGames}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
          >
            Save Games
          </button>
          
          {isAuthenticated ? (
            <UserMenu 
              user={user} 
              handleLogout={handleLogout} 
              handleSaveGames={handleSaveGames}
              hasUnsavedGames={hasUnsavedGames}
            />
          ) : (
            <LoginButton onClick={() => setIsAuthModalOpen(true)} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Header;
