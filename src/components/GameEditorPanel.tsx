
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
  addAnotherGame
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-5 text-center">
      {(!gameComplete || editingFrame !== null) && (
        <>
          <div className="text-white mb-5 text-lg">
            {editingFrame !== null && editingBall !== null ? (
              <>
                Editing Game {gameIndex + 1}, Frame {editingFrame + 1}, Ball {editingBall + 1}
                <button 
                  onClick={cancelEdit}
                  className="ml-4 px-3 py-1 bg-gray-500 text-white border-none rounded text-sm hover:bg-gray-600 transition-colors"
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
      
      <div className="flex gap-4 justify-center mt-5">
        <button 
          onClick={addAnotherGame}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-6 rounded-full text-lg font-medium hover:from-green-500 hover:to-green-700 transition-all shadow-lg"
        >
          Add Another Game
        </button>
      </div>
    </div>
  );
};

export default GameEditorPanel;
