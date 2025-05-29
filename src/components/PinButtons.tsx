import React from 'react';
import { Frame } from '../types/bowlingTypes';

interface PinButtonsProps {
  onPinClick: (pins: number) => void;
  currentFrame: number;
  currentBall: number;
  frames: Frame[];
  editingFrame: number | null;
  editingBall: number | null;
  gameComplete: boolean;
  // New props for responsive sizing
  availableWidth?: number;
  availableHeight?: number;
}

const PinButtons: React.FC<PinButtonsProps> = ({
  onPinClick,
  currentFrame,
  currentBall,
  frames,
  editingFrame,
  editingBall,
  gameComplete,
  availableWidth,
  availableHeight
}) => {
  // Calculate maximum available pins for current situation
  const getMaxAvailablePins = (): number => {
    // Safety check for frames
    if (!frames || frames.length === 0) {
      return 10; // Default to allowing all pins if frames not available
    }

    const frameIndex = (editingFrame || currentFrame) - 1;
    const ballIndex = editingBall !== null ? editingBall : currentBall;
    
    // Ensure frameIndex is valid
    if (frameIndex < 0 || frameIndex >= frames.length) {
      return 10; // Default to allowing all pins
    }
    
    // For 10th frame, special rules apply
    if (frameIndex === 9) {
      if (ballIndex === 0) {
        return 10; // First ball can always be 0-10
      } else if (ballIndex === 1) {
        const firstBall = frames[frameIndex]?.balls?.[0];
        if (firstBall === 10) {
          return 10; // After strike, second ball can be 0-10
        } else {
          return 10 - (firstBall || 0); // Normal spare situation
        }
      } else if (ballIndex === 2) {
        const firstBall = frames[frameIndex]?.balls?.[0] || 0;
        const secondBall = frames[frameIndex]?.balls?.[1] || 0;
        
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
      const firstBall = frames[frameIndex]?.balls?.[0] || 0;
      return 10 - firstBall; // Second ball limited by first ball
    }
  };

  const maxValue = getMaxAvailablePins();
  
  // Calculate available options (0 to maxValue)
  const availableOptions = Array.from({ length: maxValue + 1 }, (_, i) => i);
  
  // Separate center value (max) from outer values
  const centerValue = maxValue;
  const outerValues = availableOptions.filter(val => val !== maxValue);
  
  // Calculate positions for outer buttons in a circle
  const getButtonPosition = (index: number, total: number, radius: number) => {
    // Start from top and go clockwise
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angle };
  };

  // Determine circle size based on available space from parent or screen size
  const getCircleSize = () => {
    const buttonCount = outerValues.length;
    
    // Use provided dimensions if available, otherwise fall back to screen size
    let availableHeight;
    if (availableHeight) {
      // Use the provided height constraint
      availableHeight = availableHeight;
    } else if (typeof window !== 'undefined') {
      // Fallback to screen height
      availableHeight = window.innerHeight * 0.6;
    } else {
      // Server-side rendering fallback
      return {
        containerSize: 300,
        radius: 100,
        centerButtonSize: 60,
        outerButtonWidth: 50,
        outerButtonHeight: 35
      };
    }
    
    // Size everything based on available height
    // Circle should take up about 80% of available height to leave some padding
    let containerSize = Math.min(availableHeight * 0.8, 500); // Cap at 500px max
    
    // Ensure minimum usable size
    containerSize = Math.max(containerSize, 200);
    
    // Calculate other elements proportionally
    const centerButtonSize = containerSize * 0.2; // 20% of container
    const radius = containerSize * 0.35; // 35% of container for positioning
    
    return {
      containerSize,
      radius,
      centerButtonSize,
      outerButtonWidth: buttonCount <= 6 ? centerButtonSize * 0.8 : centerButtonSize * 0.7,
      outerButtonHeight: buttonCount <= 6 ? centerButtonSize * 0.5 : centerButtonSize * 0.45
    };
  };

  // Use effect to handle window resize (only if no explicit dimensions provided)
  const [circleSize, setCircleSize] = React.useState(() => getCircleSize());
  
  React.useEffect(() => {
    // Only set up resize listener if we're not getting explicit dimensions
    if (!availableWidth || !availableHeight) {
      const handleResize = () => {
        setCircleSize(getCircleSize());
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // Update size when available dimensions change
      setCircleSize(getCircleSize());
    }
  }, [availableWidth, availableHeight, outerValues.length]);

  const { containerSize, radius, centerButtonSize, outerButtonWidth, outerButtonHeight } = circleSize;

  // Handle button click
  const handlePinClick = (pins: number) => {
    onPinClick(pins);
  };

  // Get button styling based on value
  const getButtonStyle = (value: number, isCenter: boolean, sliceIndex?: number, totalSlices?: number) => {
    const baseStyle = {
      position: 'absolute' as const,
      border: 'none',
      fontFamily: "'Comfortaa', cursive",
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    };

    if (isCenter) {
      return {
        ...baseStyle,
        width: `${centerButtonSize}px`,
        height: `${centerButtonSize}px`,
        fontSize: `${centerButtonSize * 0.35}px`,
        borderRadius: '50%',
        background: value === 10 ? 
          'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : // Gold for strike
          'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', // Green for spare
        color: 'white',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      };
    } else {
      // Create pizza slice shape with consistent angle calculation
      const sliceAngle = 360 / (totalSlices || 1);
      const bufferAngle = 1; // Small buffer angle in degrees between slices
      
      const startAngle = (sliceIndex || 0) * sliceAngle - 90 + bufferAngle; // Start from top with buffer
      const endAngle = startAngle + sliceAngle - (bufferAngle * 2); // End with buffer
      
      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      // Create multiple points along the arc to form a smooth circular edge
      const arcPoints = [];
      const numArcPoints = Math.max(8, Math.ceil(sliceAngle / 10)); // More points for larger slices
      
      for (let i = 0; i <= numArcPoints; i++) {
        const angle = startRad + (endRad - startRad) * (i / numArcPoints);
        const x = 50 + 50 * Math.cos(angle);
        const y = 50 + 50 * Math.sin(angle);
        arcPoints.push(`${x}% ${y}%`);
      }
      
      return {
        ...baseStyle,
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        fontSize: `${centerButtonSize * 0.25}px`,
        // Create pizza slice with curved outer edge and translucent buffers
        clipPath: `polygon(50% 50%, ${arcPoints.join(', ')})`,
        background: value === 0 ? 
          'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)' : // Gray for gutter
          'linear-gradient(135deg, #D3D3D3 0%, #D3D3D3 100%)', // Blue for regular pins
        color: 'white',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      };
    }
  };

  const currentFrameDisplay = editingFrame || currentFrame;
  const currentBallDisplay = editingBall !== null ? editingBall : currentBall;

  return (
    <div className="pin-selector-container">
      {/* Commented out frame/ball text for more space */}
      {/* <div className="instruction-text">
        {currentFrameDisplay === 10 ? 
          `Frame 10 - Ball ${currentBallDisplay + 1}` : 
          `Frame ${currentFrameDisplay} - ${currentBallDisplay === 0 ? 'First' : 'Second'} Ball`
        }
      </div> */}
      
      <div 
        className="pin-circle-container"
        style={{
          width: `${containerSize}px`,
          height: `${containerSize}px`,
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {/* Center button (Strike/Spare) */}
        <button
          style={getButtonStyle(centerValue, true)}
          onClick={() => handlePinClick(centerValue)}
          className="center-button"
        >
          {centerValue === 10 ? 'X' : '/'}
        </button>

        {/* Outer pizza slice buttons */}
        {outerValues.map((value, index) => {
          // Use consistent angle calculation for both slice and text
          const sliceAngle = 360 / outerValues.length;
          const startAngle = index * sliceAngle - 90; // Start from top (-90 degrees)
          const centerAngle = startAngle + sliceAngle / 2; // Center of the slice
          
          // Position text further from center
          const textRadius = radius * 0.8; // Increased from 0.7 to 0.8
          const textX = Math.cos(centerAngle * Math.PI / 180) * textRadius;
          const textY = Math.sin(centerAngle * Math.PI / 180) * textRadius;
          
          return (
            <div key={`slice-${value}`} style={{ position: 'absolute', width: '100%', height: '100%' }}>
              {/* Pizza slice button */}
              <button
                style={getButtonStyle(value, false, index, outerValues.length)}
                onClick={() => handlePinClick(value)}
                className="slice-button"
              />
              
              {/* Number text positioned at center of slice */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${textX}px, ${textY}px)`,
                  color: 'black',
                  fontSize: `${centerButtonSize * 0.6}px`,
                  fontWeight: 'bold',
                  fontFamily: "'Comfortaa'",
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)',
                  zIndex: 15,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {value === 0 ? '-' : value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Commented out help text for more space */}
      {/* <div className="help-text">
        {centerValue === 10 ? 
          'Strike (X) in center, other values around' : 
          `${centerValue} for spare in center, other values around`
        }
      </div> */}

      <style jsx>{`
        .pin-selector-container {
          padding: 10px;
          text-align: center;
          margin: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 250px;
        }

        .pin-circle-container {
          user-select: none;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .center-button:hover {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .slice-button:hover {
          filter: brightness(1.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .center-button:active {
          transform: translate(-50%, -50%) scale(0.95);
        }

        .slice-button:active {
          filter: brightness(0.8);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .pin-selector-container {
            padding: 8px;
          }
        }

        @media (max-width: 480px) {
          .pin-selector-container {
            padding: 5px;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .center-button, .outer-button {
            transition: none;
          }
          
          .center-button:hover, .outer-button:hover {
            transform: translate(-50%, -50%);
          }
        }

        /* Touch-friendly enhancements */
        @media (hover: none) and (pointer: coarse) {
          .center-button:hover, .slice-button:hover {
            transform: translate(-50%, -50%);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            filter: none;
          }
          
          .center-button:active {
            transform: translate(-50%, -50%) scale(0.95);
          }
          
          .slice-button:active {
            filter: brightness(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default PinButtons;