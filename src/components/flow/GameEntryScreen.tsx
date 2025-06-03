import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BowlingFlowStep } from '@/types/flowTypes';
import BowlingGame from '../BowlingGame';
import GameEditorPanel from '../GameEditorPanel';
import PhotoUploader from '../PhotoUploader';
import Header from '@/components/Header';
import { Game } from '@/types/bowlingTypes';
import { analyzeBowlingScorecard } from '@/integrations/openai/vision';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSaveGames } from '@/hooks/useSaveGames';
import PinButtons from '../PinButtons';
import { calculateScoresForGame } from '@/utils/bowlingScoreUtils';

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
  sessions?: any[];
  markSessionAsSaved?: (sessionId: number) => void;
  updateActiveGame?: (updates: Partial<Game>) => void;
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
  sessions = [],
  markSessionAsSaved,
  updateActiveGame,
}) => {
  // ADD UPDATE LOGIC TOGGLE
  const USE_UPDATE_LOGIC = true; // Set to true when you want to enable smart update logic

  const [showRecalculateButton, setShowRecalculateButton] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasScoreInput, setHasScoreInput] = React.useState(false);
  const [gameBoxDimensions, setGameBoxDimensions] = React.useState({ width: 0, height: 0 });
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSaving, saveSessionsToDatabase } = useSaveGames();
  const navigate = useNavigate();
  const [finalScores, setFinalScores] = React.useState<{[gameId: number]: string}>({});
  const [editingFinalScore, setEditingFinalScore] = React.useState<number | null>(null);
  
  // Ref to measure game box dimensions
  const gameBoxRef = React.useRef<HTMLDivElement>(null);

 // REPLACE YOUR SMART WRAPPER FUNCTIONS in GameEntryScreen.tsx with these:
// REPLACE YOUR SMART WRAPPER FUNCTIONS in GameEntryScreen.tsx with these:


const findNextEmptyFrame = (frames: any[]) => {
  for (let i = 1; i <= 10; i++) {
    const frameIdx = i - 1;
    const frame = frames[frameIdx];
    if (frame && frame.balls[0] === null) {
      return i;
    }
  }
  return null;
};

// Helper function to check if frame is complete
const isFrameComplete = (frameNum: number, frames: any[]) => {
  const frameIdx = frameNum - 1;
  const frame = frames[frameIdx];
  if (!frame) return false;
  
  if (frameNum === 10) {
    const ball1 = frame.balls[0];
    const ball2 = frame.balls[1];
    const ball3 = frame.balls[2];
    
    if (ball1 === null) return false;
    if (ball1 === 10) {
      return ball2 !== null && ball3 !== null;
    } else {
      if (ball2 === null) return false;
      if (ball1 + ball2 === 10) {
        return ball3 !== null;
      }
      return true;
    }
  } else {
    const ball1 = frame.balls[0];
    const ball2 = frame.balls[1];
    
    if (ball1 === 10) return true;
    return ball1 !== null && ball2 !== null;
  }
};
/**
 * Smart wrapper for handleBallClick
 * Enforces ball order: must start at ball 1, then proceed to ball 2, etc.
 */
