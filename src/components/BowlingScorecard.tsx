
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BowlingFrame from './BowlingFrame';
import BowlingInsights from './BowlingInsights';

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
      if (frame.rolls.length < 3) {
        const lastRoll = frame.rolls[frame.rolls.length - 1];
        
        if (frame.rolls.length === 1 && lastRoll?.pins !== 10 && pins > (10 - (lastRoll.pins || 0))) {
          return; // Invalid roll
        }
        
        frame.rolls.push({ pins });
        
        // Check if 10th frame is complete
        if (frame.rolls.length === 2 && (frame.rolls[0].pins || 0) + (frame.rolls[1].pins || 0) < 10) {
          setGameComplete(true);
        } else if (frame.rolls.length === 3) {
          setGameComplete(true);
        }
      }
    }

    const updatedFrames = calculateScore(newFrames);
    setFrames(updatedFrames);
  };

  const resetGame = () => {
    setFrames(Array.from({ length: 10 }, (_, i) => ({
      rolls: [],
      score: null,
      frameNumber: i + 1,
    })));
    setCurrentFrame(0);
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
                isActive={currentFrame === index && !gameComplete}
                isComplete={frame.score !== null || gameComplete}
                onRoll={(pins) => addRoll(index, pins)}
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
