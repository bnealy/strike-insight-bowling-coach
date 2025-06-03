import React, { useState, useEffect, useRef } from 'react';
import { Frame } from '../types/bowlingTypes';
import { formatBall } from '../utils/bowlingScoreUtils';
import { CSSProperties } from 'react';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface ResponsiveBowlingFramesProps {
  frames: Frame[];
  currentFrame?: number;
  editingFrame?: number;
  editingBall?: number;
  handleBallClick: (frameNumber: number, ballIndex: number) => void;
}

const ResponsiveBowlingFrames: React.FC<ResponsiveBowlingFramesProps> = ({
  frames,
  currentFrame = 0,
  editingFrame,
  editingBall,
  handleBallClick,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEditingFrame = useRef<number | null>(null);

  // Determine which frame should be auto-centered
  const targetFrame = editingFrame !== undefined && editingFrame !== null ? editingFrame : (currentFrame || 1);

  // Check screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-scroll to center the target frame when it changes
  useEffect(() => {
    if (isMobile && containerRef.current && targetFrame) {
      // Only auto-scroll if the editing frame actually changed (not on initial load)
      if (prevEditingFrame.current !== null && prevEditingFrame.current !== targetFrame) {
        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        
        // Calculate responsive frame width
        const baseWidth = Math.min(280, containerWidth * 0.75); // 75% of screen width, max 280px
        const minWidth = 200; // Minimum readable width
        const frameWidth = Math.max(minWidth, baseWidth);
        const gap = 15;
        
        // Calculate where the target frame is positioned
        const frameIndex = targetFrame - 1; // Convert to 0-based
        const frameLeftPosition = frameIndex * (frameWidth + gap);
        const frameCenterPosition = frameLeftPosition + frameWidth / 2;
        
        // Calculate scroll position to center the frame with peek at sides
        const containerCenter = containerWidth / 2;
        const targetScrollLeft = frameCenterPosition - containerCenter;
        
        // Smooth scroll to the target position
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
        
        console.log('Auto-scrolling with responsive width:', {
          targetFrame,
          containerWidth,
          frameWidth,
          frameLeftPosition,
          frameCenterPosition,
          targetScrollLeft: Math.max(0, targetScrollLeft)
        });
      }
      
      // Update the previous frame reference
      prevEditingFrame.current = targetFrame;
    }
  }, [targetFrame, isMobile]);

  // Render individual frame
  const renderFrame = (frame: Frame, frameNumber: number) => {
    const isCurrentFrame = frameNumber === currentFrame;
    const isEditing = frameNumber === editingFrame;
    
    let frameClasses = 'bowling-frame';
    if (isEditing) frameClasses += ' editing-frame';
    if (frameNumber === 10) frameClasses += ' tenth-frame';

    return (
      <div
        key={frameNumber}
        className={frameClasses}
        onClick={() => handleBallClick(frameNumber, 0)}
      >
        <div className="frame-content">
          <div className="frame-header">
            <span className="frame-number">{frameNumber}</span>
            {isEditing && (
              <span className="editing-indicator">
                Ball {(editingBall || 0) + 1}
              </span>
            )}
          </div>
          
          <div className="frame-balls">
            {frameNumber === 10 ? (
              <>
                {[0, 1, 2].map(ballIndex => {
                  const isEditingThisBall = isEditing && editingBall === ballIndex;
                  return (
                    <div
                      key={ballIndex}
                      className={`ball-score ${isEditingThisBall ? 'editing-ball' : ''}`}
                      style={cssProps({
                        borderRight: ballIndex < 2 ? '1px solid #333' : 'none',
                        backgroundColor: 'transparent'
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBallClick(frameNumber, ballIndex);
                      }}
                    >
                      {formatBall(frame.balls[ballIndex], frameNumber, ballIndex, frames)}
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {[0, 1].map(ballIndex => {
                  const isEditingThisBall = isEditing && editingBall === ballIndex;
                  return (
                    <div
                      key={ballIndex}
                      className={`ball-score ${isEditingThisBall ? 'editing-ball' : ''}`}
                      style={cssProps({
                        borderRight: ballIndex === 0 ? '1px solid #333' : 'none',
                        backgroundColor: 'transparent'
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBallClick(frameNumber, ballIndex);
                      }}
                    >
                      {formatBall(frame.balls[ballIndex], frameNumber, ballIndex, frames)}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          
          <div className="frame-total">
            {frame.score !== null ? frame.score : ''}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    // Mobile horizontal scroll layout
    return (
      <>
        <div 
          className="scroll-container"
          ref={containerRef}
        >
          <div className="scroll-track">
            {frames.map((frame, index) => renderFrame(frame, index + 1))}
          </div>
        </div>

        <style jsx>{`
          .scroll-container {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 20px 0;
            /* Smooth scrolling */
            scroll-behavior: smooth;
            /* Hide scrollbar but keep functionality */
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          
          .scroll-container::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }

          .scroll-track {
            display: flex;
            gap: clamp(10px, 2vw, 15px); /* Responsive gap */
            padding: 0 clamp(10px, 5vw, 20px); /* Responsive padding */
            /* Ensure enough space for all frames */
            width: max-content;
          }

          .bowling-frame {
            position: relative;
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            min-height: 120px;
            /* Responsive width: 75% of screen width, between 200px and 280px */
            width: clamp(200px, 75vw, 280px);
            flex-shrink: 0; /* Prevent frames from shrinking */
          }

          .bowling-frame:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
          }

          .bowling-frame.editing-frame {
            border-color: #28a745;
            background-color: #f8fff9;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          }

          .bowling-frame.tenth-frame {
            /* 10th frame is slightly wider */
            width: clamp(220px, 80vw, 320px);
          }

          /* Frame content styles */
          .frame-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 8px;
          }

          .frame-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .frame-number {
            font-size: 1rem;
            font-weight: bold;
            color: #666;
          }

          .editing-indicator {
            font-size: 0.8rem;
            font-weight: 600;
            color: #28a745;
            background: rgba(40, 167, 69, 0.1);
            padding: 2px 6px;
            border-radius: 12px;
            border: 1px solid rgba(40, 167, 69, 0.3);
          }

          .frame-balls {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            gap: 4px;
          }

          .ball-score {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
            min-width: 24px;
            text-align: center;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
            padding: 8px;
            transition: all 0.2s ease;
            border-radius: 4px;
          }

          .ball-score:hover {
            background-color: rgba(0, 123, 255, 0.1);
          }

          .ball-score.editing-ball {
            background-color: rgba(255, 215, 0, 0.6) !important;
            color: #333;
            box-shadow: 0 0 0 2px rgba(255, 237, 78, 0.6), 0 0 8px rgba(255, 215, 0, 0.3);
            font-weight: 900;
            transform: scale(1.1);
            z-index: 1;
            position: relative;
          }

          .frame-total {
            text-align: center;
            font-size: 1.1rem;
            font-weight: bold;
            color: #007bff;
            border-top: 1px solid #eee;
            padding-top: 8px;
            margin-top: 8px;
          }
        `}</style>
      </>
    );
  }

  // Desktop grid layout (original)
  return (
    <>
      <div className="frames-container">
        {frames.map((frame, index) => renderFrame(frame, index + 1))}
      </div>

      <style jsx>{`
        /* Desktop Layout Styles */
        .frames-container {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: space-between;
        }

        /* Base frame styles */
        .bowling-frame {
          position: relative;
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          min-height: 90px;
          min-width: 80px;
          flex: 1;
        }

        .bowling-frame:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .bowling-frame.editing-frame {
          border-color: #28a745;
          background-color: #f8fff9;
        }

        .bowling-frame.tenth-frame {
          flex: 1.5;
        }

        .frame-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 6px;
        }

        .frame-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .frame-number {
          font-size: 0.8rem;
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
          font-size: 1rem;
          font-weight: bold;
          color: #333;
          min-width: 18px;
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
          font-size: 1rem;
          font-weight: bold;
          color: #007bff;
          border-top: 1px solid #eee;
          padding-top: 2px;
          margin-top: 4px;
        }

        /* Responsive breakpoint */
        @media (max-width: 768px) {
          .frames-container {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default ResponsiveBowlingFrames;