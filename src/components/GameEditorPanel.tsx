
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
  addAnotherGame: () => void;
  gameCount: number;
  showSaveButton?: boolean;
  onSaveGames?: () => void;
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
  gameCount,
  showSaveButton = false,
  onSaveGames
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
        gameComplete={false}
      />

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={addAnotherGame}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
        >
          Add Another Game
        </button>
        
        {showSaveButton && onSaveGames && (
          <button
            onClick={onSaveGames}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
          >
            Save Games
          </button>
        )}
      </div>
    </div>
  );
};

export default GameEditorPanel;
