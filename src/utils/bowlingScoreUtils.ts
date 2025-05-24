import { Frame, Game } from '../types/bowlingTypes';

export const isStrike = (frameIndex: number, gameFrames: Frame[]): boolean => {
  return gameFrames[frameIndex].balls[0] === 10;
};

export const isSpare = (frameIndex: number, gameFrames: Frame[]): boolean => {
  if (frameIndex === 9) return false;
  return !isStrike(frameIndex, gameFrames) && 
         (gameFrames[frameIndex].balls[0] || 0) + (gameFrames[frameIndex].balls[1] || 0) === 10;
};

export const getNextTwoBalls = (frameIndex: number, gameFrames: Frame[]): [number, number] => {
  if (frameIndex >= 9) return [0, 0];
  
  const nextFrame = gameFrames[frameIndex + 1];
  if (isStrike(frameIndex + 1, gameFrames)) {
    if (frameIndex + 1 === 9) {
      return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
    } else {
      const frameAfterNext = gameFrames[frameIndex + 2];
      return [nextFrame.balls[0] || 0, frameAfterNext?.balls[0] || 0];
    }
  } else {
    return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
  }
};

export const getNextBall = (frameIndex: number, gameFrames: Frame[]): number => {
  if (frameIndex >= 9) return 0;
  const nextFrame = gameFrames[frameIndex + 1];
  return nextFrame.balls[0] || 0;
};

export const calculateFrameScore = (frameIndex: number, gameFrames: Frame[]): number => {
  const frame = gameFrames[frameIndex];
  
  if (frameIndex === 9) {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      if (frame.balls[i] !== null) {
        total += frame.balls[i] || 0;
      }
    }
    return total;
  }

  if (isStrike(frameIndex, gameFrames)) {
    const [next1, next2] = getNextTwoBalls(frameIndex, gameFrames);
    return 10 + next1 + next2;
  } else if (isSpare(frameIndex, gameFrames)) {
    const nextBall = getNextBall(frameIndex, gameFrames);
    return 10 + nextBall;
  } else {
    return (frame.balls[0] || 0) + (frame.balls[1] || 0);
  }
};

// Helper function to check if the 10th frame is complete
export const isTenthFrameComplete = (frame: Frame): boolean => {
  const firstBall = frame.balls[0];
  const secondBall = frame.balls[1];
  const thirdBall = frame.balls[2];
  
  // If first ball is a strike, need 2 more balls
  if (firstBall === 10) {
    return secondBall !== null && thirdBall !== null;
  }
  
  // If first + second = 10 (spare), need third ball
  if ((firstBall || 0) + (secondBall || 0) === 10) {
    return thirdBall !== null;
  }
  
  // Otherwise, just need first two balls
  return secondBall !== null;
};

export const calculateScoresForGame = (game: Game): Game => {
  const gameFrames = game.frames;
  const newFrames = [...gameFrames];
  let runningTotal = 0;
  let allFramesComplete = true;

  for (let i = 0; i < 10; i++) {
    const frame = newFrames[i];
    let canScore = false;
    
    if (i === 9) {
      // For 10th frame, use the helper function
      canScore = isTenthFrameComplete(frame);
    } else {
      if (isStrike(i, gameFrames)) {
        const [next1, next2] = getNextTwoBalls(i, gameFrames);
        canScore = next1 !== 0 || next2 !== 0 || i >= 8;
      } else if (frame.balls[1] !== null) {
        if (isSpare(i, gameFrames)) {
          const nextBall = getNextBall(i, gameFrames);
          canScore = nextBall !== 0 || i >= 8;
        } else {
          canScore = true;
        }
      }
    }

    if (canScore) {
      const frameScore = calculateFrameScore(i, gameFrames);
      runningTotal += frameScore;
      newFrames[i].score = runningTotal;
    } else {
      newFrames[i].score = null;
      allFramesComplete = false;
    }
  }

  // Game is complete when all frames can be scored AND the 10th frame is complete
  const gameComplete = allFramesComplete && isTenthFrameComplete(newFrames[9]);
  
  console.log('Game completion check:', {
    allFramesComplete,
    tenthFrameComplete: isTenthFrameComplete(newFrames[9]),
    gameComplete,
    tenthFrame: newFrames[9],
    finalScore: newFrames[9].score
  });

  // Fix: Ensure totalScore is never null or undefined
  const totalScore = typeof runningTotal === 'number' && !isNaN(runningTotal) && runningTotal >= 0 
    ? runningTotal 
    : 0;

  return {
    ...game,
    frames: newFrames,
    totalScore: totalScore, // This should never be null/undefined now
    gameComplete
  };
};

export const formatBall = (ball: number | null, frameIndex: number, ballIndex: number, frames: Frame[]): string => {
  if (ball === null) return '';
  if (ball === 0) return '-';
  if (ball === 10) {
    return 'X';
  }
  
  if (frameIndex < 9 && ballIndex === 1) {
    const frame = frames[frameIndex];
    if ((frame.balls[0] || 0) + ball === 10) return '/';
  } else if (frameIndex === 9 && ballIndex === 1 && frames[9].balls[0] !== 10) {
    if ((frames[9].balls[0] || 0) + ball === 10) return '/';
  } else if (frameIndex === 9 && ballIndex === 2 && frames[9].balls[1] !== 10) {
    if ((frames[9].balls[1] || 0) + ball === 10) return '/';
  }
  
  return ball.toString();
};
