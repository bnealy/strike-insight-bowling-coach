import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { analyzeBowlingScorecard } from '@/integrations/openAI/vision';

interface DetectedScore {
  frameNumber: number;
  ball1: number | null;
  ball2: number | null;
  ball3: number | null;
}

interface PhotoUploaderProps {
  onScoresDetected: (scores: DetectedScore[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onScoresDetected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
      onScoresDetected(frames);

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

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="photo-upload"
      />
      <div className="flex gap-4">
        <label
          htmlFor="photo-upload"
          className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Select Photo
        </label>
        {selectedFile && (
          <Button
            onClick={processImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Analyze Scorecard'
            )}
          </Button>
        )}
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;