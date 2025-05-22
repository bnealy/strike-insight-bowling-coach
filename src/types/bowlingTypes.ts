
export interface Frame {
  balls: (number | null)[];
  score: number | null;
}

export interface Game {
  id: number;
  frames: Frame[];
  currentFrame: number;
  currentBall: number;
  totalScore: number;
  gameComplete: boolean;
  editingFrame: number | null;
  editingBall: number | null;
}
