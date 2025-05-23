
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './header/UserMenu';
import LoginButton from './header/LoginButton';
import { Save } from 'lucide-react';

const Header = ({ onSaveGames, hasUnsavedGames }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

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
