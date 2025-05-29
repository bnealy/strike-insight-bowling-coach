import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <div className="not-found-container">
        {/* Background Image - Same as your other pages */}
        <div 
          className="background-image"
          style={{
            backgroundImage: "url('/bowling_alley_photo.jpeg')"
          }}
        />
        
        {/* Dark Overlay */}
        <div className="overlay" />
        
        <div className="content-wrapper">
          <div className="error-content">
            {/* You can replace this with your specific 404 image */}
            <div className="error-image">
            <img 
                src="/licking.gif" 
                alt="404 Bowling Error" 
               className="error-image"
/>
            </div>
            
            <h1 className="error-title">404</h1>
            <h2 className="error-subtitle">Gutter Ball!</h2>
            <p className="error-message">
              Looks like this page rolled right into the gutter. 
              <br />
              Let's get you back on track!
            </p>
            
            <div className="action-buttons">
              <a href="/" className="home-button">
                🏠 Return Home
              </a>
              <a href="/game-entry" className="game-button">
                🎳 Start Bowling
              </a>
            </div>
            
            <div className="fun-message">
              <p>Even the pros throw gutter balls sometimes! 🎯</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          position: relative;
          min-height: 100vh;
          font-family: 'Comfortaa', cursive;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .error-content {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.9) 0%, rgba(160, 82, 45, 0.9) 50%, rgba(205, 133, 63, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .error-image {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .error-title {
          font-size: 6rem;
          font-weight: bold;
          color: white;
          margin: 20px 0 10px 0;
          text-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.5),
            4px 4px 8px rgba(0, 0, 0, 0.3);
          font-family: 'Righteous', cursive;
        }

        .error-subtitle {
          font-size: 2rem;
          color: white;
          margin: 0 0 20px 0;
          font-weight: 600;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }

        .error-message {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 30px 0;
          line-height: 1.6;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .home-button,
        .game-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 25px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          font-family: 'Comfortaa', cursive;
          min-width: 160px;
          justify-content: center;
        }

        .home-button {
          background: white;
          color: #8B4513;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .home-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
          background: #f8f8f8;
        }

        .game-button {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .game-button:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }

        .fun-message {
          margin: 20px 0 0 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .fun-message p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin: 0;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 16px;
          }

          .error-content {
            padding: 30px 20px;
          }

          .error-title {
            font-size: 4rem;
          }

          .error-subtitle {
            font-size: 1.5rem;
          }

          .error-message {
            font-size: 1rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .home-button,
          .game-button {
            width: 100%;
            max-width: 250px;
          }
        }

        @media (max-width: 480px) {
          .error-title {
            font-size: 3rem;
          }

          .error-subtitle {
            font-size: 1.3rem;
          }

          .error-image {
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
};

export default NotFound;