
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const calculateStats = () => {
    let strikes = 0;
    let spares = 0;
    let totalPins = 0;
    let completedFrames = 0;
    const frameScores: number[] = [];

    frames.forEach((frame, index) => {
      if (frame.rolls.length > 0) {
        completedFrames++;
        
        if (index < 9) {
          // Regular frames
          if (frame.rolls[0]?.isStrike) {
            strikes++;
          } else if (frame.rolls[1]?.isSpare) {
            spares++;
          }
          
          frame.rolls.forEach(roll => {
            if (roll.pins !== null) totalPins += roll.pins;
          });
        } else {
          // 10th frame
          frame.rolls.forEach((roll, rollIndex) => {
            if (roll.pins !== null) {
              totalPins += roll.pins;
              if (rollIndex < 2) {
                if (roll.pins === 10) strikes++;
                else if (rollIndex === 1 && (frame.rolls[0]?.pins || 0) + roll.pins === 10) {
                  spares++;
                }
              }
            }
          });
        }
        
        if (frame.score !== null) {
          frameScores.push(frame.score - (frameScores[frameScores.length - 1] || 0));
        }
      }
    });

    const average = completedFrames > 0 ? totalPins / completedFrames : 0;
    const finalScore = frames[9]?.score || 0;
    
    return {
      strikes,
      spares,
      totalPins,
      completedFrames,
      average: average.toFixed(1),
      finalScore,
      frameScores
    };
  };

  const stats = calculateStats();
  
  const chartData = frames.map((frame, index) => ({
    frame: `F${index + 1}`,
    score: frame.score || 0,
  })).filter(data => data.score > 0);

  const getInsights = () => {
    const insights = [];
    
    if (stats.strikes >= 3) {
      insights.push("Great job! You're finding your strike zone consistently.");
    } else if (stats.strikes === 0) {
      insights.push("Focus on your approach and release for more strikes.");
    }
    
    if (stats.spares >= 4) {
      insights.push("Excellent spare conversion! Your consistency is paying off.");
    } else if (stats.spares < 2 && stats.completedFrames >= 5) {
      insights.push("Work on spare shooting - it's crucial for higher scores.");
    }
    
    if (stats.finalScore >= 150) {
      insights.push("Solid game! You're bowling above average.");
    } else if (stats.finalScore >= 100) {
      insights.push("Good fundamentals! Focus on consistency for higher scores.");
    } else if (stats.completedFrames >= 5) {
      insights.push("Keep practicing! Focus on your form and follow-through.");
    }
    
    return insights;
  };

  const insights = getInsights();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Game Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Final Score:</span>
            <span className="font-bold text-blue-900">{stats.finalScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Strikes:</span>
            <span className="font-bold text-green-600">{stats.strikes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Spares:</span>
            <span className="font-bold text-yellow-600">{stats.spares}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average per Frame:</span>
            <span className="font-bold text-blue-900">{stats.average}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Pins:</span>
            <span className="font-bold text-blue-900">{stats.totalPins}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Complete more frames to see insights!</p>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Score Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="frame" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BowlingInsights;
