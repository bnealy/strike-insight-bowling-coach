import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const viewSavedGames = () => {
    setShowUserMenu(false);
    navigate('/saved-games');
  };

  const accountSettings = () => {
    setShowUserMenu(false);
    console.log('Opening account settings...');
  };

  const signOut = () => {
    handleLogout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.getElementById('userMenu');
      if (userMenu && !userMenu.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo">FrameWork</h1>
            <sub className="tagline">Strikes and gutters</sub>
          </div>
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu" id="userMenu">
                <div className="welcome-text" onClick={toggleUserMenu}>
                  Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}! ▼
                </div>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="menu-item" onClick={viewSavedGames}>
                      📊 View Saved Games
                    </div>
                    <div className="menu-item" onClick={accountSettings}>
                      ⚙️ Account Settings
                    </div>
                    <div className="menu-item" onClick={signOut}>
                      🚪 Sign Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      <style jsx>{`
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 20;
          padding: 20px;
        }

        .header-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo-section {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          margin: 0;
          font-family: 'Comfortaa', cursive;
        }

        .tagline {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 300;
          margin-left: 4px;
          font-family: 'Comfortaa', cursive;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-menu {
          position: relative;
        }

        .welcome-text {
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background-color 0.3s ease;
          font-family: 'Comfortaa', cursive;
        }

        .welcome-text:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          min-width: 200px;
          z-index: 100;
          margin-top: 5px;
        }

        .menu-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.3s ease;
          color: #333;
          font-family: 'Comfortaa', cursive;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item:hover {
          background-color: #f8f9fa;
        }

        .login-btn {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Comfortaa', cursive;
          font-size: 0.875rem;
        }

        .login-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header {
            padding: 15px;
          }

          .header-content {
            padding: 12px 16px;
          }

          .logo {
            font-size: 1.25rem;
          }

          .tagline {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;