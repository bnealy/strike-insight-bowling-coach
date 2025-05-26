import React from 'react';
import { CSSProperties } from 'react';
import { Frame } from '../types/bowlingTypes';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface PinButtonsProps {
  onPinClick: (pins: number) => void;
  currentFrame: number;
  currentBall: number;
  frames: Frame[];
  editingFrame: number | null;
  editingBall: number | null;
  gameComplete: boolean;
}

const PinButtons: React.FC<PinButtonsProps> = ({ 
  onPinClick,
  currentFrame, 
  currentBall, 
  frames,
  editingFrame,
  editingBall,
  gameComplete
}) => {
  const getMaxPins = (): number => {
    // Use editing frame/ball if in edit mode, otherwise use current frame/ball
    const targetFrame = editingFrame !== null ? editingFrame : currentFrame;
    const targetBall = editingBall !== null ? editingBall : currentBall;
    
    // If not in edit mode and no valid target, return -1
    if (editingFrame === null && (targetFrame > 10 || targetBall >= 3)) return -1;
    
    let maxPins = 10;
    const frameIndex = targetFrame - 1; // Convert to 0-based index for array access
    
    if (targetFrame < 10) {
      if (targetBall === 1) {
        maxPins = 10 - (frames[frameIndex].balls[0] || 0);
      }
    } else {
      if (targetBall === 1 && frames[9].balls[0] === 10) {
        maxPins = 10;
      } else if (targetBall === 1 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (targetBall === 2) {
        if (frames[9].balls[0] === 10) {
          if (frames[9].balls[1] === 10) {
            maxPins = 10;
          } else {
            maxPins = 10 - (frames[9].balls[1] || 0);
          }
        } else if ((frames[9].balls[0] || 0) + (frames[9].balls[1] || 0) === 10) {
          maxPins = 10;
        } else {
          maxPins = 0;
        }
      }
    }
    
    return maxPins;
  };
  
  const maxPins = getMaxPins();
  
  if (maxPins < 0 || gameComplete) return null;
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: maxPins + 1 }, (_, i) => (
        <button
          key={i}
          onClick={() => onPinClick(i)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded transition-colors"
        >
          {i === 0 ? '-' : i}
        </button>
      ))}
    </div>
  );
};

export default PinButtons;
