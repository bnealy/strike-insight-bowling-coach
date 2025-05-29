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
}) => {
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
          {/* Bowling Game Display - No container wrapper */}
          {games && games.length > 0 && (
            <div className="bowling-game-section">
              <BowlingGame
                game={games[0]}
                isActive={true}
                gameIndex={0}
                setActiveGameId={setActiveGameId}
                clearGame={() => clearGame(activeSessionId, games[0].id)}
                handleBallClick={handleBallClick}
                toggleVisibility={() => toggleGameVisibility(activeSessionId, games[0].id)}
                savedStatus={activeSession?.savedToDatabase}
                currentFrame={games[0].currentFrame}
                currentBall={games[0].currentBall}
                editingFrame={games[0].editingFrame}
                editingBall={games[0].editingBall}
              />
            </div>
          )}

          {/* Pin Selector - Only show when in edit mode */}
          {isEditMode && games && games.length > 0 && (
            <div className="pin-selector-section">
              <PinButtons
                onPinClick={enterPins}
                currentFrame={games[0].currentFrame || 0}
                currentBall={games[0].currentBall || 0}
                frames={games[0].frames || []}
                editingFrame={games[0].editingFrame}
                editingBall={games[0].editingBall}
                gameComplete={games[0].gameComplete || false}
              />
              
              {/* Cancel Edit Button */}
              {/*<button
                onClick={() => {
                  cancelEdit();
                  setIsEditMode(false);
                }}
                className="cancel-edit-button"
              >
                ✕ Cancel Edit
              </button>*/}
            </div>
          )}

          {/* Main Action Buttons - 4-button layout */}
          <div className="actions-grid">
            {/* Column 1: Manual Input Score */}
            <div className="action-column">
              <button
                onClick={handleManualScoreInput}
                className={`action-button ${isEditMode ? 'active-edit' : 'primary-action'}`}
              >
                {isEditMode ? '✓ Done Editing' : 'Manually Input Score'}
              </button>
            </div>

            {/* Column 2: Upload Score Photo */}
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

              {/* Final Score Button */}
              <button
                onClick={() => setEditingFinalScore(editingFinalScore === games[0].id ? null : games[0].id)}
                className="action-button primary-action"
                style={{
                  marginTop: '12px',
                  background: editingFinalScore === games[0].id
                    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                    : undefined
                }}
              >
                {editingFinalScore === games[0].id ? '✓ Done' : '# Score'}
              </button>

              {/* Final Score Input Panel */}
              {editingFinalScore === games[0].id && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h4 style={{
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '12px',
                    fontWeight: 600
                  }}>
                    Enter Final Score for Game 1
                  </h4>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      placeholder="Enter score (0-300)"
                      value={finalScores[games[0].id] || ''}
                      onChange={(e) => setFinalScores(prev => ({ ...prev, [games[0].id]: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontFamily: "'Comfortaa'"
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleFinalScoreSubmit(games[0].id);
                        }
                      }}
                    />

                    <button
                      onClick={() => handleFinalScoreSubmit(games[0].id)}
                      className="action-button primary-action"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Set Score
                    </button>

                    <button
                      onClick={() => {
                        setEditingFinalScore(null);
                        setFinalScores(prev => ({ ...prev, [games[0].id]: '' }));
                      }}
                      className="action-button"
                      style={{ background: 'rgba(108, 117, 125, 0.8)' }}
                    >
                      Cancel
                    </button>
                  </div>

                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    This will set the total score without frame-by-frame details.
                  </p>
                </div>
              )}

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

            {/* Column 3: Analyze (only shows when file selected) */}
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

            {/* Column 4: Save Game */}
            <div className="action-column">
              <button
                onClick={handleSaveGame}
                disabled={!hasScoreInput || isSaving}
                className={`action-button ${hasScoreInput && !isSaving ? 'primary-action' : 'disabled-action'}`}
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
          <button
            onClick={handleBackNavigation}
            className="back-button"
          >
            <span>←</span>
            Back
          </button>
        </div>
      </div>

      <style jsx>{`
        .game-entry-container {
          position: relative;
          min-height: 100vh;
          font-family: 'Comfortaa', cursive;
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
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .bowling-game-section {
          background: linear-gradient(135deg, rgba(87, 40, 74, 0.8) 0%, rgba(190, 114, 170, 0.8) 50%, rgba(114, 170, 190, 0.8) 100%);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-top: 80px; /* Account for header height */
        }

        .pin-selector-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          position: relative;
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
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .action-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-button {
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
            padding: 8px; /* Reduced padding significantly */
            margin: 0; /* Remove any margin */
          }

          .game-box {
            padding: 12px; /* Reduced padding */
            margin-top: 60px; /* Reduced margin for mobile */
            margin-bottom: 16px;
            border-radius: 8px; /* Smaller border radius */
            margin-left: -8px; /* Extend to screen edges */
            margin-right: -8px;
            max-width: calc(100vw); /* Full viewport width */
          }

          .actions-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
            gap: 12px;
            margin-bottom: 16px;
          }

          .action-button {
            padding: 10px 12px;
            font-size: 0.8rem;
            min-height: 44px;
          }

          .back-button {
            bottom: 16px;
            right: 16px;
            padding: 10px 16px;
            font-size: 0.9rem;
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
          .content-wrapper {
            padding: 4px; /* Even less padding on very small screens */
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

        /* Ensure bowling game frames are responsive */
        @media (max-width: 768px) {
          :global(.bowling-game-container) {
            overflow-x: auto;
            padding-bottom: 8px;
          }

          :global(.bowling-frames-container) {
            min-width: max-content;
            display: flex;
            gap: 2px;
          }

          :global(.bowling-frame) {
            min-width: 60px; /* Ensure minimum frame width */
            flex-shrink: 0;
          }
        }
      `}</style>
    </>
  );
};

export default GameEntryScreen;