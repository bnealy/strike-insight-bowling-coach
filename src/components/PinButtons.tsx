
import React from 'react';
import { CSSProperties } from 'react';
import { Frame } from '../types/bowlingTypes';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface PinButtonsProps {
  activeFrame: number;
  activeBall: number;
  frames: Frame[];
  enterPins: (pins: number) => void;
}

const PinButtons: React.FC<PinButtonsProps> = ({ 
  activeFrame, 
  activeBall, 
  frames, 
  enterPins 
}) => {
  const getMaxPins = (): number => {
    if (activeFrame >= 10 || activeBall >= 3) return 0;
    
    let maxPins = 10;
    
    if (activeFrame < 9) {
      if (activeBall === 1) {
        maxPins = 10 - (frames[activeFrame].balls[0] || 0);
      }
    } else {
      if (activeBall === 1 && frames[9].balls[0] === 10) {
        maxPins = 10;
      } else if (activeBall === 1 && frames[9].balls[0] !== 10) {
        maxPins = 10 - (frames[9].balls[0] || 0);
      } else if (activeBall === 2) {
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
          onClick={() => enterPins(i)}
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
