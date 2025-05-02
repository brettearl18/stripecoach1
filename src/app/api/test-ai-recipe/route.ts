import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Give me a detailed recipe for a traditional meat pie, including ingredients, instructions, and a full macronutrient breakdown (protein, carbs, fat, calories) per serving.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a nutrition and recipe expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    const recipe = completion.choices[0].message.content;
    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error('AI Recipe Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate recipe.' }, { status: 500 });
  }
} 