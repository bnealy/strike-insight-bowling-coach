import { useState } from 'react';
import { analyzeBowlingScorecard } from '@/integrations/openai/vision';
import { BowlingScorecard, VisionAnalysisResponse } from '@/types/bowling';

interface VisionAnalysisState {
  isLoading: boolean;
  error: string | null;
  data: BowlingScorecard | null;
}

export function useVisionAnalysis() {
  const [state, setState] = useState<VisionAnalysisState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const analyzeImage = async (file: File) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response: VisionAnalysisResponse = await analyzeBowlingScorecard(file);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to analyze scorecard');
      }

      setState({
        isLoading: false,
        error: null,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState({
        isLoading: false,
        error: errorMessage,
        data: null,
      });
      throw error;
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  };

  return {
    analyzeImage,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
} 