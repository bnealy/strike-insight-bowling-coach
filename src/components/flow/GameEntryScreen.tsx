
import React from 'react';
import { Button } from "@/components/ui/button";
import { BowlingFlowStep } from '@/types/flowTypes';
import BowlingGame from '../BowlingGame';
import GameEditorPanel from '../GameEditorPanel';
import { Game } from '@/types/bowlingTypes';

interface GameEntryScreenProps {
  gameCount: number;
  activeSession: any;
  activeSessionId: number;
  activeGameId: number;
  games: Game[];
  onBack: (prevStep: BowlingFlowStep) => void;
  setActiveGameId: (id: number) => void;
  clearGame: (sessionId: number, gameId: number) => void;
  handleBallClick: (frameIndex: number, ballIndex: number) => void;
  toggleGameVisibility: (sessionId: number, gameId: number) => void;
  enterPins: (pins: number) => void;
  cancelEdit: () => void;
  addGameToSession: () => void;
  hasUnsavedGames: boolean;
  onSaveGames: () => void;
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
  addGameToSession,
  hasUnsavedGames,
  onSaveGames
}) => {
  // Find the active game
  const activeGame = games.find(game => game.id === activeGameId);
  const visibleGames = games.filter(game => game.isVisible);
  const activeGameIndex = visibleGames.findIndex(g => g.id === activeGameId);

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {activeSession?.title || "New Session"}
            {activeSession?.savedToDatabase && (
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                Saved
              </span>
            )}
          </h2>
          
          <div className="flex gap-4">
            {visibleGames.length < gameCount && (
              <button
                onClick={addGameToSession}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
              >
                Add Another Game
              </button>
            )}
            
            {hasUnsavedGames && (
              <button
                onClick={onSaveGames}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
              >
                Save Games
              </button>
            )}
          </div>
        </div>
        
        {visibleGames.map((game, index) => (
          <BowlingGame
            key={game.id}
            game={game}
            isActive={game.id === activeGameId}
            gameIndex={index}
            setActiveGameId={setActiveGameId}
            clearGame={() => clearGame(activeSessionId, game.id)}
            handleBallClick={(frameIndex, ballIndex) => {
              setActiveGameId(game.id);
              handleBallClick(frameIndex, ballIndex);
            }}
            toggleVisibility={() => toggleGameVisibility(activeSessionId, game.id)}
            savedStatus={activeSession?.savedToDatabase}
          />
        ))}
        
        {visibleGames.length === 0 && (
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center text-white">
            <p>No visible games in this session. Add a game to get started.</p>
          </div>
        )}
      </div>
      
      {activeGame && (
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
      )}
      
      <div className="flex justify-start mt-6 mb-10">
        <Button 
          onClick={() => onBack('gameCount')}
          variant="outline"
          className="text-white border-white"
        >
          Change Game Count
        </Button>
      </div>
    </div>
  );
};

export default GameEntryScreen;
