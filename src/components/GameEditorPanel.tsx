
import React, { CSSProperties } from 'react';
import PinButtons from './PinButtons';
import { Frame } from '../types/bowlingTypes';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface GameEditorPanelProps {
  gameIndex: number;
  currentFrame: number;
  currentBall: number;
  frames: Frame[];
  editingFrame: number | null;
  editingBall: number | null;
  gameComplete: boolean;
  enterPins: (pins: number) => void;
  cancelEdit: () => void;
  addAnotherGame: () => void;
  gameCount: number;
}

const GameEditorPanel: React.FC<GameEditorPanelProps> = ({
  gameIndex,
  currentFrame,
  currentBall,
  frames,
  editingFrame,
  editingBall,
  gameComplete,
  enterPins,
  cancelEdit,
  addAnotherGame,
  gameCount
}) => {
  return (
    <div style={cssProps({
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '20px',
      textAlign: 'center'
    })}>
      {(!gameComplete || editingFrame !== null) && (
        <>
          <div style={cssProps({
            color: 'white',
            marginBottom: '20px',
            fontSize: '1.2em'
          })}>
            {editingFrame !== null && editingBall !== null ? (
              <>
                Editing Game {gameIndex + 1}, Frame {editingFrame + 1}, Ball {editingBall + 1}
                <button 
                  onClick={cancelEdit}
                  style={cssProps({
                    marginLeft: '15px',
                    padding: '5px 10px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  })}
                >
                  Cancel Edit
                </button>
              </>
            ) : gameComplete ? (
              "Click any ball to edit"
            ) : (
              `Game ${gameIndex + 1} - Frame ${currentFrame + 1}, Ball ${currentBall + 1}`
            )}
          </div>
          
          <PinButtons
            activeFrame={editingFrame !== null ? editingFrame : currentFrame}
            activeBall={editingBall !== null ? editingBall : currentBall}
            frames={frames}
            enterPins={enterPins}
          />
        </>
      )}
      
      <div style={cssProps({ display: 'flex', gap: '10px', justifyContent: 'center' })}>
        {gameCount < 2 && (
          <button 
            onClick={addAnotherGame}
            style={cssProps({
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer'
            })}
          >
            Add Another Game
          </button>
        )}
      </div>
    </div>
  );
};

export default GameEditorPanel;
