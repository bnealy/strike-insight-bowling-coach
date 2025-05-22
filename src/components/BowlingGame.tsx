
import React from 'react';
import { CSSProperties } from 'react';
import { Game } from '../types/bowlingTypes';
import BowlingFrameDisplay from './BowlingFrameDisplay';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface BowlingGameProps {
  game: Game;
  isActive: boolean;
  gameIndex: number;
  setActiveGameId: (id: number) => void;
  clearGame: (id: number) => void;
  handleBallClick: (frameIndex: number, ballIndex: number) => void;
}

const BowlingGame: React.FC<BowlingGameProps> = ({ 
  game, 
  isActive, 
  gameIndex, 
  setActiveGameId, 
  clearGame, 
  handleBallClick 
}) => {
  return (
    <div key={game.id} style={cssProps({ marginBottom: '30px' })}>
      <div style={cssProps({
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        border: isActive ? '3px solid #4CAF50' : '1px solid #ddd'
      })}>
        <div style={cssProps({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        })}>
          <h2 style={cssProps({ 
            margin: 0, 
            color: '#333',
            cursor: 'pointer'
          })} onClick={() => setActiveGameId(game.id)}>
            Game {gameIndex + 1} {isActive ? '(Active)' : ''}
          </h2>
          <button
            onClick={() => clearGame(game.id)}
            style={cssProps({
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer'
            })}
          >
            Clear Game
          </button>
        </div>
        
        <div style={cssProps({ display: 'flex', gap: '2px', marginBottom: '20px' })}>
          {game.frames.map((frame, frameIndex) => (
            <BowlingFrameDisplay
              key={frameIndex}
              frame={frame}
              frameIndex={frameIndex}
              isCurrentFrame={isActive && frameIndex === game.currentFrame}
              isEditing={isActive && game.editingFrame === frameIndex && game.editingBall === frameIndex}
              handleBallClick={handleBallClick}
              frames={game.frames}
            />
          ))}
        </div>
        
        <div style={cssProps({
          textAlign: 'center',
          fontSize: '2em',
          fontWeight: 'bold',
          color: '#333',
          margin: '20px 0'
        })}>
          Total Score: {game.totalScore}
        </div>
        
        {game.gameComplete && (
          <div style={cssProps({
            background: '#4CAF50',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '1.1em',
            marginTop: '15px'
          })}>
            🎉 Game Complete! Final Score: {game.totalScore}
          </div>
        )}
      </div>
    </div>
  );
};

export default BowlingGame;
