import { useCallback } from 'react';
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';
import { BowlingFrame } from '@/types/bowling';

interface ScorecardAnalyzerProps {
  onAnalysisComplete?: (frames: BowlingFrame[]) => void;
  className?: string;
}

export function ScorecardAnalyzer({ onAnalysisComplete, className = '' }: ScorecardAnalyzerProps) {
  const { analyzeImage, isLoading, error, data, reset } = useVisionAnalysis();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await analyzeImage(file);
      onAnalysisComplete?.(result.frames);
    } catch (err) {
      // Error is handled by the hook and displayed below
      console.error('Failed to analyze scorecard:', err);
    }
  }, [analyzeImage, onAnalysisComplete]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const result = await analyzeImage(file);
      onAnalysisComplete?.(result.frames);
    } catch (err) {
      console.error('Failed to analyze scorecard:', err);
    }
  }, [analyzeImage, onAnalysisComplete]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          ${isLoading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}
          transition-colors duration-200
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="text-gray-600">Analyzing scorecard...</p>
          </div>
        ) : (
          <>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="space-y-4">
                <div className="text-4xl text-gray-300">📷</div>
                <p className="text-gray-600">
                  Drop a scorecard image here or click to upload
                </p>
                <p className="text-sm text-gray-400">
                  Supports PNG, JPG, JPEG
                </p>
              </div>
            </label>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error analyzing scorecard</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
            {data.frames.map((frame) => (
              <div
                key={frame.frameNumber}
                className="p-3 border rounded-lg text-center bg-white shadow-sm"
              >
                <div className="text-sm font-medium text-gray-600">
                  Frame {frame.frameNumber}
                </div>
                <div className="mt-1 space-x-2 text-gray-900">
                  <span>{frame.ball1 === 10 ? 'X' : frame.ball1}</span>
                  <span>{frame.ball2 === 10 ? 'X' : frame.ball2}</span>
                  {frame.frameNumber === 10 && frame.ball3 !== null && (
                    <span>{frame.ball3 === 10 ? 'X' : frame.ball3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze Another Scorecard
          </button>
        </div>
      )}
    </div>
  );
} 