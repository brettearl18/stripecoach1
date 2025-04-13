import { NextRequest, NextResponse } from 'next/server';
import { Question } from '@/lib/services/firebaseService';
import { createWorker } from 'tesseract.js';
import { google } from 'googleapis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function processImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();
  return text;
}

async function processGoogleSheet(spreadsheetId: string) {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('Google Sheets integration is not configured. Please contact your administrator.');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
      // Get all data from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:Z', // Get all columns to be thorough
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in the spreadsheet. Please make sure the sheet contains questions.');
      }

      // Find potential question columns by looking for question-like text
      const questionColumns: number[] = [];
      response.data.values[0]?.forEach((header, index) => {
        const headerText = String(header).toLowerCase();
        if (
          headerText.includes('question') || 
          headerText.includes('ask') || 
          headerText.endsWith('?') ||
          (index === 0 && response.data.values.some(row => String(row[0] || '').endsWith('?'))) // First column contains questions
        ) {
          questionColumns.push(index);
        }
      });

      // If no question columns found, assume first column contains questions
      if (questionColumns.length === 0) {
        questionColumns.push(0);
      }

      // Extract questions and their options
      const questions = new Map<string, Set<string>>();
      
      response.data.values.forEach(row => {
        questionColumns.forEach(colIndex => {
          const questionText = String(row[colIndex] || '').trim();
          if (
            questionText && 
            questionText !== 'Question' && 
            !questionText.toLowerCase().includes('week') &&
            !questionText.match(/^\d{1,2}-\w{3}-\d{4}$/) // Skip dates
          ) {
            // Look for options in adjacent columns and subsequent rows
            const options = new Set<string>();
            
            // Look horizontally for options
            for (let i = 0; i < row.length; i++) {
              if (i !== colIndex) {
                const value = String(row[i] || '').trim();
                if (value && !value.match(/^\d{1,2}-\w{3}-\d{4}$/)) {
                  options.add(value);
                }
              }
            }

            // Look vertically for repeated values in the same column
            response.data.values.forEach(otherRow => {
              const value = String(otherRow[colIndex] || '').trim();
              if (value && value !== questionText && !value.match(/^\d{1,2}-\w{3}-\d{4}$/)) {
                options.add(value);
              }
            });

            // Filter out common non-option values
            const filteredOptions = Array.from(options).filter(opt => 
              opt !== '-' && 
              opt !== '' && 
              !opt.includes('Week') &&
              !opt.includes('2024') &&
              !opt.toLowerCase().includes('question')
            );

            if (questionText.endsWith('?') || questionText.toLowerCase().includes('how') || questionText.toLowerCase().startsWith('did')) {
              questions.set(questionText, new Set(filteredOptions));
            }
          }
        });
      });

      // Convert to text format for AI processing
      const text = Array.from(questions.entries()).map(([question, options]) => {
        let questionText = question;
        const optionsArray = Array.from(options);
        if (optionsArray.length > 0) {
          questionText += '\nOptions: ' + optionsArray.join(', ');
        }
        return questionText;
      }).join('\n\n');

      return text;

    } catch (error: any) {
      console.error('Google Sheets API error:', error);
      
      if (error.code === 403) {
        throw new Error('Access denied. Please make sure the spreadsheet is shared with ' + process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL);
      } else if (error.code === 404) {
        throw new Error('Spreadsheet not found. Please check the URL and make sure the spreadsheet exists.');
      } else if (error.message) {
        throw new Error(`Google Sheets error: ${error.message}`);
      }
      throw new Error('Failed to access Google Sheet. Please check the URL and try again.');
    }
  } catch (error) {
    console.error('Google Sheets processing error:', error);
    throw error;
  }
}

async function enhanceWithAI(text: string): Promise<Partial<Question>[]> {
  const prompt = `Analyze the following questions and their options to create a structured check-in form. For each question:
1. Identify the most appropriate question type:
   - 'yesNo' for yes/no questions
   - 'scale' for rating questions (e.g. Really Good/Average/Poor)
   - 'number' for numerical inputs
   - 'text' for open text responses
   - 'multipleChoice' for questions with specific options
2. Extract any multiple choice options if present
3. Suggest an appropriate weight (-10 to +10) based on the question's importance for health tracking
4. Determine if it should be required (most health tracking questions should be)
5. Categorize it into one of these categories: exercise, nutrition, mindset, lifestyle, sleep, stress, body, goals
6. Identify a relevant subcategory
7. Add helpful placeholder text or help text if appropriate

Text to analyze:
${text}

Respond in JSON format like this:
{
  "questions": [
    {
      "question": "string",
      "type": "string",
      "options": ["string"],
      "weight": number,
      "required": boolean,
      "category": "string",
      "subcategory": "string",
      "helpText": "string",
      "placeholder": "string"
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a health and fitness coach creating a check-in form. Focus on creating structured, consistent questions that provide valuable insights for tracking client progress."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content);
    return result.questions;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const googleSheetUrl = formData.get('googleSheetUrl') as string;
    const numberOfQuestions = parseInt(formData.get('numberOfQuestions') as string) || 5;
    const categories = JSON.parse(formData.get('categories') as string || '[]');
    
    let text = '';
    
    if (googleSheetUrl) {
      const urlPatterns = [
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
        /\/d\/([a-zA-Z0-9-_]+)/,
        /^([a-zA-Z0-9-_]+)$/
      ];
      
      let spreadsheetId = null;
      for (const pattern of urlPatterns) {
        const matches = googleSheetUrl.match(pattern);
        if (matches && matches[1]) {
          spreadsheetId = matches[1];
          break;
        }
      }
      
      if (!spreadsheetId) {
        return NextResponse.json(
          { error: 'Invalid Google Sheets URL. Please use the sharing URL from Google Sheets.' },
          { status: 400 }
        );
      }
      
      text = await processGoogleSheet(spreadsheetId);
      console.log('Processed text from sheet:', text); // Add logging for debugging
    } else if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      if (file.type.startsWith('image/')) {
        text = await processImage(buffer);
      } else {
        text = buffer.toString();
      }
    } else if (categories.length > 0) {
      const questions = await generateAIQuestions(numberOfQuestions, categories);
      return NextResponse.json({
        questions,
        preview: {
          extractedText: 'AI-generated questions based on selected categories',
          totalQuestions: questions.length
        }
      });
    } else {
      return NextResponse.json(
        { error: 'No input provided' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'No content could be extracted from the input' },
        { status: 400 }
      );
    }

    const questions = await enhanceWithAI(text);

    return NextResponse.json({
      questions,
      preview: {
        extractedText: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('Error processing input:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing input' },
      { status: 500 }
    );
  }
}

async function generateAIQuestions(numberOfQuestions: number, categories: string[]): Promise<Partial<Question>[]> {
  const prompt = `Generate ${numberOfQuestions} questions for a health and fitness coaching check-in form. 
Focus on these categories: ${categories.join(', ')}.

For each question:
1. Make it specific and actionable
2. Include appropriate weight (-10 to +10)
3. Determine if it should be required
4. Choose the best question type (yes/no, scale, number, text, multipleChoice)
5. Add relevant help text
6. For multiple choice, include 3-5 options
7. Distribute questions evenly across selected categories
8. Include appropriate subcategories

Respond in JSON format like this:
{
  "questions": [
    {
      "question": "string",
      "type": "string",
      "options": ["string"],
      "weight": number,
      "required": boolean,
      "category": "string",
      "subcategory": "string",
      "helpText": "string",
      "isNegative": boolean
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a professional fitness coach creating a check-in form. Focus on actionable, measurable questions that provide valuable insights."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content);
    return result.questions;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
} 