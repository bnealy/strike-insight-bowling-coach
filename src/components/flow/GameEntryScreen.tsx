import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { BowlingFlowStep } from '@/types/flowTypes';
import BowlingGame from '../BowlingGame';
import GameEditorPanel from '../GameEditorPanel';
import PhotoUploader from '../PhotoUploader';
import { Game } from '@/types/bowlingTypes';
import { analyzeBowlingScorecard } from '@/integrations/openAI/vision';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSaveGames } from '@/hooks/useSaveGames'; // Add this import


interface GameEntryScreenProps {
  gameCount: number;
  activeSession: any;
  activeSessionId: number;
  activeGameId: number;
  games: Game[];
  onBack: (prevStep: string) => void;
  setActiveGameId: (id: number) => void;
  clearGame: (sessionId: number, gameId: number) => void;
  handleBallClick: (frameIndex: number, ballIndex: number) => void;
  toggleGameVisibility: (sessionId: number, gameId: number) => void;
  enterPins: (pins: number) => void;
  cancelEdit: () => void;
  activeGame?: Game;
  activeGameIndex?: number;
  updateGameFrames?: (gameId: number, frames: any[], totalScore: number) => void;
  sessions?: any[]; // Add this - we need access to the sessions to save them
  markSessionAsSaved?: (sessionId: number) => void; // Add this callback
}

