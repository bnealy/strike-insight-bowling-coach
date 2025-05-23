
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
    if (currentFrame >= 10 || currentBall >= 3 || gameComplete) return 0;
    
    let maxPins = 10;
    
    if (currentFrame < 9) {
      if (currentBall === 1) {
        maxPins = 10 - (frames[currentFrame].balls[0] || 0);
      }
    } else {
      if (currentBall === 1 && frames[9].balls[0] === 10) {
        maxPins = 10;
      } else if (currentBall === 1 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (currentBall === 2) {
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
