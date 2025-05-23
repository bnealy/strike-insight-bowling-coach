
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BowlingFlowStep } from '@/types/flowTypes';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface GameCountSelectorProps {
  gameCount: number;
  onGameCountChange: (count: number) => void;
  onNext: (nextStep: BowlingFlowStep) => void;
  onBack: (prevStep: BowlingFlowStep) => void;
}

const GameCountSelector: React.FC<GameCountSelectorProps> = ({ 
  gameCount, 
  onGameCountChange, 
  onNext,
  onBack 
}) => {
  const decrementCount = () => {
    if (gameCount > 1) {
      onGameCountChange(gameCount - 1);
    }
  };

  const incrementCount = () => {
    onGameCountChange(gameCount + 1);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] w-full">
      <Card className="w-full max-w-md bg-white bg-opacity-95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">How many games did you bowl?</CardTitle>
          <CardDescription className="text-center">
            Select the number of games you want to record
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-6 my-8">
            <Button 
              onClick={decrementCount}
              variant="outline" 
              size="icon"
              className="rounded-full h-14 w-14"
              disabled={gameCount <= 1}
            >
              <MinusCircle size={30} />
              <span className="sr-only">Decrease</span>
            </Button>
            
            <div className="text-6xl font-bold text-center w-20">{gameCount}</div>
            
            <Button 
              onClick={incrementCount}
              variant="outline" 
              size="icon"
              className="rounded-full h-14 w-14"
            >
              <PlusCircle size={30} />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
          
          <p className="text-center text-lg">
            {gameCount === 1 ? "1 Game" : `${gameCount} Games`}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={() => onBack('welcome')}
            variant="outline"
          >
            Back
          </Button>
          <Button 
            onClick={() => onNext('gameEntry')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameCountSelector;
