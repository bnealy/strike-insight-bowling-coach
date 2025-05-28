
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
  <div className="flex items-baseline gap-2">
    <h1 className="text-2xl font-bold text-white m-0">🎳 FrameWork</h1>
    <sub className="text-xs text-white text-opacity-70 font-light ml-1">Gutters and strikes</sub>
  </div>  
        <div className="flex items-center gap-4">
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
    </>
  );
};

export default Header;
