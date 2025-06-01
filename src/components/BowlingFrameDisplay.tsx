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
  // Build CSS classes - ONLY highlight editing frame
  let frameClasses = 'bowling-frame';
  if (isEditing) frameClasses += ' editing-frame';
  if (frameNumber === 10) frameClasses += ' tenth-frame';

  return (
    <>
      <div
        key={frameNumber}
        className={frameClasses}
        style={cssProps({
          flex: frameNumber === 10 ? 1.5 : 1,
        })}
      >
        <div className="frame-content">
          <div className="frame-header">
            <span className="frame-number">{frameNumber}</span>
          </div>
          
          <div className="frame-balls">
            {frameNumber === 10 ? (
              <>
                {[0, 1, 2].map(ballIndex => (
                  <div
                    key={ballIndex}
                    className="ball-score"
                    style={cssProps({
                      borderRight: ballIndex < 2 ? '1px solid #333' : 'none',
                      backgroundColor: 'transparent' // Removed editing highlight
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
                    className="ball-score"
                    style={cssProps({
                      borderRight: ballIndex === 0 ? '1px solid #333' : 'none',
                      backgroundColor: 'transparent' // Removed editing highlight
                    })}
                    onClick={() => handleBallClick(frameNumber, ballIndex)}
                  >
                    {formatBall(frame.balls[ballIndex], frameNumber, ballIndex, frames)}
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="frame-total">
            {frame.score !== null ? frame.score : ''}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Mobile-Responsive Bowling Frame Styles */

        /* Base frame styles that work on all devices */
        .bowling-frame {
          position: relative;
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          min-height: 80px;
          min-width: 70px;
        }

        .bowling-frame:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* ONLY editing frame gets green color */
        .bowling-frame.editing-frame {
          border-color: #28a745;
          background-color: #f8fff9;
        }

        /* Frame content layout */
        .frame-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 4px;
        }

        .frame-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .frame-number {
          font-size: 0.75rem;
          font-weight: bold;
          color: #666;
        }

        .frame-balls {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          gap: 2px;
        }

        .ball-score {
          font-size: 0.875rem;
          font-weight: bold;
          color: #333;
          min-width: 16px;
          text-align: center;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .frame-total {
          text-align: center;
          font-size: 0.875rem;
          font-weight: bold;
          color: #007bff;
          border-top: 1px solid #eee;
          padding-top: 2px;
          margin-top: 4px;
        }

        /* Special styling for 10th frame */
        .bowling-frame.tenth-frame {
          min-width: 85px;
        }

        .tenth-frame .frame-balls {
          gap: 1px;
        }

        /* Desktop styles */
        @media (min-width: 769px) {
          .bowling-frame {
            min-height: 90px;
            min-width: 80px;
            padding: 6px;
          }
          
          .frame-number {
            font-size: 0.8rem;
          }
          
          .ball-score {
            font-size: 1rem;
            min-width: 18px;
          }
          
          .frame-total {
            font-size: 1rem;
          }
          
          .bowling-frame.tenth-frame {
            min-width: 95px;
          }
        }

        /* Tablet styles */
        @media (max-width: 768px) and (min-width: 481px) {
          .bowling-frame {
            min-height: 75px;
            min-width: 65px;
          }
          
          .ball-score {
            font-size: 0.8rem;
          }
          
          .frame-total {
            font-size: 0.8rem;
          }
          
          .bowling-frame.tenth-frame {
            min-width: 80px;
          }
        }

        /* Mobile styles */
        @media (max-width: 480px) {
          .bowling-frame {
            min-height: 70px;
            min-width: 60px;
            border-radius: 6px;
            border-width: 1.5px;
          }
          
          .frame-content {
            padding: 2px;
          }
          
          .frame-number {
            font-size: 0.7rem;
          }
          
          .ball-score {
            font-size: 0.75rem;
            min-width: 14px;
          }
          
          .frame-total {
            font-size: 0.75rem;
            padding-top: 1px;
            margin-top: 2px;
          }
          
          .bowling-frame.tenth-frame {
            min-width: 75px;
          }
          
          /* Reduce hover effects on mobile for better performance */
          .bowling-frame:hover {
            transform: none;
            box-shadow: none;
          }
          
          .bowling-frame:active {
            transform: scale(0.98);
          }
        }

        /* Very small mobile styles */
        @media (max-width: 360px) {
          .bowling-frame {
            min-height: 65px;
            min-width: 55px;
          }
          
          .frame-number {
            font-size: 0.65rem;
          }
          
          .ball-score {
            font-size: 0.7rem;
            min-width: 12px;
          }
          
          .frame-total {
            font-size: 0.7rem;
          }
          
          .bowling-frame.tenth-frame {
            min-width: 70px;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .bowling-frame {
            transition: none;
          }
          
          .bowling-frame:hover {
            transform: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bowling-frame {
            border-width: 3px;
          }
          
          .frame-total {
            border-top-width: 2px;
          }
        }
      `}</style>
    </>
  );
};

export default BowlingFrameDisplay;