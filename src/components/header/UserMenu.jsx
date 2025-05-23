
import React, { useState } from 'react';

const UserMenu = ({ user, handleLogout, handleSaveGames, hasUnsavedGames }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Extract display name with fallbacks
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  
  const styles = {
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
      {hasUnsavedGames && (
        <button
          onClick={handleSaveGames}
          style={styles.saveButton}
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
          <div style={styles.unsavedIndicator}></div>
        </button>
      )}
      
      <div style={styles.userInfo}>
        <div
          style={styles.welcomeText}
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
          <div style={styles.userMenu}>
            <div
              style={styles.menuItem}
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
              style={styles.menuItem}
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
              style={styles.menuItemLast}
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
  );
};

export default UserMenu;
