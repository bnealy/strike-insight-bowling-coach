import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ user, handleLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  
  // Extract display name with fallbacks
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  
  const handleViewSavedGames = () => {
    setShowUserMenu(false);
    navigate('/saved-games');
  };
  
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
    }
  };

  return (
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
            onClick={handleViewSavedGames}
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
  );
};

export default UserMenu;