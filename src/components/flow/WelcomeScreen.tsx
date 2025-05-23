
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BowlingFlowStep } from '@/types/flowTypes';
import UserStatistics from './UserStatistics';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeScreenProps {
  onNext: (nextStep: BowlingFlowStep) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] w-full space-y-6">
      <Card className="w-full max-w-md bg-white bg-opacity-95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to BowlTracker</CardTitle>
          <CardDescription className="text-center text-lg">
            Track and save your bowling scores easily
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-7xl mb-6 flex justify-center">
            <span role="img" aria-label="bowling">🎳</span>
          </div>
          <p className="mb-4">
            Ready to record your bowling scores? Create a new session to get started.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => onNext('gameCount')}
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Create Session
          </Button>
        </CardFooter>
      </Card>
      
      {isAuthenticated && (
        <div className="w-full max-w-md">
          <UserStatistics />
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
