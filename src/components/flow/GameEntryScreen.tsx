import React from 'react';
import { Button } from "@/components/ui/button";
import { BowlingFlowStep } from '@/types/flowTypes';
import BowlingGame from '../BowlingGame';
import GameEditorPanel from '../GameEditorPanel';
import PhotoUploader from '../PhotoUploader';
import { Game } from '@/types/bowlingTypes';

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
}) => {
  const handleScoresDetected = (scores: Array<{
    frameNumber: number,
    ball1: number | null,
    ball2: number | null,
    ball3: number | null
  }>) => {
    // Process each frame's scores in sequence
    scores.forEach((frame, index) => {
      if (frame.ball1 !== null) {
        handleBallClick(index, 0);
        enterPins(frame.ball1);
      }
      if (frame.ball2 !== null) {
        handleBallClick(index, 1);
        enterPins(frame.ball2);
      }
      if (index === 9 && frame.ball3 !== null) {
        handleBallClick(index, 2);
        enterPins(frame.ball3);
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => onBack('SESSION_SETUP')}
          className="text-white"
        >
          Back
        </Button>
        <h2 className="text-2xl font-bold text-white">Game Entry</h2>
        <div className="w-[70px]" /> {/* Spacer for alignment */}
      </div>

      <PhotoUploader onScoresDetected={handleScoresDetected} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="space-y-4">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Games</h3>
            <div className="space-y-2">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between bg-white bg-opacity-5 rounded p-3"
                >
                  <span className="text-white">Game {index + 1}</span>
                  <div className="space-x-2">
                    <Button
                      variant={game.id === activeGameId ? "default" : "outline"}
                      onClick={() => setActiveGameId(game.id)}
                      className="text-white"
                    >
                      {game.id === activeGameId ? "Editing" : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => clearGame(activeSessionId, game.id)}
                      className="text-white"
                    >
                      Clear
                    </Button>
                    <Button
                      variant={game.isVisible ? "default" : "outline"}
                      onClick={() => toggleGameVisibility(activeSessionId, game.id)}
                      className="text-white"
                    >
                      {game.isVisible ? "Visible" : "Hidden"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {activeGame && (
            <>
              <BowlingGame
                game={activeGame}
                isActive={true}
                gameIndex={activeGameIndex}
                setActiveGameId={setActiveGameId}
                clearGame={() => clearGame(activeSessionId, activeGame.id)}
                handleBallClick={handleBallClick}
                toggleVisibility={() => toggleGameVisibility(activeSessionId, activeGame.id)}
                savedStatus={activeSession?.savedToDatabase}
              />
              <GameEditorPanel
                gameIndex={activeGameIndex}
                currentFrame={activeGame.currentFrame || 0}
                currentBall={activeGame.currentBall || 0}
                frames={activeGame.frames || []}
                editingFrame={activeGame.editingFrame}
                editingBall={activeGame.editingBall}
                gameComplete={activeGame.gameComplete || false}
                enterPins={enterPins}
                cancelEdit={cancelEdit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEntryScreen;
