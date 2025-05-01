import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes text concisely and professionally.'
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function analyzeProgress(data: any) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fitness and wellness expert analyzing client progress data.'
        },
        {
          role: 'user',
          content: `Please analyze this progress data and provide insights:\n\n${JSON.stringify(data)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error analyzing progress:', error);
    throw error;
  }
}

export async function generateRecommendations(clientData: any) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fitness and wellness expert providing personalized recommendations.'
        },
        {
          role: 'user',
          content: `Please provide recommendations based on this client data:\n\n${JSON.stringify(clientData)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
} 