import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

admin.initializeApp();

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

export const generateCheckInSummary = functions.firestore
  .document('checkIns/{checkInId}')
  .onCreate(async (snap: any, context: any) => {
    const checkInData = snap.data();
    if (!checkInData) return;

    // Compose a prompt for the AI
    const answers = checkInData.answers || checkInData.responses || {};
    const prompt = `
      Summarize this client check-in in 3-5 sentences. Highlight key trends, risks, and positive changes.
      Answers: ${JSON.stringify(answers)}
    `;

    try {
      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      });

      const summary = response.choices[0]?.message?.content?.trim() || 'No summary generated.';

      // Update the check-in document with the AI summary
      await snap.ref.update({
        aiInsights: {
          summary,
          generatedAt: new Date().toISOString(),
        },
      });

      console.log('AI summary generated and saved.');
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Optionally, write an error field to Firestore for debugging
      await snap.ref.update({
        'aiInsights.error': (error as any).message || 'Unknown error',
      });
    }
  });