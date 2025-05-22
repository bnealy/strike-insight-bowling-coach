import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BowlingFrame from './BowlingFrame';
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
        for (let j = 0; j < frame.rolls.length; j++) {
          if (j === 0 && frame.rolls[j].pins === 10) {
            frame.rolls[j].isStrike = true;
          } else if (j === 1 && frame.rolls[j].pins === 10) {
            frame.rolls[j].isStrike = true;
          } else if (j === 1 && (frame.rolls[0].pins || 0) + frame.rolls[j].pins === 10) {
            frame.rolls[j].isSpare = true;
          } else if (j === 2 && frame.rolls[1].pins === 10 && frame.rolls[j].pins === 10) {
            frame.rolls[j].isStrike = true;
          } else if (j === 2 && (frame.rolls[1].pins || 0) + frame.rolls[j].pins === 10) {
            frame.rolls[j].isSpare = true;
          }
        }
        
        // Calculate total for 10th frame
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

    // If editing a frame, reset its rolls
    if (selectedFrame !== null && selectedFrame === frameIndex) {
      frame.rolls = [];
      
      // Also reset scores for all frames from this point forward
      for (let i = frameIndex; i < 10; i++) {
        newFrames[i].score = null;
        
        // If not the selected frame, also reset the rolls
        if (i > frameIndex) {
          newFrames[i].rolls = [];
        }
      }
    }

    if (frameIndex < 9) {
      // Frames 1-9
      if (frame.rolls.length === 0) {
        // First roll in the frame
        frame.rolls.push({ pins });
        if (pins === 10) {
          // Strike - move to next frame automatically if not in edit mode
          frame.rolls[0].isStrike = true;
          if (selectedFrame === null) {
            setCurrentFrame(Math.min(frameIndex + 1, 9));
          } else {
            setSelectedFrame(null);
            setCurrentFrame(Math.max(currentFrame, frameIndex + 1));
          }
        }
      } else if (frame.rolls.length === 1) {
        // Second roll in the frame
        if (pins + (frame.rolls[0].pins || 0) <= 10) {
          // Check if it's a spare
          if (pins + (frame.rolls[0].pins || 0) === 10) {
            frame.rolls.push({ pins, isSpare: true });
          } else {
            frame.rolls.push({ pins });
          }
          
          // Move to next frame automatically if not in edit mode
          if (selectedFrame === null) {
            setCurrentFrame(Math.min(frameIndex + 1, 9));
          } else {
            setSelectedFrame(null);
            setCurrentFrame(Math.max(currentFrame, frameIndex + 1));
          }
        } else {
          toast.error("Invalid pin count for this roll");
          return;
        }
      }
    } else {
      // 10th frame
      if (frame.rolls.length === 0) {
        // First roll in 10th frame
        if (pins === 10) {
          frame.rolls.push({ pins, isStrike: true });
        } else {
          frame.rolls.push({ pins });
        }
        
        if (selectedFrame !== null) {
          // If we're editing, don't deselect the frame yet
          // as we need to complete the editing
        }
      } else if (frame.rolls.length === 1) {
        // Second roll in 10th frame
        const firstRoll = frame.rolls[0].pins || 0;
        
        if ((firstRoll < 10 && pins > (10 - firstRoll)) && !frame.rolls[0].isStrike) {
          // Invalid roll - more pins than remaining (unless first was a strike)
          toast.error("Invalid pin count for this roll");
          return;
        }
        
        if (firstRoll === 10 && pins === 10) {
          // Second strike in 10th frame
          frame.rolls.push({ pins, isStrike: true });
        } else if ((firstRoll < 10 && firstRoll + pins === 10) || (firstRoll === 10 && pins < 10)) {
          // Spare in 10th frame
          frame.rolls.push({ pins, isSpare: (firstRoll < 10) });
        } else {
          frame.rolls.push({ pins });
        }
        
        // If not a strike or spare in the first two rolls, game is complete
        if (firstRoll !== 10 && firstRoll + pins < 10) {
          if (selectedFrame === null) {
            setGameComplete(true);
          } else {
            setSelectedFrame(null);
          }
        }
      } else if (frame.rolls.length === 2) {
        // Third roll in 10th frame
        const firstRoll = frame.rolls[0].pins || 0;
        const secondRoll = frame.rolls[1].pins || 0;
        
        // Only allow third roll if strike or spare in the first two rolls
        if (firstRoll === 10 || firstRoll + secondRoll === 10) {
          // Check third roll pin count validity
          if (firstRoll === 10 && secondRoll === 10 && pins === 10) {
            // Third strike
            frame.rolls.push({ pins, isStrike: true });
          } else if (secondRoll === 10 && pins === 10) {
            // Strike after spare or strike
            frame.rolls.push({ pins, isStrike: true });
          } else if (secondRoll < 10 && secondRoll + pins === 10 && firstRoll === 10) {
            // Spare after strike
            frame.rolls.push({ pins, isSpare: true });
          } else {
            frame.rolls.push({ pins });
          }
          
          if (selectedFrame === null) {
            setGameComplete(true);
          } else {
            setSelectedFrame(null);
          }
        } else {
          toast.error("Invalid roll: no third roll allowed without strike or spare");
          return;
        }
      }
    }

    const updatedFrames = calculateScore(newFrames);
    setFrames(updatedFrames);
  };

  const handleFrameSelect = (frameIndex: number) => {
    // Can't select upcoming frames that haven't been reached yet
    if (frameIndex > currentFrame && frames[frameIndex].rolls.length === 0) {
      toast.error("You need to fill frames in order");
      return;
    }
    
    // If a frame is already selected and not completed, don't allow selecting another
    if (selectedFrame !== null && selectedFrame !== frameIndex && frames[selectedFrame].rolls.length < 
        (selectedFrame < 9 ? (frames[selectedFrame].rolls[0]?.pins === 10 ? 1 : 2) : 
          (frames[selectedFrame].rolls[0]?.pins === 10 || 
            (frames[selectedFrame].rolls[0]?.pins || 0) + (frames[selectedFrame].rolls[1]?.pins || 0) === 10 ? 3 : 2))) {
      toast.error("Please complete the current frame before selecting another");
      return;
    }
    
    // Already active or completed frames can be selected for editing
    if (frames[frameIndex].rolls.length > 0 || frameIndex === currentFrame) {
      // If already selected, deselect it
      if (selectedFrame === frameIndex) {
        setSelectedFrame(null);
      } else {
        setSelectedFrame(frameIndex);
      }
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
    </div>
  );
};

export default BowlingScorecard;
