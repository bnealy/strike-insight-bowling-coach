
import { useState } from 'react';
import BowlingScorecard from '@/components/BowlingScorecard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Target, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const [showScorecard, setShowScorecard] = useState(false);

  if (showScorecard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Bowling Scorecard</h1>
            <Button 
              variant="outline" 
              onClick={() => setShowScorecard(false)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Back to Home
            </Button>
          </div>
          <BowlingScorecard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Strike Analytics
          </h1>
          <p className="text-xl text-blue-700 mb-8 max-w-2xl mx-auto">
            Track your bowling scores, analyze your game, and improve your performance with data-driven insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowScorecard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Scoring
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              Sign Up for Insights
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-blue-900">Score Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Easy-to-use 10-frame scorecard with automatic calculation
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-blue-900">Game Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed analysis of strikes, spares, and scoring patterns
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-blue-900">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor improvement over time with comprehensive statistics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-blue-900">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Save games and compare with other bowlers (coming soon)
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            See It In Action
          </h2>
          <p className="text-lg text-blue-700 mb-8">
            Try our interactive scorecard - no signup required for single games
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowScorecard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl"
          >
            Try Demo Scorecard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
