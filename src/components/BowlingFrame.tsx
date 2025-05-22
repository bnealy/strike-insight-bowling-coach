
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

interface BowlingFrameProps {
  frame: Frame;
  isActive: boolean;
  isComplete: boolean;
  onRoll: (pins: number) => void;
}

const BowlingFrame = ({ frame, isActive, isComplete, onRoll }: BowlingFrameProps) => {
  const is10thFrame = frame.frameNumber === 10;
  
  const formatRoll = (roll: Roll | undefined, rollIndex: number): string => {
    if (!roll || roll.pins === null) return '';
    
    if (roll.isStrike) return 'X';
    if (roll.isSpare) return '/';
    if (roll.pins === 0) return '-';
    return roll.pins.toString();
  };

  const getRollButtons = () => {
    if (!isActive || isComplete) return null;

    const rollIndex = frame.rolls.length;
    let maxPins = 10;

    if (rollIndex === 1 && !is10thFrame) {
      maxPins = 10 - (frame.rolls[0]?.pins || 0);
    } else if (rollIndex === 1 && is10thFrame && frame.rolls[0]?.pins !== 10) {
      maxPins = 10 - (frame.rolls[0]?.pins || 0);
    } else if (rollIndex === 2 && is10thFrame && frame.rolls[1]?.pins !== undefined) {
      const prevTotal = (frame.rolls[0]?.pins || 0) + (frame.rolls[1]?.pins || 0);
      if (prevTotal < 10) {
        return null; // 10th frame complete without strike/spare
      }
      maxPins = 10;
    }

    return (
      <div className="grid grid-cols-3 gap-1 mt-2">
        {Array.from({ length: maxPins + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onRoll(i)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs py-1 px-1 rounded transition-colors"
          >
            {i === 0 ? '-' : i}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''} ${isComplete ? 'bg-green-50' : ''}`}>
      <CardContent className="p-2">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Frame {frame.frameNumber}</div>
          
          {/* Roll display */}
          <div className="flex justify-center gap-1 mb-2">
            {is10thFrame ? (
              // 10th frame shows up to 3 rolls
              <>
                <div className="w-6 h-6 border border-gray-300 rounded text-xs flex items-center justify-center">
                  {formatRoll(frame.rolls[0], 0)}
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded text-xs flex items-center justify-center">
                  {formatRoll(frame.rolls[1], 1)}
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded text-xs flex items-center justify-center">
                  {formatRoll(frame.rolls[2], 2)}
                </div>
              </>
            ) : (
              // Regular frames show 2 rolls
              <>
                <div className="w-6 h-6 border border-gray-300 rounded text-xs flex items-center justify-center">
                  {frame.rolls[0]?.isStrike ? 'X' : formatRoll(frame.rolls[0], 0)}
                </div>
                <div className="w-6 h-6 border border-gray-300 rounded text-xs flex items-center justify-center">
                  {frame.rolls[0]?.isStrike ? '' : formatRoll(frame.rolls[1], 1)}
                </div>
              </>
            )}
          </div>
          
          {/* Frame score */}
          <div className="text-lg font-bold text-blue-900">
            {frame.score || ''}
          </div>
          
          {/* Input buttons */}
          {getRollButtons()}
        </div>
      </CardContent>
    </Card>
  );
};

export default BowlingFrame;
