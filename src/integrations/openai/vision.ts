import { BowlingScorecard, VisionAnalysisResponse } from '@/types/bowling';

const VISION_PROMPT = `This is a bowling scorecard. Please analyze it and return the scores in this exact JSON format: { frames: [{ frameNumber: number, ball1: number | null, ball2: number | null, ball3: number | null }] }. Use 10 for strikes, actual pin count for spares and open frames. For the 10th frame, include ball3 if present. Return ONLY the JSON, no other text.`;

export async function analyzeBowlingScorecard(imageFile: File): Promise<VisionAnalysisResponse> {
  try {
    // Convert the image file to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix if present
        const base64 = base64String.split(',')[1] || base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const requestBody = {
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageFile.type};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response content as JSON
    const result = JSON.parse(data.choices[0].message.content) as BowlingScorecard;
    
    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error analyzing scorecard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
} 