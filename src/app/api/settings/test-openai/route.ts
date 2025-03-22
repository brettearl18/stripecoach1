import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI with the provided key
    const openai = new OpenAI({
      apiKey: key,
    });

    // Try to make a simple API call to verify the key
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 1, // Minimum possible to save costs
    });

    // If we get here, the key is valid
    return NextResponse.json({ status: 'valid' });
  } catch (error: any) {
    console.error('Error testing OpenAI key:', error);

    // Check for specific OpenAI API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to test API key' },
      { status: 500 }
    );
  }
} 