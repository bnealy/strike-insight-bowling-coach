
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

// Helper function to check if we can score a frame
const canScoreFrame = (frameIndex: number, gameFrames: Frame[]): boolean => {
  if (frameIndex === 9) {
    return isTenthFrameComplete(gameFrames[9]);
  }
  
  const frame = gameFrames[frameIndex];
  
  // If it's a strike, we need the next two balls
  if (isStrike(frameIndex, gameFrames)) {
    if (frameIndex >= 8) return true; // Strikes in frames 9-10 can always be scored
    
    const nextFrame = gameFrames[frameIndex + 1];
    if (isStrike(frameIndex + 1, gameFrames)) {
      // Strike followed by strike - need ball from frame after next
      if (frameIndex + 2 >= 10) return true; // Next frame is 10th frame
      return gameFrames[frameIndex + 2]?.balls[0] !== null;
    } else {
      // Strike followed by non-strike - need both balls from next frame
      return nextFrame?.balls[0] !== null && nextFrame?.balls[1] !== null;
    }
  }
  
  // If second ball hasn't been thrown yet, can't score
  if (frame.balls[1] === null) return false;
  
  // If it's a spare, we need the next ball
  if (isSpare(frameIndex, gameFrames)) {
    if (frameIndex >= 9) return true; // Spare in 10th frame can be scored
    return gameFrames[frameIndex + 1]?.balls[0] !== null;
  }
  
  // Regular frame (no strike or spare) can always be scored once both balls are thrown
  return true;
};

export const calculateScoresForGame = (game: Game): Game => {
  const gameFrames = game.frames;
  const newFrames = [...gameFrames];
  let runningTotal = 0;
  let allFramesComplete = true;

  console.log('Starting score calculation for game:', game.id);
  console.log('Game frames:', gameFrames.map((f, i) => ({ frame: i + 1, balls: f.balls })));

  for (let i = 0; i < 10; i++) {
    const canScore = canScoreFrame(i, gameFrames);
    
    console.log(`Frame ${i + 1}: canScore=${canScore}, balls=${gameFrames[i].balls}`);
    
    if (canScore) {
      const frameScore = calculateFrameScore(i, gameFrames);
      runningTotal += frameScore;
      newFrames[i].score = runningTotal;
      
      console.log(`Frame ${i + 1}: scored ${frameScore}, running total: ${runningTotal}`);
    } else {
      newFrames[i].score = null;
      allFramesComplete = false;
      
      console.log(`Frame ${i + 1}: cannot score yet`);
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

  // Ensure totalScore is never null or undefined
  const totalScore = typeof runningTotal === 'number' && !isNaN(runningTotal) && runningTotal >= 0 
    ? runningTotal 
    : 0;

  return {
    ...game,
    frames: newFrames,
    totalScore: totalScore,
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
