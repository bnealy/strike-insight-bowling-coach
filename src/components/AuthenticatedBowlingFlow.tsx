
import React from 'react';
import WelcomeScreen from './flow/WelcomeScreen';
import GameCountSelector from './flow/GameCountSelector';
import GameEntryScreen from './flow/GameEntryScreen';
import { FlowState, BowlingFlowStep } from '@/types/flowTypes';
import { BowlingSession } from '@/hooks/useBowlingGame';

interface AuthenticatedBowlingFlowProps {
  flowState: FlowState;
  activeSession: BowlingSession | undefined;
  activeSessionId: number;
  activeGameId: number;
  onNextStep: (step: BowlingFlowStep) => void;
  onPreviousStep: (step: BowlingFlowStep) => void;
  onGameCountChange: (count: number) => void;
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

const AuthenticatedBowlingFlow: React.FC<AuthenticatedBowlingFlowProps> = ({
  flowState,
  activeSession,
  activeSessionId,
  activeGameId,
  onNextStep,
  onPreviousStep,
  onGameCountChange,
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
  if (flowState.currentStep === 'welcome') {
    return <WelcomeScreen onNext={onNextStep} />;
  }
  
  if (flowState.currentStep === 'gameCount') {
    return (
      <GameCountSelector 
        gameCount={flowState.gameCount}
        onGameCountChange={onGameCountChange}
        onNext={onNextStep}
        onBack={onPreviousStep}
      />
    );
  }
  
  if (flowState.currentStep === 'gameEntry' && activeSession) {
    return (
      <GameEntryScreen 
        gameCount={flowState.gameCount}
        activeSession={activeSession}
        activeSessionId={activeSessionId}
        activeGameId={activeGameId}
        games={activeSession.games}
        setActiveGameId={setActiveGameId}
        clearGame={clearGame}
        handleBallClick={handleBallClick}
        toggleGameVisibility={toggleGameVisibility}
        enterPins={enterPins}
        cancelEdit={cancelEdit}
        addGameToSession={addGameToSession}
        onBack={onPreviousStep}
        hasUnsavedGames={hasUnsavedGames}
        onSaveGames={onSaveGames}
      />
    );
  }
  
  return null;
};

export default AuthenticatedBowlingFlow;
