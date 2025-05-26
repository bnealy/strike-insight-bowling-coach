import React from 'react';
import { Frame } from '../types/bowlingTypes';
import { formatBall } from '../utils/bowlingScoreUtils';
import { CSSProperties } from 'react';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface BowlingFrameDisplayProps {
  frame: Frame;
  frameNumber: number;
  isCurrentFrame: boolean;
  isEditing: boolean;
  handleBallClick: (frameNumber: number, ballIndex: number) => void;
  frames: Frame[];
}

const BowlingFrameDisplay: React.FC<BowlingFrameDisplayProps> = ({ 
  frame, 
  frameNumber, 
  isCurrentFrame, 
  isEditing, 
  handleBallClick,
  frames 
}) => {
  return (
    <div 
      key={frameNumber}
      style={cssProps({
        flex: frameNumber === 10 ? 1.5 : 1,
        border: isCurrentFrame ? '2px solid #4CAF50' : '2px solid #333',
        background: isCurrentFrame ? '#f0f8f0' : 'white',
        minHeight: '80px',
        position: 'relative'
      })}
    >
      <div style={cssProps({
        position: 'absolute',
        top: '2px',
        left: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      })}>
        {frameNumber}
      </div>
      
      <div style={cssProps({
        display: frameNumber === 10 ? 'grid' : 'flex',
        gridTemplateColumns: frameNumber === 10 ? '1fr 1fr 1fr' : undefined,
        height: '40px',
        marginTop: '15px'
      })}>
        {frameNumber === 10 ? (
          <>
            {[0, 1, 2].map(ballIndex => (
              <div
                key={ballIndex}
                style={cssProps({
                  borderRight: ballIndex < 2 ? '1px solid #333' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: isEditing && frame.balls[ballIndex] !== null ? '#fff3cd' : '#f8f9fa'
                })}
                onClick={() => handleBallClick(frameNumber, ballIndex)}
              >
                {formatBall(frame.balls[ballIndex], frameNumber, ballIndex, frames)}
              </div>
            ))}
          </>
        ) : (
          <>
            {[0, 1].map(ballIndex => (
              <div
                key={ballIndex}
                style={cssProps({
                  flex: 1,
                  borderRight: ballIndex === 0 ? '1px solid #333' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: isEditing && frame.balls[ballIndex] !== null ? '#fff3cd' : '#f8f9fa'
                })}
                onClick={() => handleBallClick(frameNumber, ballIndex)}
              >
                {formatBall(frame.balls[ballIndex], frameNumber, ballIndex, frames)}
              </div>
            ))}
          </>
        )}
      </div>
      
      <div style={cssProps({
        textAlign: 'center',
        marginTop: '5px',
        fontSize: '14px',
        fontWeight: 'bold'
      })}>
        {frame.score !== null ? frame.score : ''}
      </div>
    </div>
  );
};

export default BowlingFrameDisplay;
