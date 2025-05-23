
export type BowlingFlowStep = 'welcome' | 'gameCount' | 'gameEntry';

export interface FlowState {
  currentStep: BowlingFlowStep;
  gameCount: number;
}
