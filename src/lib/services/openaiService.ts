import OpenAI from 'openai';
import { ApiRoute } from '../../types';

// Rate limiting configuration based on OpenAI tier
const RATE_LIMITS = {
  TPM: 200000, // Tokens per minute
  RPM: 500,    // Requests per minute
  RPD: 10000   // Requests per day
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Rate limiting state
let requestsThisMinute = 0;
let requestsToday = 0;
let lastMinuteTimestamp = Date.now();
let lastDayTimestamp = Date.now();

// Rate limiting check
const checkRateLimits = () => {
  const now = Date.now();
  
  // Reset minute counter if a minute has passed
  if (now - lastMinuteTimestamp > 60000) {
    requestsThisMinute = 0;
    lastMinuteTimestamp = now;
  }
  
  // Reset daily counter if a day has passed
  if (now - lastDayTimestamp > 86400000) {
    requestsToday = 0;
    lastDayTimestamp = now;
  }
  
  // Check limits
  if (requestsThisMinute >= RATE_LIMITS.RPM) {
    throw new Error('Rate limit exceeded: Too many requests per minute');
  }
  
  if (requestsToday >= RATE_LIMITS.RPD) {
    throw new Error('Rate limit exceeded: Too many requests per day');
  }
  
  // Increment counters
  requestsThisMinute++;
  requestsToday++;
};

interface PageAnalysis {
  title: string;
  description: string;
  connections: string[];
  dataDependencies: string[];
  suggestedImprovements: string[];
}

interface FlowAnalysis {
  source: string;
  target: string;
  dataType: string;
  security: 'public' | 'protected';
  suggestedOptimizations: string[];
}

export class OpenAIService {
  static async analyzePage(page: string, routes: ApiRoute[]): Promise<PageAnalysis> {
    checkRateLimits();
    
    const prompt = `
      Analyze the following page and its connections in a web application:
      Page: ${page}
      Available Routes: ${JSON.stringify(routes, null, 2)}
      
      Provide a detailed analysis including:
      1. Key connections to other pages
      2. Data dependencies
      3. Suggested improvements for data flow
      4. Security considerations
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are a web architecture expert analyzing page connections and data flow."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = completion.choices[0].message.content;
      return this.parseAnalysis(analysis);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to analyze page. Please try again later.');
    }
  }

  static async analyzeDataFlow(routes: ApiRoute[]): Promise<FlowAnalysis[]> {
    checkRateLimits();
    
    const prompt = `
      Analyze the data flow between these API routes:
      ${JSON.stringify(routes, null, 2)}
      
      For each connection, provide:
      1. Data types being transferred
      2. Security requirements
      3. Potential optimizations
      4. Dependencies on other routes
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are a data flow expert analyzing API connections and dependencies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return this.parseFlowAnalysis(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to analyze data flow. Please try again later.');
    }
  }

  static async suggestOptimizations(page: string, currentConnections: string[]): Promise<string[]> {
    checkRateLimits();
    
    const prompt = `
      Suggest optimizations for the following page and its connections:
      Page: ${page}
      Current Connections: ${JSON.stringify(currentConnections)}
      
      Consider:
      1. Performance improvements
      2. Security enhancements
      3. User experience
      4. Data flow efficiency
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are a web optimization expert providing specific, actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return this.parseSuggestions(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to get optimization suggestions. Please try again later.');
    }
  }

  private static parseAnalysis(analysis: string): PageAnalysis {
    // Parse the OpenAI response into structured data
    // This is a simplified version - you might want to make it more robust
    const sections = analysis.split('\n\n');
    return {
      title: sections[0]?.split(':')[1]?.trim() || '',
      description: sections[1]?.split(':')[1]?.trim() || '',
      connections: sections[2]?.split(':')[1]?.split(',').map(c => c.trim()) || [],
      dataDependencies: sections[3]?.split(':')[1]?.split(',').map(d => d.trim()) || [],
      suggestedImprovements: sections[4]?.split(':')[1]?.split(',').map(i => i.trim()) || []
    };
  }

  private static parseFlowAnalysis(analysis: string): FlowAnalysis[] {
    // Parse the OpenAI response into structured data
    // This is a simplified version - you might want to make it more robust
    const flows = analysis.split('\n\n');
    return flows.map(flow => {
      const sections = flow.split('\n');
      return {
        source: sections[0]?.split(':')[1]?.trim() || '',
        target: sections[1]?.split(':')[1]?.trim() || '',
        dataType: sections[2]?.split(':')[1]?.trim() || '',
        security: (sections[3]?.split(':')[1]?.trim() as 'public' | 'protected') || 'public',
        suggestedOptimizations: sections[4]?.split(':')[1]?.split(',').map(o => o.trim()) || []
      };
    });
  }

  private static parseSuggestions(suggestions: string): string[] {
    // Parse the OpenAI response into an array of suggestions
    return suggestions.split('\n')
      .filter(s => s.trim().length > 0)
      .map(s => s.replace(/^\d+\.\s*/, '').trim());
  }
} 