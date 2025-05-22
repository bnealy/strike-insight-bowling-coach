
import { Card, CardContent } from '@/components/ui/card';

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

interface BowlingInsightsProps {
  frames: Frame[];
}

const BowlingInsights = ({ frames }: BowlingInsightsProps) => {
  // This component has been simplified as part of the MVP
  return null;
};

export default BowlingInsights;
