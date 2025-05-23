
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
    if (editingFrame === null && (targetFrame >= 10 || targetBall >= 3)) return -1;
    
    let maxPins = 10;
    
    if (targetFrame < 9) {
      if (targetBall === 1) {
        maxPins = 10 - (frames[targetFrame].balls[0] || 0);
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

  const renderButtons = () => {
    const maxPins = getMaxPins();
    
    // Don't render any buttons if maxPins is -1 (invalid frame/ball and not in edit mode)
    if (maxPins < 0) {
      return null;
    }
    
    const buttons = [];
    
    for (let i = 0; i <= maxPins; i++) {
      buttons.push(
        <div
          key={i}
          style={cssProps({
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#4CAF50',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none'
          })}
          onClick={() => onPinClick(i)}
        >
          {i}
        </div>
      );
    }
    
    return buttons;
  };

  return (
    <div style={cssProps({
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center',
      marginBottom: '20px'
    })}>
      {renderButtons()}
    </div>
  );
};

export default PinButtons;