const smartHandleBallClick = (frameIndex: number, ballIndex: number) => {
 // console.log(`🎯 smartHandleBallClick called - Frame: ${frameIndex}, Ball: ${ballIndex}, USE_UPDATE_LOGIC: ${USE_UPDATE_LOGIC}`);
  
  if (USE_UPDATE_LOGIC) {
    const currentGame = games[0];
    const frames = currentGame?.frames ?? [];
    const frame = frames[frameIndex - 1]; // frameIndex is 1-based, array is 0-based
    
    if (!frame) {
 //     console.error('❌ Invalid frame index:', frameIndex);
      return;
    }
    
    // SMART LOGIC: Enforce ball order
    if (frameIndex === 10) {
      // 10th frame: must fill balls in order 1 → 2 → 3
      if (ballIndex === 1 && frame.balls[0] === null) {
        toast({
          title: "Invalid Edit",
          description: "You must fill Ball 1 before editing Ball 2.",
          variant: "destructive",
        });
        return;
      }
      if (ballIndex === 2 && (frame.balls[0] === null || frame.balls[1] === null)) {
        toast({
          title: "Invalid Edit", 
          description: "You must fill Ball 1 and Ball 2 before editing Ball 3.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Frames 1-9: must fill ball 1 before ball 2
      if (ballIndex === 1 && frame.balls[0] === null) {
        toast({
          title: "Invalid Edit",
          description: "You must fill Ball 1 before editing Ball 2.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // SMART LOGIC: Check current editing state and enforce rules
    const editingFrame = currentGame?.editingFrame;
    const editingBall = currentGame?.editingBall;
    
  // Function to check if a frame is incomplete
  const isFrameIncomplete = (frameNum: number) => {
    const frameIdx = frameNum - 1;
    const frameToCheck = frames[frameIdx];
    if (!frameToCheck) return false;
    
    if (frameNum === 10) {
      // 10th frame: check based on what's required
      const ball1 = frameToCheck.balls[0];
      const ball2 = frameToCheck.balls[1];
      const ball3 = frameToCheck.balls[2];
      
      if (ball1 === null) return false; // Need ball 1
      if (ball1 === 10) {
        // Strike: need balls 2 and 3
        return ball2 === null || ball3 === null;
      } else {
        // Not a strike: need ball 2
        if (ball2 === null) return true;
        if (ball1 + ball2 === 10) {
          // Spare: need ball 3
          return ball3 === null;
        }
        // Not spare, don't need ball 3
        return false;
      }
    } else {
      // Frames 1-9: need both balls unless strike
      const ball1 = frameToCheck.balls[0];
      const ball2 = frameToCheck.balls[1];
      
      if (ball1 === null) return false;
      if (ball1 === 10) return false; // Strike is complete
      return ball2 === null; // Need ball 2
    }
  };
  
  // CASE 1: User is currently editing a frame
 // const editingFrame = currentGame?.editingFrame;
 // const editingBall = currentGame?.editingBall;

  
  if (editingFrame !== null && editingBall !== null) {
    // Check if current editing frame is incomplete
    if (isFrameIncomplete(editingFrame)) {
      // If trying to click somewhere else while current frame is incomplete
      if (frameIndex !== editingFrame) {
        toast({
          title: "Complete Current Frame",
          description: `You must complete Frame ${editingFrame} before editing another frame.`,
          variant: "destructive",
        });
        return;
      }
    }
    // If current frame is complete, allow navigation to anywhere
  }
  
  console.log('✅ Smart validation passed, proceeding with ball click');
  //console.log('✅ Smart validation passed, proceeding with ball click');

  // SMART REDIRECT: Always start editing from Ball 1
  let targetBallIndex = ballIndex;
  
  if (updateActiveGame) {
    console.log('🔧 Setting editing state directly via updateActiveGame');
    updateActiveGame({
      editingFrame: frameIndex,
      editingBall: targetBallIndex
    });
  } else {
    // Frame 10: Check if we need to redirect based on what's filled
    const ball1 = frame.balls[0];
    const ball2 = frame.balls[1];
    
    if (ball1 === null) {
      targetBallIndex = 0; // Start with Ball 1
    } else if (ball2 === null && ballIndex === 2) {
      targetBallIndex = 1; // If clicking Ball 3 but Ball 2 is empty, go to Ball 2
    }
    // Otherwise use the clicked ball index for 10th frame
  }
  
  console.log(`🎯 Redirecting click from Ball ${ballIndex + 1} to Ball ${targetBallIndex + 1}`);
  console.log('🔧 About to call handleBallClick with:', {
    frameIndex: frameIndex,        // Should this be frameIndex - 1?
    targetBallIndex: targetBallIndex,
    frameState: frames[frameIndex - 1]?.balls
  });
  handleBallClick(frameIndex, targetBallIndex);
} else {
  // Original behavior
  console.log('📝 Using original handleBallClick behavior');
  handleBallClick(frameIndex, ballIndex);
}
};

/**
 * Smart wrapper for enterPins
 * Prevents navigation away from incomplete frames and auto-navigates to next empty frame
 */
const smartEnterPins = (pins: number) => {
  
  if (USE_UPDATE_LOGIC) {
    const currentGame = games[0];
    const frames = currentGame?.frames ?? [];
    
    if (!currentGame || !updateActiveGame) {
      console.error('❌ No active game or updateActiveGame function found');
      return;
    }
    
    // Get current editing position
    let targetFrame: number, targetBall: number;
    if (currentGame.editingFrame !== null && currentGame.editingBall !== null) {
      targetFrame = currentGame.editingFrame;
      targetBall = currentGame.editingBall;
    } else {
      targetFrame = currentGame.currentFrame;
      targetBall = currentGame.currentBall;
    }
    
    // Create new frames array with the pin entry
    const newFrames = [...frames];
    const frameIndex = targetFrame - 1;
    const frame = newFrames[frameIndex];
    
    
    // Clear future balls and scores when editing (keep original behavior)
if (currentGame.editingFrame !== null && currentGame.editingBall !== null && targetFrame === currentGame.editingFrame) {  
  if (targetFrame === 10) {
        for (let i = targetBall; i < 3; i++) {
          frame.balls[i] = null;
        }
      } else {
        for (let i = targetBall; i < 2; i++) {
          frame.balls[i] = null;
        }
      }
      
      for (let i = frameIndex+1; i < 10; i++) {
        newFrames[i].score = null;
      }
    }
    
    // Validate and set the pin value
    let isValidMove = false;
    let nextEditingFrame: number | null = targetFrame;
    let nextEditingBall: number | null = targetBall;
    let nextCurrentFrame = currentGame.currentFrame;
    let nextCurrentBall = currentGame.currentBall;
    
    if (targetFrame < 10) {
      // Frames 1-9 logic
      if (targetBall === 0) {
        if (pins > 10) {
          toast({
            title: "Invalid Entry",
            description: "Cannot knock down more than 10 pins.",
            variant: "destructive",
          });
          return;
        }
        frame.balls[0] = pins;
        isValidMove = true;
        
        if (pins === 10) {
          // Strike - frame complete, determine next editing position
          const nextEmptyFrame = findNextEmptyFrame(newFrames);
          if (nextEmptyFrame) {
            nextEditingFrame = nextEmptyFrame;
            nextEditingBall = 0;
          } else {
            nextEditingFrame = null;
            nextEditingBall = null;
          }
          nextCurrentFrame = nextEmptyFrame || (targetFrame < 10 ? targetFrame + 1 : targetFrame);          
          nextCurrentBall = 0;
        } else {
          // Not a strike, move to ball 2
          nextEditingBall = 1;
          nextCurrentBall = 1;
        }
      } else if (targetBall === 1) {
        if ((frame.balls[0] || 0) + pins > 10) {
          toast({
            title: "Invalid Entry",
            description: `Cannot knock down more than ${10 - (frame.balls[0] || 0)} pins.`,
            variant: "destructive",
          });
          return;
        }
        frame.balls[1] = pins;
        isValidMove = true;
        
        // Frame complete, determine next editing position
        const nextEmptyFrame = findNextEmptyFrame(newFrames);
        if (nextEmptyFrame) {
          nextEditingFrame = nextEmptyFrame;
          nextEditingBall = 0;
        } else {
          nextEditingFrame = null;
          nextEditingBall = null;
        }
        nextCurrentFrame = nextEmptyFrame|| targetFrame + 1;
        nextCurrentBall = 0;
      }
    } else {
      // Frame 10 logic
      if (targetBall === 0) {
        if (pins > 10) {
          toast({
            title: "Invalid Entry", 
            description: "Cannot knock down more than 10 pins.",
            variant: "destructive",
          });
          return;
        }
        frame.balls[0] = pins;
        isValidMove = true;
        nextEditingBall = 1;
        nextCurrentBall = 1;
      } else if (targetBall === 1) {
        if (frame.balls[0] === 10) {
          // After strike, ball 2 can be 0-10
          if (pins > 10) {
            toast({
              title: "Invalid Entry",
              description: "Cannot knock down more than 10 pins.",
              variant: "destructive",
            });
            return;
          }
          frame.balls[1] = pins;
          isValidMove = true;
          nextEditingBall = 2;
          nextCurrentBall = 2;
        } else {
          // After non-strike, check spare
          if ((frame.balls[0] || 0) + pins > 10) {
            toast({
              title: "Invalid Entry",
              description: `Cannot knock down more than ${10 - (frame.balls[0] || 0)} pins.`,
              variant: "destructive",
            });
            return;
          }
          frame.balls[1] = pins;
          isValidMove = true;
          
          if ((frame.balls[0] || 0) + pins === 10) {
            // Spare - need ball 3
            nextEditingBall = 2;
            nextCurrentBall = 2;
          } else {
            // Not spare - frame complete
            nextEditingFrame = null;
            nextEditingBall = null;
            nextCurrentBall = 3;
          }
        }
      } else if (targetBall === 2) {
        if (pins > 10) {
          toast({
            title: "Invalid Entry",
            description: "Cannot knock down more than 10 pins.",
            variant: "destructive",
          });
          return;
        }
        frame.balls[2] = pins;
        isValidMove = true;
        
        // 10th frame complete
        nextEditingFrame = null;
        nextEditingBall = null;
        nextCurrentBall = 3;
      }
    }
    
    if (!isValidMove) return;
    
    // Update the game state with our controlled logic
    const updatedGameData = {
      frames: newFrames,
      editingFrame: nextEditingFrame,
      editingBall: nextEditingBall,
      currentFrame: nextCurrentFrame,
      currentBall: nextCurrentBall
    };
    
    // Calculate scores
  const calculatedGame = calculateScoresForGame({
      ...currentGame,
      ...updatedGameData
 //     console.log('🧪 Bypassing score calculation');
 //   console.log('🔍 Frame states after all changes:', {
 //     frame1: newFrames[0]?.balls,
 //     frame2: newFrames[1]?.balls,
 //     frame3: newFrames[2]?.balls
    });
    
//    console.log('🔍 Just before updateActiveGame:', {
//      frame2BeforeCalc: newFrames[1]?.balls,
//      frame2AfterCalc: calculatedGame.frames[1]?.balls,
//      updatedGameDataFrames: updatedGameData.frames[1]?.balls
//    });
    // Apply all updates
    updateActiveGame({
      ...updatedGameData,
      frames: calculatedGame.frames,
      totalScore: calculatedGame.totalScore,
      gameComplete: calculatedGame.gameComplete
    });
    
    // Check if frame was completed and show appropriate message
    setTimeout(() => {
      const wasFrameCompleted = isFrameComplete(targetFrame, newFrames);
      if (wasFrameCompleted) {
        
        const nextEmpty = findNextEmptyFrame(newFrames);
        if (nextEmpty) {
          console.log({
            title: "Frame Complete!",
            description: `Frame ${targetFrame} completed. Now editing Frame ${nextEmpty}.`,
            variant: "default",
          });
        } else {
          // Check if game is complete
          const allComplete = newFrames.every((_, idx) => isFrameComplete(idx + 1, newFrames));
          if (allComplete) {
            toast({
              title: "Game Complete!",
              description: `Congratulations! Final score: ${calculatedGame.totalScore}`,
              variant: "default",
            });
          } else {
            toast({
              title: "Frame Complete!",
              description: `Frame ${targetFrame} completed. You can edit any frame.`,
              variant: "default",
            });
          }
        }
      }
    }, 100);
    
  } else {
    // Original behavior
    enterPins(pins);
  }
};

  // Measure game box dimensions
  React.useEffect(() => {
    const measureGameBox = () => {
      if (gameBoxRef.current) {
        const rect = gameBoxRef.current.getBoundingClientRect();
        const dimensions = { 
          width: rect.width - 48, // Subtract padding (24px * 2)
          height: rect.height - 48 
        };
        console.log('📏 GameEntryScreen measuring game box:');
        console.log('- Raw rect:', rect);
        console.log('- Calculated dimensions:', dimensions);
        console.log('- Will pass to GameEditorPanel:', {
          availableWidth: dimensions.width,
          availableHeight: dimensions.height * 0.6
        });
        setGameBoxDimensions(dimensions);
      }
    };

    // Initial measurement
    measureGameBox();

    // Remeasure on window resize
    window.addEventListener('resize', measureGameBox);
    return () => window.removeEventListener('resize', measureGameBox);
  }, [isEditMode]); // Remeasure when edit mode changes 

  // Check if user should see mock data button
  const shouldShowMockButton = user?.email?.toLowerCase().includes('bennealyfromeht') || false;

  const handleBackNavigation = () => {
    // Go back to previous page in browser history
    navigate(-1);
  };
  
  const recalculateScores = async () => {
    console.log('🔄 Manual score recalculation triggered...');
    
    handleBallClick(0, 0);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const firstFrameFirstBall = activeGame?.frames?.[0]?.balls?.[0];
    if (firstFrameFirstBall !== null && firstFrameFirstBall !== undefined) {
      enterPins(firstFrameFirstBall);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    cancelEdit();
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
    
    if (!Array.isArray(scores) || scores.length === 0) {
      console.error('Invalid scores data received');
      return;
    }

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
    
    const sortedScores = scores.sort((a, b) => a.frameNumber - b.frameNumber);
    processScoresSimply(sortedScores);
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
      const result = await analyzeBowlingScorecard(selectedFile);
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze scorecard');
      }

      console.log('Analysis successful:', result.data);
      const frames = result.data?.frames || [];
      if (frames.length === 0) {
        throw new Error('No frames detected in the scorecard');
      }

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
      setHasScoreInput(true);
    }
  };

  const handleSaveGame = async () => {
    try {
      console.log('Saving game...');
      
      if (!sessions || sessions.length === 0) {
        console.error('❌ No sessions available to save');
        toast({
          title: "Save Failed",
          description: "No sessions found to save.",
          variant: "destructive",
        });
        return;
      }
      
      await saveSessionsToDatabase(sessions, markSessionAsSaved || (() => {}));
      
      if (user) {
        console.log('Refreshing user bowling stats...');
        const { error: statsError } = await supabase.rpc('refresh_user_bowling_stats', {
          target_user_id: user.id
        });
        
        if (statsError) {
          console.error('Error refreshing stats:', statsError);
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
        
        if (i < 9) {
          if (balls[0] === 10) {
            console.log(`Frame ${i + 1}: Strike detected`);
            frame.score = 10;
            
            if (i < 8) {
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
            } else {
              console.log(`Frame 9 strike, looking at frame 10:`, scoredFrames[9].balls);
              frame.score += (scoredFrames[9].balls[0] || 0) + (scoredFrames[9].balls[1] || 0);
            }
            
            console.log(`Frame ${i + 1} strike score:`, frame.score);
            
          } else if ((balls[0] || 0) + (balls[1] || 0) === 10) {
            console.log(`Frame ${i + 1}: Spare detected`);
            frame.score = 10 + (scoredFrames[i + 1].balls[0] || 0);
            console.log(`Frame ${i + 1} spare score:`, frame.score);
            
          } else {
            console.log(`Frame ${i + 1}: Regular frame`);
            frame.score = (balls[0] || 0) + (balls[1] || 0);
            console.log(`Frame ${i + 1} regular score:`, frame.score);
          }
        } else {
          console.log(`Frame 10: Special scoring`);
          frame.score = (balls[0] || 0) + (balls[1] || 0) + (balls[2] || 0);
          console.log(`Frame 10 score:`, frame.score);
        }
        
        totalScore += frame.score;
        
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

  const handleFinalScoreSubmit = (gameId: number) => {
    const scoreStr = finalScores[gameId];
    const score = parseInt(scoreStr);
    
    if (!scoreStr || isNaN(score) || score < 0 || score > 300) {
      toast({
        title: "Invalid Score",
        description: "Please enter a valid score between 0 and 300.",
        variant: "destructive",
      });
      return;
    }
    
    const gameToUpdate = games.find(game => game.id === gameId);
    if (!gameToUpdate) {
      console.error('❌ Game not found:', gameId);
      return;
    }
    
    const emptyFrames = gameToUpdate.frames.map(frame => ({
      ...frame,
      balls: [null, null, null], // Clear existing ball data
      score: null // We're only setting total score
    }));
    
    if (updateGameFrames) {
      console.log('🔄 Setting final score for game:', gameId, 'Score:', score);
      updateGameFrames(gameId, emptyFrames, score);
      
      // Mark as having score input and clear the form
      setHasScoreInput(true);
      setFinalScores(prev => ({ ...prev, [gameId]: '' }));
      setEditingFinalScore(null);
      
      toast({
        title: "Score Updated",
        description: `Game ${games.findIndex(g => g.id === gameId) + 1} score set to ${score}.`,
      });
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
      const updatedFrames = [...activeGame.frames];
      
      console.log('📝 Original frames:', updatedFrames);
      
      sortedScores.forEach((frame) => {
        const frameIndex = frame.frameNumber - 1;
        
        if (frameIndex < 0 || frameIndex > 9) {
          console.warn(`❌ Invalid frame number: ${frame.frameNumber}`);
          return;
        }
        
        console.log(`📝 Setting Frame ${frame.frameNumber} balls:`, frame);
        
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
      
      console.log('🧮 About to call calculateBowlingScores...');
      
      const calculationResult = calculateBowlingScores(updatedFrames);
      
      console.log('✅ calculateBowlingScores returned:', calculationResult);
      
      const { frames: scoredFrames, totalScore } = calculationResult;
      
      console.log('✅ Calculated scores:', scoredFrames);
      console.log('📊 Total Score:', totalScore);
      
      if (updateGameFrames) {
        console.log('🔄 About to call updateGameFrames...');
        updateGameFrames(activeGame.id, scoredFrames, totalScore);
        console.log('🔄 updateGameFrames completed');
        
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
    <>
      <div className="game-entry-container">
        {/* Background Image */}
        <div 
          className="background-image"
          style={{
            backgroundImage: "url('/bowling_alley_photo.jpeg')"
          }}
        />
        
        {/* Dark Overlay */}
        <div className="overlay" />
        
        <div className="content-wrapper">
          {/* Bowling Game Display */}
          {games && games.length > 0 && (
            <div className="bowling-game-section">
              <BowlingGame
                game={games[0]}
                isActive={true}
                gameIndex={0}
                setActiveGameId={setActiveGameId}
                clearGame={() => clearGame(activeSessionId, games[0].id)}
                handleBallClick={smartHandleBallClick}
                toggleVisibility={() => toggleGameVisibility(activeSessionId, games[0].id)}
                savedStatus={activeSession?.savedToDatabase}
                currentFrame={games[0].currentFrame}
                currentBall={games[0].currentBall}
                editingFrame={games[0].editingFrame}
                editingBall={games[0].editingBall}
              />
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="actions-grid">
            {/* Left side: Editing and Upload actions */}
            <div className="left-actions">
              <div className="action-column">
                <button
                  onClick={handleManualScoreInput}
                  className={`action-button ${isEditMode ? 'active-edit' : 'primary-action'}`}
                >
                  {isEditMode ? '✓ Done Editing' : 'Manually Input Score'}
                </button>
              </div>
         {!isEditMode && (
                <>
              <div className="action-column">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="action-button primary-action"
                >
                  Upload Score Photo
                </label>
                
                {/* Mock Data Button - Only for specific user */}
                {shouldShowMockButton && (
                  <button 
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
                    className="mock-button"
                  >
                    🧪 Test Mock Data
                  </button>
                )}
              </div>

              <div className="action-column">
                {selectedFile && (
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="action-button primary-action"
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
                  <p className="file-name">
                    {selectedFile.name}
                  </p>
                )}
              </div>
                </>
              )}
              {/* HIDDEN: Final Score Button Section */}
              {false && (
                <div className="action-column">
                  {/* Final score content here */}
                </div>
              )}
            </div>

              {/* Right side: Save action */}
              <div className="right-actions">
                <div className="action-column">
                  <button
                    onClick={handleSaveGame}
                    disabled={!hasScoreInput || isSaving || !games[0]?.gameComplete}
                    className={`action-button ${
                      hasScoreInput && !isSaving && games[0]?.gameComplete 
                        ? 'primary-action' 
                        : 'disabled-action'
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
          </div>

          {/* Pin Selector - MOVED INSIDE content-wrapper */}
          {isEditMode && games && games.length > 0 && (
            <div className="pin-selector-section">
              <PinButtons
                onPinClick={smartEnterPins}
                currentFrame={games[0].currentFrame || 0}
                currentBall={games[0].currentBall || 0}
                frames={games[0].frames || []}
                editingFrame={games[0].editingFrame}
                editingBall={games[0].editingBall}
                gameComplete={games[0].gameComplete || false}
              />
            </div>
          )}

          {/* Back Button - Bottom Right */}
          <button
            onClick={handleBackNavigation}
            className="back-button"
          >
            <span>←</span>
            Back
          </button>
        </div>
        
      </div>
   {/* <-- content-wrapper ENDS here */}

      <style jsx>{`
        .game-entry-container {
          position: relative;
          min-height: 100vh;
          font-family: 'Comfortaa';
        }

        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          gap: 8px;
          min-height: auto !important;
          height: auto !important;
        }

        .bowling-game-section {
        background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 100%);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-top: 80px;
        margin-bottom: 0 !important; /* Remove any bottom margin */
        }

        .pin-selector-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .cancel-edit-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(220, 53, 69, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 25px;
          cursor: pointer;
          font-family: 'Comfortaa', cursive;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .cancel-edit-button:hover {
          background: rgba(220, 53, 69, 1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .actions-grid {
          display: flex; /* Changed from grid to flex for more control */
          justify-content: space-between; /* Pushes left and right to opposite sides */
          align-items: flex-start; /* Align both to top */
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
        }

        .left-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start; /* Left-align within left side */
          width: 50%; /* Force exactly half width */
          max-width: 50%;
          border: 2px solid blue !important;
          background: rgba(0, 0, 255, 0.1) !important;
        }

        .right-actions {
          display: flex;
          flex-direction: column;
          justify-content: flex-start; /* Start from top */
          align-items: flex-end; /* Right-align within right side */
          width: 50%; /* Force exactly half width */
          max-width: 50%;
          border: 2px solid blue !important;
          background: rgba(0, 0, 255, 0.1) !important;
        }

        .action-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* LEFT BUTTONS - Your existing sizing */
          .left-actions .action-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: left;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Comfortaa';
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          min-height: 48px;
          /* UPDATED: Constrain to half-page width */
          min-width: ${isEditMode ? '120px' : '240px'};
          max-width: ${isEditMode ? '280px' : '400px'};
        }

        .right-actions .action-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Comfortaa';
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          min-height: 48px;
          /* CONSTRAINED: Fits within right half */
          min-width: ${isEditMode ? '120px' : '280px'};
          max-width: ${isEditMode ? '240px' : '320px'};
        }
        .primary-action {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 100%);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .primary-action:hover {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.9) 0%, rgba(190, 114, 170, 0.9) 50%, rgba(114, 170, 190, 0.9) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .active-edit {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: 2px solid #2e7d32;
        }

        .active-edit:hover {
          background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
          transform: translateY(-2px);
        }

        .disabled-action {
          background: rgba(108, 117, 125, 0.8);
          color: rgba(255, 255, 255, 0.6);
          cursor: not-allowed;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .disabled-action:hover {
          transform: none;
        }

        .file-input {
          display: none;
        }

        .mock-button {
          width: 100%;
          background: rgba(255, 193, 7, 0.9);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Comfortaa';
          min-width: ${isEditMode ? '40px' : '40px'};
          max-width: ${isEditMode ? '180px' : '400px'};  
        }

        .mock-button:hover {
          background: rgba(255, 193, 7, 1);
          transform: translateY(-1px);
        }

        .file-name {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          text-align: center;
          margin: 0;
          word-break: break-all;
        }

        .back-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(108, 117, 125, 0.9);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Comfortaa';
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .back-button:hover {
          background: rgba(108, 117, 125, 1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        
        }
        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 8px;
            margin: 0;
          }


          .actions-grid {
            display: flex;
            justify-content: space-between; /* Pushes left and right to opposite sides */
            align-items: flex-start; /* Align both to top */
            gap: 16px;
            margin-bottom: 24px;
            width: 100%;
          }

          /* LEFT BUTTONS MOBILE */
          .left-actions .action-button {
            padding: 10px 12px;
            font-size: 0.8rem;
            min-height: 44px;
            min-width: ${isEditMode ? '120px' : '120px'};
            max-width: ${isEditMode ? '160px' : '200px'};
          }

          /* RIGHT BUTTON (SAVE) MOBILE - Larger than left */
          .right-actions .action-button {
            padding: 10px 12px;
            font-size: 0.8rem;
            min-height: 44px;
            /* Mobile: Still larger than left buttons */
            min-width: ${isEditMode ? '120px' : '120px'};
            max-width: ${isEditMode ? '200px' : '250px'};
          }

          .back-button {
            bottom: 16px;
            right: 16px;
            padding: 10px 16px;
            font-size: 0.9rem;
          }
        }

          /* Make final score input more mobile friendly */
          .final-score-panel {
            margin-left: -8px;
            margin-right: -8px;
          }

          .final-score-inputs {
            flex-direction: column;
            gap: 8px;
          }

          .final-score-inputs input {
            margin-bottom: 8px;
          }
        }

      @media (max-width: 480px) {
          .actions-grid {
            grid-template-columns: 1fr; /* Single column on very small screens */
            gap: 8px;
          }

          .left-actions .action-button {
            padding: 12px;
            font-size: 0.875rem;
            max-width: ${isEditMode ? '130px' : '140px'};
          }

          .right-actions .action-button {
            padding: 12px;
            font-size: 0.875rem;
            /* Small mobile: Still prominent but reasonable */
            min-width: ${isEditMode ? '140px' : '140px'};
            max-width: ${isEditMode ? '200px' : '240px'};
          }

          .back-button {
            bottom: 12px;
            right: 12px;
            padding: 8px 12px;
            font-size: 0.8rem;
          }
        }
          .game-box {
            padding: 8px;
            margin-left: -4px;
            margin-right: -4px;
            margin-top: 50px;
          }

          .actions-grid {
            grid-template-columns: 1fr; /* Single column on very small screens */
            gap: 8px;
          }

          .action-button {
            padding: 12px;
            font-size: 0.875rem;
          }

          .back-button {
            bottom: 12px;
            right: 12px;
            padding: 8px 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default GameEntryScreen;