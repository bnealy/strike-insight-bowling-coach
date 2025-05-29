import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game-entry');
  };

  const viewSavedGames = () => {
    navigate('/saved-games');
  };

  return (
    <>
      <div className="landing-container">
        {/* Background Image - Update this path to your bowling alley photo */}
        <div 
          className="background-image"
          style={{
            backgroundImage: "url('/bowling_alley_photo.jpeg')"
          }}
        />
        
        {/* Dark Overlay */}
        <div className="overlay" />
        
        {/* Header Component */}
        <Header />
        
        {/* Main Content */}
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="main-title">FrameWork</h1>
            <p className="value-proposition">Bowl. Upload your games. Track your stats.</p>
            
            <div className="cta-container">
              <button 
                className="cta-button cta-secondary" 
                onClick={viewSavedGames}>
                view stats
              </button>
              <button className="cta-button cta-primary" onClick={handleStartGame}>
                add a game
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-container {
          position: relative;
          height: 100vh;
          overflow: hidden;
          font-family: 'Comfortaa', cursive;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }

        .hero-container {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding-top: 100px;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          padding: 60px 50px;
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 100%);
          border-radius: 20px;
          animation: fadeIn 1.5s ease-out;
        }

        .main-title {
          font-family: 'Righteous', cursive;
          font-size: 8rem;
          color: white;
          margin-bottom: 40px;
          text-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.3),
            4px 4px 8px rgba(0, 0, 0, 0.2),
            6px 6px 12px rgba(0, 0, 0, 0.1);
          letter-spacing: -3px;
          font-weight: 400;
          text-transform: lowercase;
        }

        .value-proposition {
          font-size: 2.2rem;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 80px;
          font-weight: 300;
          line-height: 1.4;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
          letter-spacing: 1px;
        }

        .cta-container {
          display: flex;
          gap: 50px;
          justify-content: center;
          align-items: center;
        }

        .cta-button {
          padding: 25px 50px;
          font-size: 1.4rem;
          font-weight: 400;
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
          text-decoration: none;
          font-family: 'Comfortaa';
          letter-spacing: 1px;
          border-radius: 60px;
          min-width: 200px;
          text-transform: lowercase;
        }

        .cta-primary {
          background: white;
          color: #a361ac;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .cta-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          background: #f8f8f8;
        }

        .cta-secondary {
          background: transparent;
          color: white;
          border: 3px solid rgba(255, 255, 255, 0.8);
        }

        .cta-secondary:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.15);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-container {
            padding-top: 80px;
          }

          .main-title {
            font-size: 4.5rem;
            margin-bottom: 30px;
          }

          .value-proposition {
            font-size: 1.6rem;
            margin-bottom: 60px;
            padding: 0 20px;
          }

          .cta-container {
            flex-direction: column;
            gap: 30px;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
            padding: 20px 40px;
            font-size: 1.2rem;
          }

          .hero-content {
            padding: 40px 30px;
            margin: 20px;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 3.5rem;
          }

          .value-proposition {
            font-size: 1.3rem;
          }

          .cta-button {
            padding: 18px 35px;
            font-size: 1.1rem;
          }

          .hero-content {
            padding: 30px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default LandingPage;