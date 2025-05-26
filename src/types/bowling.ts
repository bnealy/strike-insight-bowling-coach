export interface BowlingFrame {
  frameNumber: number;
  ball1: number | null;
  ball2: number | null;
  ball3: number | null;
}

export interface BowlingScorecard {
  frames: BowlingFrame[];
}

export interface VisionAnalysisResponse {
  success: boolean;
  data?: BowlingScorecard;
  error?: string;
} 