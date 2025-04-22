import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, sectionTitle } = await request.json();

    const systemPrompt = `You are an expert coach helping to create questions for a coaching template. 
The section you're creating questions for is "${sectionTitle}".
Generate 3-5 relevant questions based on the coach's requirements.
Each question should be clear, focused, and help gather meaningful insights from clients.

Format your response as a JSON array of question objects with the following structure:
[
  {
    "text": "Question text here",
    "type": "text" | "scale" | "multipleChoice" | "yesNo",
    "options": ["option1", "option2"] // Only include for multipleChoice type
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const questions = JSON.parse(content).questions || [];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 