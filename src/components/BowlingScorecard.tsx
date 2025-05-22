
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BowlingFrame from './BowlingFrame';
import BowlingInsights from './BowlingInsights';
import { toast } from 'sonner';

interface Roll {
  pins: number | null;
  isStrike?: boolean;
  isSpare?: boolean;
}

interface Frame {
  rolls: Roll[];
  score: number | null;
  frameNumber: number;
}

const BowlingScorecard = () => {
  const [frames, setFrames] = useState<Frame[]>(
    Array.from({ length: 10 }, (_, i) => ({
      rolls: [],
      score: null,
      frameNumber: i + 1,
    }))
  );

  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const calculateScore = (updatedFrames: Frame[]) => {
    const newFrames = [...updatedFrames];
    let runningScore = 0;

    for (let i = 0; i < 10; i++) {
      const frame = newFrames[i];
      
      if (frame.rolls.length === 0) {
        newFrames[i].score = null;
        continue;
      }

      if (i < 9) {
        // Frames 1-9
        if (frame.rolls[0]?.pins === 10) {
          // Strike
          frame.rolls[0].isStrike = true;
          let bonus = 0;
          
          if (newFrames[i + 1]?.rolls[0]?.pins !== undefined) {
            bonus += newFrames[i + 1].rolls[0].pins || 0;
            
            if (newFrames[i + 1].rolls[0].pins === 10 && i < 8) {
              // Strike in next frame, look at frame after that
              bonus += newFrames[i + 2]?.rolls[0]?.pins || 0;
            } else if (newFrames[i + 1]?.rolls[1]?.pins !== undefined) {
              bonus += newFrames[i + 1].rolls[1].pins || 0;
            }
          }
          
          if (bonus > 0 || i === 9) {
            runningScore += 10 + bonus;
            newFrames[i].score = runningScore;
          }
        } else if (frame.rolls.length === 2) {
          const frameTotal = (frame.rolls[0]?.pins || 0) + (frame.rolls[1]?.pins || 0);
          
          if (frameTotal === 10) {
            // Spare
            frame.rolls[1].isSpare = true;
            const bonus = newFrames[i + 1]?.rolls[0]?.pins || 0;
            
            if (bonus > 0 || i === 9) {
              runningScore += 10 + bonus;
              newFrames[i].score = runningScore;
            }
          } else {
            // Regular frame
            runningScore += frameTotal;
            newFrames[i].score = runningScore;
          }
        }
      } else {
        // 10th frame
        const totalPins = frame.rolls.reduce((sum, roll) => sum + (roll.pins || 0), 0);
        runningScore += totalPins;
        newFrames[i].score = runningScore;
      }
    }

    return newFrames;
  };

  const addRoll = (frameIndex: number, pins: number) => {
    const newFrames = [...frames];
    const frame = newFrames[frameIndex];

    // Reset the frame's rolls if editing
    if (selectedFrame === frameIndex) {
      frame.rolls = [];
    }

    if (frameIndex < 9) {
      // Frames 1-9
      if (frame.rolls.length === 0) {
        frame.rolls.push({ pins });
        if (pins === 10) {
          // Strike - move to next frame
          setCurrentFrame(Math.min(frameIndex + 1, 9));
        }
      } else if (frame.rolls.length === 1 && pins <= (10 - (frame.rolls[0].pins || 0))) {
        frame.rolls.push({ pins });
        setCurrentFrame(Math.min(frameIndex + 1, 9));
      }
    } else {
      // 10th frame
      if (frame.rolls.length === 0) {
        // First roll in 10th frame
        frame.rolls.push({ pins });
        if (pins < 10 && selectedFrame === null) {
          // Not editing and not a strike
          // Don't move to next frame yet
        }
      } else if (frame.rolls.length === 1) {
        // Second roll in 10th frame
        const firstRoll = frame.rolls[0].pins || 0;
        
        if (firstRoll < 10 && pins > (10 - firstRoll)) {
          // Invalid roll - more pins than remaining
          toast.error("Invalid pin count for this roll");
          return;
        }
        
        frame.rolls.push({ pins });
        
        // If not a strike or spare in the first two rolls, game is complete
        if (firstRoll !== 10 && firstRoll + pins < 10) {
          if (selectedFrame === null) {
            setGameComplete(true);
          }
        }
      } else if (frame.rolls.length === 2) {
        // Third roll in 10th frame
        const firstRoll = frame.rolls[0].pins || 0;
        const secondRoll = frame.rolls[1].pins || 0;
        
        // Only allow third roll if strike or spare in the first two rolls
        if (firstRoll === 10 || firstRoll + secondRoll === 10) {
          // For a spare in second roll, any pins is valid
          // For a strike in first roll and another in second, any pins is valid
          // For a strike in first and non-strike in second, need to check remaining pins
          if (firstRoll === 10 && secondRoll < 10 && pins > (10 - secondRoll)) {
            toast.error("Invalid pin count for this roll");
            return;
          }
          
          frame.rolls.push({ pins });
          if (selectedFrame === null) {
            setGameComplete(true);
          }
        }
      }
    }

    const updatedFrames = calculateScore(newFrames);
    setFrames(updatedFrames);
    
    // Clear selectedFrame after a roll is added
    if (selectedFrame !== null) {
      setSelectedFrame(null);
    }
  };

  const handleFrameSelect = (frameIndex: number) => {
    // If the frame already has rolls, allow editing
    if (frames[frameIndex].rolls.length > 0) {
      setSelectedFrame(frameIndex === selectedFrame ? null : frameIndex);
    } else if (frameIndex === currentFrame) {
      // Current active frame - do nothing special
    } else if (frameIndex < currentFrame) {
      // Can't select frames before current if they have no rolls
      toast.error("You need to fill frames in order");
    }
  };

  const resetGame = () => {
    setFrames(Array.from({ length: 10 }, (_, i) => ({
      rolls: [],
      score: null,
      frameNumber: i + 1,
    })));
    setCurrentFrame(0);
    setSelectedFrame(null);
    setGameComplete(false);
  };

  const finalScore = frames[9]?.score || 0;
  const isNewGame = frames.every(frame => frame.rolls.length === 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl text-blue-900">
            Game Score: {finalScore}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 mb-6">
            {frames.map((frame, index) => (
              <BowlingFrame
                key={index}
                frame={frame}
                isActive={currentFrame === index && !gameComplete && selectedFrame === null}
                isComplete={frame.score !== null || gameComplete}
                onRoll={(pins) => addRoll(index, pins)}
                onSelect={() => handleFrameSelect(index)}
                isSelected={selectedFrame === index}
              />
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              New Game
            </button>
          </div>
        </CardContent>
      </Card>

      {!isNewGame && <BowlingInsights frames={frames} />}
    </div>
  );
};

export default BowlingScorecard;
