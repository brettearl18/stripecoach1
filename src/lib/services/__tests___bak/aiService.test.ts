import OpenAI from 'openai';
import { AIService } from '../aiService';
import { CheckInForm } from '@/types/checkIn';

// Mock OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

describe('AIService', () => {
  let service: AIService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create new service instance
    service = new AIService();
    
    // Get reference to mocked create method
    mockCreate = (service as any).openai.chat.completions.create;
    
    // Setup default mock response
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            overallMood: [
              { category: 'Energy', score: 7.8, trend: 'up', change: 0.5 }
            ],
            recentWins: ['Great progress!'],
            commonChallenges: ['Time management'],
            insights: [
              { type: 'success', message: 'Good momentum', impact: 'high' }
            ],
            focusAreas: ['Maintain consistency']
          })
        }
      }]
    });
  });

  it('should analyze a check-in and return insights', async () => {
    const checkIn: CheckInForm = {
      metrics: { steps: 10000 },
      answers: { mood: 'Great' },
      coachInteraction: { lastFeedback: 'Keep it up!' }
    };

    const result = await service.analyzeCheckIn(checkIn);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: expect.stringContaining(JSON.stringify(checkIn.metrics)) }
      ]),
      temperature: 0.7,
      max_tokens: 500
    });

    expect(result).toEqual({
      overallMood: [
        { category: 'Energy', score: 7.8, trend: 'up', change: 0.5 }
      ],
      recentWins: ['Great progress!'],
      commonChallenges: ['Time management'],
      insights: [
        { type: 'success', message: 'Good momentum', impact: 'high' }
      ],
      focusAreas: ['Maintain consistency']
    });
  });

  it('should handle invalid AI response gracefully', async () => {
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'Invalid JSON'
        }
      }]
    });

    const checkIn: CheckInForm = {
      metrics: { steps: 10000 },
      answers: { mood: 'Great' },
      coachInteraction: { lastFeedback: 'Keep it up!' }
    };

    const result = await service.analyzeCheckIn(checkIn);
    expect(result).toBeDefined();
    expect(result.overallMood).toBeDefined();
    expect(result.recentWins).toBeDefined();
  });

  it('should generate insights for a group of check-ins', async () => {
    const checkIns: CheckInForm[] = [{
      metrics: { steps: 10000 },
      answers: { mood: 'Great' },
      coachInteraction: { lastFeedback: 'Keep it up!' }
    }];

    const result = await service.generateGroupInsights(checkIns);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: expect.stringContaining('totalClients') }
      ]),
      temperature: 0.7,
      max_tokens: 500
    });

    expect(result).toBeDefined();
    expect(result.overallMood).toBeDefined();
    expect(result.recentWins).toBeDefined();
  });

  it('should handle empty check-ins array', async () => {
    const result = await service.generateGroupInsights([]);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: expect.stringContaining('{"totalClients":0,"averageMetrics":{}}') }
      ]),
      temperature: 0.7,
      max_tokens: 500
    });

    expect(result).toBeDefined();
    expect(result.overallMood).toBeDefined();
    expect(result.recentWins).toBeDefined();
  });
});