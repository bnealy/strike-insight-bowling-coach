import { Frame, Game } from '../types/bowlingTypes';

// Convert from 1-based to 0-based index for array access
const getFrameIndex = (frameNumber: number): number => frameNumber - 1;

export const isStrike = (frameNumber: number, gameFrames: Frame[]): boolean => {
  return gameFrames[getFrameIndex(frameNumber)].balls[0] === 10;
};

export const isSpare = (frameNumber: number, gameFrames: Frame[]): boolean => {
  if (frameNumber === 10) return false;
  return !isStrike(frameNumber, gameFrames) && 
         (gameFrames[getFrameIndex(frameNumber)].balls[0] || 0) + (gameFrames[getFrameIndex(frameNumber)].balls[1] || 0) === 10;
};

export const getNextTwoBalls = (frameNumber: number, gameFrames: Frame[]): [number, number] => {
  if (frameNumber >= 10) return [0, 0];
  
  const nextFrame = gameFrames[getFrameIndex(frameNumber + 1)];
  if (isStrike(frameNumber + 1, gameFrames)) {
    if (frameNumber + 1 === 10) {
      return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
    } else {
      const frameAfterNext = gameFrames[getFrameIndex(frameNumber + 2)];
      return [nextFrame.balls[0] || 0, frameAfterNext?.balls[0] || 0];
    }
  } else {
    return [nextFrame.balls[0] || 0, nextFrame.balls[1] || 0];
  }
};

export const getNextBall = (frameNumber: number, gameFrames: Frame[]): number => {
  if (frameNumber >= 10) return 0;
  const nextFrame = gameFrames[getFrameIndex(frameNumber + 1)];
  return nextFrame.balls[0] || 0;
};

export const calculateFrameScore = (frameNumber: number, gameFrames: Frame[]): number => {
  const frame = gameFrames[getFrameIndex(frameNumber)];
  
  if (frameNumber === 10) {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      if (frame.balls[i] !== null) {
        total += frame.balls[i] || 0;
      }
    }
    return total;
  }

  if (isStrike(frameNumber, gameFrames)) {
    const [next1, next2] = getNextTwoBalls(frameNumber, gameFrames);
    return 10 + next1 + next2;
  } else if (isSpare(frameNumber, gameFrames)) {
    const nextBall = getNextBall(frameNumber, gameFrames);
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
const canScoreFrame = (frameNumber: number, gameFrames: Frame[]): boolean => {
  if (frameNumber === 10) {
    return isTenthFrameComplete(gameFrames[getFrameIndex(10)]);
  }
  
  const frame = gameFrames[getFrameIndex(frameNumber)];
  
  // If it's a strike, we need the next two balls
  if (isStrike(frameNumber, gameFrames)) {
    if (frameNumber >= 9) return true; // Strikes in frames 9-10 can always be scored
    
    const nextFrame = gameFrames[getFrameIndex(frameNumber + 1)];
    if (isStrike(frameNumber + 1, gameFrames)) {
      // Strike followed by strike - need ball from frame after next
      if (frameNumber + 2 >= 10) return true; // Next frame is 10th frame
      return gameFrames[getFrameIndex(frameNumber + 2)]?.balls[0] !== null;
    } else {
      // Strike followed by non-strike - need both balls from next frame
      return nextFrame?.balls[0] !== null && nextFrame?.balls[1] !== null;
    }
  }
  
  // If second ball hasn't been thrown yet, can't score
  if (frame.balls[1] === null) return false;
  
  // If it's a spare, we need the next ball
  if (isSpare(frameNumber, gameFrames)) {
    if (frameNumber >= 10) return true; // Spare in 10th frame can be scored
    return gameFrames[getFrameIndex(frameNumber + 1)]?.balls[0] !== null;
  }
  
  // Regular frame (no strike or spare) can always be scored once both balls are thrown
  return true;
};

export const calculateScoresForGame = (game: Game): Game => {
  const gameFrames = game.frames;
  const newFrames = [...gameFrames];
  let runningTotal = 0;
  let allFramesComplete = true;

  for (let frameNumber = 1; frameNumber <= 10; frameNumber++) {
    const canScore = canScoreFrame(frameNumber, gameFrames);
    const frameIndex = getFrameIndex(frameNumber);
    
    if (canScore) {
      const frameScore = calculateFrameScore(frameNumber, gameFrames);
      runningTotal += frameScore;
      newFrames[frameIndex].score = runningTotal;
    } else {
      newFrames[frameIndex].score = null;
      allFramesComplete = false;
    }
  }

  const gameComplete = allFramesComplete && isTenthFrameComplete(newFrames[9]);
  
  const totalScore = typeof runningTotal === 'number' && !isNaN(runningTotal) && runningTotal >= 0 
    ? runningTotal 
    : 0;

  return {
    ...game,
    frames: newFrames,
    totalScore: totalScore,
    gameComplete,
    currentFrame: game.currentFrame,
    currentBall: game.currentBall,
    editingFrame: game.editingFrame,
    editingBall: game.editingBall
  };
};

export const formatBall = (ball: number | null, frameNumber: number, ballIndex: number, frames: Frame[]): string => {
  if (ball === null) return '';
  if (ball === 0) return '-';
  if (ball === 10) {
    return 'X';
  }
  
  const frameIndex = getFrameIndex(frameNumber);
  if (frameNumber < 10 && ballIndex === 1) {
    const frame = frames[frameIndex];
    if ((frame.balls[0] || 0) + ball === 10) return '/';
  } else if (frameNumber === 10 && ballIndex === 1 && frames[9].balls[0] !== 10) {
    if ((frames[9].balls[0] || 0) + ball === 10) return '/';
  } else if (frameNumber === 10 && ballIndex === 2 && frames[9].balls[1] !== 10) {
    if ((frames[9].balls[1] || 0) + ball === 10) return '/';
  }
  
  return ball.toString();
};
