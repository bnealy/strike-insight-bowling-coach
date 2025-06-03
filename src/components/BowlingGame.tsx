import React from 'react';
import { Game } from '../types/bowlingTypes';
import ResponsiveBowlingFrames from './BowlingFrameDisplay';

interface BowlingGameProps {
  game: Game;
  isActive: boolean;
  gameIndex: number;
  setActiveGameId: (id: number) => void;
  clearGame: () => void;
  handleBallClick: (frameNumber: number, ballIndex: number) => void;
  toggleVisibility: () => void;
  savedStatus: boolean;
  isAuthenticated?: boolean;
  onDeleteGame?: () => void;
  // New props for frame/ball display
  currentFrame?: number;
  currentBall?: number;
  editingFrame?: number | null;
  editingBall?: number | null;
}

const BowlingGame: React.FC<BowlingGameProps> = ({
  game,
  isActive,
  gameIndex,
  setActiveGameId,
  clearGame,
  handleBallClick,
  toggleVisibility,
  savedStatus,
  isAuthenticated = false,
  onDeleteGame,
  currentFrame,
  currentBall,
  editingFrame,
  editingBall
}) => {
  // Determine what to display in the header
  const getHeaderText = () => {
    if (editingFrame !== null && editingFrame !== undefined && editingBall !== null && editingBall !== undefined) {
      return editingFrame === 10 ? 
        `Editing Frame 10 - Ball ${editingBall + 1}` : 
        `Editing Frame ${editingFrame} - ${editingBall === 0 ? 'First' : 'Second'} Ball`;
    } else if (currentFrame && currentBall !== undefined) {
      return currentFrame === 10 ? 
        `Frame 10 - Ball ${currentBall + 1}` : 
        `Frame ${currentFrame} - ${currentBall === 0 ? 'First' : 'Second'} Ball`;
    } else {
      return `Frame ${game.currentFrame || 1} - ${(game.currentBall || 0) === 0 ? 'First' : 'Second'} Ball`;
    }
  };
  return (
    <>
      <div key={game.id} className="bowling-game-container mb-6">
        <div className={`
          bg-white rounded-lg p-5 shadow-lg mb-5 transition-all
          ${isActive ? 'border-4 border-green-500' : 'border border-gray-200'}
        `}>
          <div className="flex justify-between items-center mb-4">
            <h2
              className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setActiveGameId(game.id)}
            >
              {getHeaderText()}
            </h2>
            {/* Commented out Game number in case needed later */}
            {/* <h2>Game {gameIndex + 1}</h2> */}
            <div className="space-x-2">
              {savedStatus && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Saved
                </span>
              )}
              <button
                onClick={clearGame}
                className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
              {isAuthenticated ? (
                <button
                  onClick={toggleVisibility}
                  className="bg-gray-500 text-white text-xs px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  Hide
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile-responsive frames grid */}
          <div className="bowling-frames-wrapper">
            <ResponsiveBowlingFrames
              frames={game.frames}
              currentFrame={game.currentFrame}
              editingFrame={game.editingFrame}
              editingBall={game.editingBall}
              handleBallClick={handleBallClick}
            />
          </div>

          <div className="text-center text-2xl font-bold text-gray-800 my-4">
            Total Score: {game.totalScore}
          </div>

          {game.gameComplete && (
            <div className="bg-green-500 text-white p-3 rounded-lg text-center font-medium mt-3">
              🎉 Game Complete! Final Score: {game.totalScore}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bowling-game-container {
          width: 100%;
        }

        .bowling-frames-wrapper {
          margin-bottom: 20px;
          position: relative;
        }

        .bowling-frames-grid {
          display: grid;
          gap: 8px;
          justify-items: center;
          margin-bottom: 16px;
          
          /* Desktop: Single row of 10 frames */
          grid-template-columns: repeat(10, 1fr);
        }

        /* Desktop styles */
        @media (min-width: 769px) {
          .bowling-frames-grid {
            grid-template-columns: repeat(10, 1fr);
            gap: 12px;
            justify-content: center;
          }
        }

        /* Tablet styles - 5 frames per row */
        @media (max-width: 768px) and (min-width: 481px) {
          .bowling-frames-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            max-width: 100%;
          }
        }

        /* Mobile styles - 3 frames per row */
        @media (max-width: 480px) {
          .bowling-frames-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            padding: 0 4px;
          }

          /* Style the total score for mobile */
          .text-2xl {
            font-size: 1.5rem;
            margin: 16px 0;
          }

          /* Make buttons more mobile-friendly */
          .space-x-2 button {
            font-size: 0.8rem;
            padding: 6px 12px;
          }

          .space-x-2 span {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
        }

        /* Very small mobile styles - still 3 per row but tighter */
        @media (max-width: 360px) {
          .bowling-frames-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            padding: 0 2px;
          }

          .text-2xl {
            font-size: 1.25rem;
          }

          /* Make buttons even more compact */
          .space-x-2 button {
            font-size: 0.7rem;
            padding: 4px 8px;
          }

          .space-x-2 span {
            font-size: 0.7rem;
            padding: 2px 6px;
          }
        }
      `}</style>
    </>
  );
};

export default BowlingGame;