const GameEntryScreen: React.FC<GameEntryScreenProps> = ({
  gameCount,
  activeSession,
  activeSessionId,
  activeGameId,
  games,
  onBack,
  setActiveGameId,
  clearGame,
  handleBallClick,
  toggleGameVisibility,
  enterPins,
  cancelEdit,
  activeGame,
  activeGameIndex = 0,
  updateGameFrames,
  sessions = [], // Add default empty array
  markSessionAsSaved, // Destructure the new prop
}) => {
  const [showRecalculateButton, setShowRecalculateButton] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasScoreInput, setHasScoreInput] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSaving, saveSessionsToDatabase } = useSaveGames(); // Use the save hook
  

  const recalculateScores = async () => {
    console.log('🔄 Manual score recalculation triggered...');
    
    // Click on Frame 1 to trigger recalculation
    handleBallClick(0, 0);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Re-enter the first frame's first ball value
    const firstFrameFirstBall = activeGame?.frames?.[0]?.balls?.[0];
    if (firstFrameFirstBall !== null && firstFrameFirstBall !== undefined) {
      enterPins(firstFrameFirstBall);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Cancel edit mode
    cancelEdit();
    
    // Hide the button since scores should now be calculated
    setShowRecalculateButton(false);
    
    console.log('✅ Score recalculation complete!');
  };

  const handleScoresDetected = (scores: Array<{
    frameNumber: number,
    ball1: number | null,
    ball2: number | null,
    ball3: number | null
  }>) => {
    console.log('=== SCORES DETECTED ===');
    console.log('Received scores:', scores);
    
    // Validate the data format
    if (!Array.isArray(scores) || scores.length === 0) {
      console.error('Invalid scores data received');
      return;
    }

    // Find a game to use
    let gameToUse = null;
    
    if (activeGame) {
      gameToUse = activeGame;
      console.log('Using activeGame prop:', gameToUse.id);
    } else if (activeGameId && games) {
      gameToUse = games.find(game => game.id === activeGameId);
      console.log('Found game by activeGameId:', gameToUse?.id);
    } else if (games && games.length > 0) {
      gameToUse = games[0];
      console.log('Using first available game:', gameToUse.id);
      setActiveGameId(gameToUse.id);
    }

    if (!gameToUse) {
      console.error('❌ No game available to populate scores');
      return;
    }
    
    console.log('✅ Processing scores interactively for game ID:', gameToUse.id);
    
    // Sort by frame number to ensure correct order
    const sortedScores = scores.sort((a, b) => a.frameNumber - b.frameNumber);
    
    // Process scores with the simplified approach
    processScoresSimply(sortedScores);
    
    // Mark that we have score input
    setHasScoreInput(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting image analysis...');
      // Call the vision analysis function directly
      const result = await analyzeBowlingScorecard(selectedFile);
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze scorecard');
      }

      console.log('Analysis successful:', result.data);
      // Extract frames from the result
      const frames = result.data?.frames || [];
      if (frames.length === 0) {
        throw new Error('No frames detected in the scorecard');
      }

      // Pass the frames to the parent component
      handleScoresDetected(frames);
      toast({
        title: "Success!",
        description: `Analyzed ${frames.length} frames successfully.`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to analyze scorecard",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualScoreInput = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setHasScoreInput(true); // Mark that manual input is being used
    }
  };

  const handleSaveGame = async () => {
    try {
      console.log('Saving game...');
      console.log('Sessions data:', sessions);
      console.log('Sessions length:', sessions.length);
      console.log('markSessionAsSaved function:', markSessionAsSaved);
      
      // Check if we have sessions to save
      if (!sessions || sessions.length === 0) {
        console.error('❌ No sessions available to save');
        toast({
          title: "Save Failed",
          description: "No sessions found to save.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('About to call saveSessionsToDatabase...');
      
      // Use the actual save function from useSaveGames hook
      await saveSessionsToDatabase(sessions, markSessionAsSaved || (() => {}));
      
      console.log('✅ saveSessionsToDatabase completed successfully');
      
      // After successfully saving the game, refresh the user's stats
      if (user) {
        console.log('Refreshing user bowling stats...');
        const { error: statsError } = await supabase.rpc('refresh_user_bowling_stats', {
          target_user_id: user.id
        });
        
        if (statsError) {
          console.error('Error refreshing stats:', statsError);
          // Don't fail the save if stats refresh fails
        } else {
          console.log('✅ User stats refreshed successfully');
        }
      }
      
      toast({
        title: "Game Saved",
        description: "Your bowling game has been saved successfully.",
      });
      
    } catch (error) {
      console.error('❌ Error saving game:', error);
      console.error('❌ Error details:', error.message, error.stack);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save your game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateBowlingScores = (frames: any[]) => {
    console.log('🧮 Starting calculateBowlingScores with frames:', frames);
    
    try {
      let totalScore = 0;
      const scoredFrames = [...frames];

      for (let i = 0; i < 10; i++) {
        console.log(`📊 Processing frame ${i + 1}...`);
        
        const frame = scoredFrames[i];
        const balls = frame.balls;
        
        console.log(`Frame ${i + 1} balls:`, balls);
        
        if (i < 9) { // Frames 1-9
          if (balls[0] === 10) { // Strike
            console.log(`Frame ${i + 1}: Strike detected`);
            frame.score = 10;
            
            if (i < 8) { // Can look ahead 2 frames
              const nextFrame = scoredFrames[i + 1];
              const nextNextFrame = scoredFrames[i + 2];
              
              console.log(`Looking ahead to frame ${i + 2}:`, nextFrame.balls);
              console.log(`Looking ahead to frame ${i + 3}:`, nextNextFrame.balls);
              
              frame.score += (nextFrame.balls[0] || 0);
              if (nextFrame.balls[0] === 10) {
                frame.score += (nextNextFrame.balls[0] || 0);
              } else {
                frame.score += (nextFrame.balls[1] || 0);
              }
            } else { // Frame 9, look at frame 10
              console.log(`Frame 9 strike, looking at frame 10:`, scoredFrames[9].balls);
              frame.score += (scoredFrames[9].balls[0] || 0) + (scoredFrames[9].balls[1] || 0);
            }
            
            console.log(`Frame ${i + 1} strike score:`, frame.score);
            
          } else if ((balls[0] || 0) + (balls[1] || 0) === 10) { // Spare
            console.log(`Frame ${i + 1}: Spare detected`);
            frame.score = 10 + (scoredFrames[i + 1].balls[0] || 0);
            console.log(`Frame ${i + 1} spare score:`, frame.score);
            
          } else { // Regular frame
            console.log(`Frame ${i + 1}: Regular frame`);
            frame.score = (balls[0] || 0) + (balls[1] || 0);
            console.log(`Frame ${i + 1} regular score:`, frame.score);
          }
        } else { // Frame 10
          console.log(`Frame 10: Special scoring`);
          frame.score = (balls[0] || 0) + (balls[1] || 0) + (balls[2] || 0);
          console.log(`Frame 10 score:`, frame.score);
        }
        
        totalScore += frame.score;
        
        // Update cumulative score
        if (i === 0) {
          frame.cumulativeScore = frame.score;
        } else {
          frame.cumulativeScore = scoredFrames[i - 1].cumulativeScore + frame.score;
        }
        
        console.log(`Frame ${i + 1} cumulative score:`, frame.cumulativeScore);
        console.log(`Running total:`, totalScore);
      }

      console.log('✅ calculateBowlingScores completed successfully');
      console.log('Final total score:', totalScore);
      console.log('Final scored frames:', scoredFrames);
      
      return { frames: scoredFrames, totalScore };
      
    } catch (error) {
      console.error('❌ Error in calculateBowlingScores:', error);
      throw error;
    }
  };

  const processScoresSimply = async (sortedScores: Array<{
    frameNumber: number,
    ball1: number | null,
    ball2: number | null,
    ball3: number | null
  }>) => {
    console.log('🎯 Starting direct score processing...');
    
    if (!activeGame) {
      console.error('❌ No active game to update');
      return;
    }
    
    try {
      // Create updated frames with the new ball data
      const updatedFrames = [...activeGame.frames];
      
      console.log('📝 Original frames:', updatedFrames);
      
      sortedScores.forEach((frame) => {
        const frameIndex = frame.frameNumber - 1;
        
        if (frameIndex < 0 || frameIndex > 9) {
          console.warn(`❌ Invalid frame number: ${frame.frameNumber}`);
          return;
        }
        
        console.log(`📝 Setting Frame ${frame.frameNumber} balls:`, frame);
        
        // Update the frame's balls directly
        if (frame.ball1 !== null) {
          updatedFrames[frameIndex].balls[0] = frame.ball1;
        }
        if (frame.ball2 !== null) {
          updatedFrames[frameIndex].balls[1] = frame.ball2;
        }
        if (frame.frameNumber === 10 && frame.ball3 !== null) {
          updatedFrames[frameIndex].balls[2] = frame.ball3;
        }
      });
      
      console.log('📝 Updated frames before calculation:', updatedFrames);
      
      // Calculate all the bowling scores manually
      console.log('🧮 About to call calculateBowlingScores...');
      
      const calculationResult = calculateBowlingScores(updatedFrames);
      
      console.log('✅ calculateBowlingScores returned:', calculationResult);
      
      const { frames: scoredFrames, totalScore } = calculationResult;
      
      console.log('✅ Calculated scores:', scoredFrames);
      console.log('📊 Total Score:', totalScore);
      
      // NOW update the game using the parent's update function (AFTER calculation)
      if (updateGameFrames) {
        console.log('🔄 About to call updateGameFrames...');
        updateGameFrames(activeGame.id, scoredFrames, totalScore);
        console.log('🔄 updateGameFrames completed');
        
        // Force a re-render after a brief delay (Option 1)
        setTimeout(() => {
          console.log('🔄 Triggering additional update...');
          setActiveGameId(activeGame.id);
        },50);
      } else {
        console.log('⚠️ No updateGameFrames function available');
      }
      
      console.log('🎯 Score processing complete!');
      
    } catch (error) {
      console.error('❌ Error in processScoresSimply:', error);
      console.error('❌ Error stack:', error.stack);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Game Entry</h2>
      </div>

      {/* Game Box - Contains the actual bowling game */}
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6 mb-6 border-2 border-white border-opacity-20">
        {/* Force render BowlingGame using first available game */}
        {games && games.length > 0 && (
          <BowlingGame
            game={games[0]} // Use first game instead of activeGame
            isActive={true}
            gameIndex={0}
            setActiveGameId={setActiveGameId}
            clearGame={() => clearGame(activeSessionId, games[0].id)}
            handleBallClick={handleBallClick}
            toggleVisibility={() => toggleGameVisibility(activeSessionId, games[0].id)}
            savedStatus={activeSession?.savedToDatabase}
          />
        )}

        {/* Game Editor Panel - Only show when in edit mode */}
        {isEditMode && games && games.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <GameEditorPanel
              gameIndex={0}
              currentFrame={games[0].currentFrame || 0}
              currentBall={games[0].currentBall || 0}
              frames={games[0].frames || []}
              editingFrame={games[0].editingFrame}
              editingBall={games[0].editingBall}
              gameComplete={games[0].gameComplete || false}
              enterPins={enterPins}
              cancelEdit={() => {
                cancelEdit();
                setIsEditMode(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Main Action Buttons - 4-button layout */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Column 1: Manual Input Score */}
        <div className="space-y-2">
          <button
            onClick={handleManualScoreInput}
            className={`w-full cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
              isEditMode 
                ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-500' 
                : 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
            }`}
          >
            {isEditMode ? '✓ Done' : 'Manually Input Score'}
          </button>
        </div>

        {/* Column 2: Upload Score Photo */}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="w-full cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Upload Score Photo
          </label>
          
          {/* Mock Data Button - Only for you */}
          {true && ( // Replace with your user check
            <Button 
              onClick={() => {
                console.log('Test button clicked - simulating scorecard upload');
                const mockScores = [
                  { frameNumber: 1, ball1: 7, ball2: 3, ball3: null },
                  { frameNumber: 2, ball1: 10, ball2: null, ball3: null },
                  { frameNumber: 3, ball1: 8, ball2: 1, ball3: null },
                  { frameNumber: 4, ball1: 6, ball2: 4, ball3: null },
                  { frameNumber: 5, ball1: 10, ball2: null, ball3: null },
                  { frameNumber: 6, ball1: 9, ball2: 0, ball3: null },
                  { frameNumber: 7, ball1: 8, ball2: 2, ball3: null },
                  { frameNumber: 8, ball1: 7, ball2: 2, ball3: null },
                  { frameNumber: 9, ball1: 10, ball2: null, ball3: null },
                  { frameNumber: 10, ball1: 9, ball2: 1, ball3: 7 }
                ];
                handleScoresDetected(mockScores);
              }}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 h-7"
            >
              🧪 Test Mock Data
            </Button>
          )}
        </div>

        {/* Column 3: Analyze (only shows when file selected) */}
        <div className="space-y-2">
          {selectedFile && (
            <button
              onClick={processImage}
              disabled={isProcessing}
              className="w-full cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Analyze Scorecard'
              )}
            </button>
          )}

          {selectedFile && (
            <p className="text-xs text-white text-opacity-70 truncate">
              {selectedFile.name}
            </p>
          )}
        </div>

        {/* Column 4: Save Game */}
        <div className="space-y-2">
          <button
            onClick={handleSaveGame}
            disabled={!hasScoreInput || isSaving}
            className={`w-full cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 ${
              hasScoreInput && !isSaving
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Game'
            )}
          </button>
        </div>
      </div>

      {/* Back Button - Bottom Right */}
      <Button
        variant="outline"
        onClick={() => onBack('SESSION_SETUP')}
        className="fixed bottom-6 right-6 bg-gray-600 hover:bg-gray-700 text-white border-gray-500 px-6 py-3 text-base font-semibold flex items-center gap-2 shadow-lg"
      >
        <span>←</span>
        Back
      </Button>
    </div>
  );
};

export default GameEntryScreen;