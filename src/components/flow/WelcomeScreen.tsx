import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BowlingFlowStep } from '@/types/flowTypes';
//import UserStatistics from './UserStatistics';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeScreenProps {
  onNext: (step: BowlingFlowStep) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-black">Welcome to Strike Insight</CardTitle>
          <CardDescription className="text-center text-lg text-gray-600">
            {isAuthenticated 
              ? "Ready to bowl? Start a new session or view your saved games."
              : "Track and save your bowling scores easily"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-7xl mb-6 flex justify-center">
            <span role="img" aria-label="bowling">🎳</span>
          </div>
          <p className="mb-4 text-gray-700">
            {isAuthenticated 
              ? "Create a new session to start tracking your games."
              : "Sign in to save your scores and track your progress over time."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            onClick={() => onNext('gameCount')}
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-white"
          >
            Start New Session
          </Button>
          {isAuthenticated && (
            <Button 
              onClick={() => window.location.href = '/saved-games'}
              variant="outline"
              className="px-8 py-6 text-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              View Saved Games
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
