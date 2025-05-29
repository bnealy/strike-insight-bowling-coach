import React from 'react';
import PinButtons from './PinButtons';
import { Frame } from '../types/bowlingTypes';

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
  cancelEdit
}) => {
  const isEditing = editingFrame !== null && editingBall !== null;

  // Calculate maximum available pins for current situation
  const getMaxAvailablePins = (): number => {
    const frameIndex = (editingFrame || currentFrame) - 1;
    const ballIndex = editingBall !== null ? editingBall : currentBall;
    
    // For 10th frame, special rules apply
    if (frameIndex === 9) {
      if (ballIndex === 0) {
        return 10; // First ball can always be 0-10
      } else if (ballIndex === 1) {
        const firstBall = frames[frameIndex].balls[0];
        if (firstBall === 10) {
          return 10; // After strike, second ball can be 0-10
        } else {
          return 10 - (firstBall || 0); // Normal spare situation
        }
      } else if (ballIndex === 2) {
        const firstBall = frames[frameIndex].balls[0] || 0;
        const secondBall = frames[frameIndex].balls[1] || 0;
        
        if (firstBall === 10 || firstBall + secondBall === 10) {
          return 10; // After strike or spare, third ball can be 0-10
        } else {
          return 0; // No third ball if no strike or spare
        }
      }
    }
    
    // For frames 1-9
    if (ballIndex === 0) {
      return 10; // First ball can always be 0-10
    } else {
      const firstBall = frames[frameIndex].balls[0] || 0;
      return 10 - firstBall; // Second ball limited by first ball
    }
  };

  const maxPins = getMaxAvailablePins();
  const currentFrameDisplay = editingFrame || currentFrame;
  const currentBallDisplay = editingBall !== null ? editingBall : currentBall;

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-md">
      <h3 className="text-lg font-bold text-white mb-4">
        Game {gameIndex + 1}
      </h3>
      
      {isEditing && (
        <div className="mb-4">
          <button
            onClick={cancelEdit}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors mb-3"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Use PinButtons with viewport-based sizing */}
      <PinButtons
        onPinClick={enterPins}
        currentFrame={currentFrameDisplay}
        currentBall={currentBallDisplay}
        frames={frames}
        editingFrame={editingFrame}
        editingBall={editingBall}
        gameComplete={gameComplete}
      />
    </div>
  );
};

export default GameEditorPanel;