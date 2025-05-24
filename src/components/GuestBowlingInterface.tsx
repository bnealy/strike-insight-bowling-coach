import React from 'react';
import BowlingGame from './BowlingGame';
import GameEditorPanel from './GameEditorPanel';
import { BowlingSession } from '@/hooks/useBowlingGame';
import { Game } from '@/types/bowlingTypes';

interface GuestBowlingInterfaceProps {
  activeSession: BowlingSession | undefined;
  activeGameId: number;
  addGameToSession: () => void;
  onSaveGames: () => void;
  setActiveGameId: (id: number) => void;
  clearGame: (sessionId: number, gameId: number) => void;
  handleBallClick: (frameIndex: number, ballIndex: number) => void;
  toggleGameVisibility: (sessionId: number, gameId: number) => void;
  onDeleteGame: (gameId: number) => void;
  enterPins: (pins: number) => void;
  cancelEdit: () => void;
  activeSessionId: number;
}

const GuestBowlingInterface: React.FC<GuestBowlingInterfaceProps> = ({
  activeSession,
  activeGameId,
  addGameToSession,
  onSaveGames,
  setActiveGameId,
  clearGame,
  handleBallClick,
  toggleGameVisibility,
  onDeleteGame,
  enterPins,
  cancelEdit,
  activeSessionId
}) => {
  const visibleGames = activeSession?.games.filter(game => game.isVisible) || [];
  const activeGame = activeSession?.games.find(game => game.id === activeGameId);
  const activeGameIndex = visibleGames.findIndex(g => g.id === activeGameId);

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {activeSession?.title || "New Session"}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={addGameToSession}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
            >
              Add Another Game
            </button>
            
            <button
              onClick={onSaveGames}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
            >
              Save Games
            </button>
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
            savedStatus={false}
            isAuthenticated={false}
            onDeleteGame={() => onDeleteGame(game.id)}
          />
        ))}
        
        {visibleGames.length === 0 && (
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center text-white">
            <p>No games in this session. Add a game to get started.</p>
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
    </div>
  );
};

export default GuestBowlingInterface;
