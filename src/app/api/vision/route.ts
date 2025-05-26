import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This is a bowling scorecard. Please analyze it and return the scores in this exact JSON format: { frames: [{ frameNumber: number, ball1: number | null, ball2: number | null, ball3: number | null }] }. Use 10 for strikes, actual pin count for spares and open frames. For the 10th frame, include ball3 if present. Return ONLY the JSON, no other text."
            },
            {
              type: "image_url",
              image_url: image
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      return NextResponse.json(
        { error: 'No analysis results' },
        { status: 500 }
      );
    }

    try {
      // Try to parse the response as JSON
      const parsedResult = JSON.parse(result);
      return NextResponse.json(parsedResult);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid response format', raw: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 