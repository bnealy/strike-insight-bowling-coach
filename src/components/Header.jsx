// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header = ({ onSaveGames, hasUnsavedGames }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSaveGames = () => {
    if (onSaveGames) {
      onSaveGames();
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // For debugging purposes
  console.log('Header render - isAuthenticated:', isAuthenticated);
  console.log('Header render - user:', user);

  // Extract display name with fallbacks
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

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
    },
    userInfo: {
      position: 'relative'
    },
    welcomeText: {
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'background-color 0.3s ease'
    },
    userMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
      minWidth: '200px',
      zIndex: 100,
      marginTop: '5px'
    },
    menuItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background-color 0.3s ease'
    },
    menuItemLast: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    button: {
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    saveButton: {
      background: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    saveButtonDisabled: {
      background: '#6c757d',
      cursor: 'not-allowed'
    },
    unsavedIndicator: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      width: '12px',
      height: '12px',
      background: '#ff4444',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    }
  };

  return (
    <>
      <div style={headerStyles.header}>
        <h1 style={headerStyles.logo}>🎳 BowlTracker</h1>
        
        <div style={headerStyles.authSection}>
          {isAuthenticated ? (
            <>
              {hasUnsavedGames && (
                <button
                  onClick={handleSaveGames}
                  style={headerStyles.saveButton}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save Games
                  <div style={headerStyles.unsavedIndicator}></div>
                </button>
              )}
              
              <div style={headerStyles.userInfo}>
                <div
                  style={headerStyles.welcomeText}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Welcome, {displayName}! ▼
                </div>
                
                {showUserMenu && (
                  <div style={headerStyles.userMenu}>
                    <div
                      style={headerStyles.menuItem}
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Open saved games modal
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                      }}
                    >
                      📊 View Saved Games
                    </div>
                    <div
                      style={headerStyles.menuItem}
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Open profile settings
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                      }}
                    >
                      ⚙️ Account Settings
                    </div>
                    <div
                      style={headerStyles.menuItemLast}
                      onClick={handleLogout}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                      }}
                    >
                      🚪 Sign Out
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={headerStyles.button}
              onMouseEnter={(e) => {
                e.target.style.background = '#45a049';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#4CAF50';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Sign In / Create Account
            </button>
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
