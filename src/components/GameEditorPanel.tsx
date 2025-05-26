import React from 'react';
import { Frame } from '../types/bowlingTypes';
import PinButtons from './PinButtons';

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
  
  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-md">
      <h3 className="text-lg font-bold text-white mb-4">
        Game {gameIndex + 1} Editor
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
      
      <PinButtons 
        onPinClick={enterPins}
        currentFrame={currentFrame}
        currentBall={currentBall}
        frames={frames}
        editingFrame={editingFrame}
        editingBall={editingBall}
        gameComplete={gameComplete}
      />
    </div>
  );
};

export default GameEditorPanel;
