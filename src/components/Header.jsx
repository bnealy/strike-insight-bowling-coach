
// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './header/UserMenu';
import LoginButton from './header/LoginButton';

const Header = ({ onSaveGames, hasUnsavedGames }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSaveGames = () => {
    if (onSaveGames) {
      onSaveGames();
    }
  };

  const handleLogout = () => {
    logout();
  };

  // For debugging purposes
  console.log('Header render - isAuthenticated:', isAuthenticated);
  console.log('Header render - user:', user);

  const headerStyles = {
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderRadius: '15px'
    },
    logo: {
      color: 'white',
      fontSize: '1.5em',
      fontWeight: 'bold',
      margin: 0
    },
    authSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }
  };

  return (
    <>
      <div style={headerStyles.header}>
        <h1 style={headerStyles.logo}>🎳 BowlTracker</h1>
        
        <div style={headerStyles.authSection}>
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

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </>
  );
};

export default Header;
