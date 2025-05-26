import React from 'react';
import { Game } from '../types/bowlingTypes';
import BowlingFrameDisplay from './BowlingFrameDisplay';

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
  onDeleteGame
}) => {
  return (
    <div key={game.id} className="mb-6">
      <div className={`
        bg-white rounded-lg p-5 shadow-lg mb-5 transition-all
        ${isActive ? 'border-4 border-green-500' : 'border border-gray-200'}
      `}>
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors" 
            onClick={() => setActiveGameId(game.id)}
          >
            Game {gameIndex + 1} {isActive ? '(Active)' : ''}
          </h2>
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
            ) : (
              <button
                onClick={onDeleteGame}
                className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-[2px] mb-5 overflow-x-auto pb-2">
          {game.frames.map((frame, index) => (
            <BowlingFrameDisplay
              key={index}
              frame={frame}
              frameNumber={index + 1}
              isCurrentFrame={isActive && index + 1 === game.currentFrame}
              isEditing={isActive && game.editingFrame === index + 1}
              handleBallClick={handleBallClick}
              frames={game.frames}
            />
          ))}
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
  );
};

export default BowlingGame;
