import { AIService, AIError } from '../aiService';
import { CheckInForm } from '@/types/checkIn';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('AIService', () => {
  let aiService: AIService;
  const mockApiKey = 'test-api-key';
  const mockCheckIn: CheckInForm = {
    id: '1',
    timestamp: new Date().toISOString(),
    metrics: {},
    answers: {},
    coachInteraction: {}
  };

  beforeEach(() => {
    aiService = new AIService(mockApiKey);
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      const mockError = {
        response: { status: 429 },
        message: 'Rate limit exceeded'
      };

      (aiService as any).openai.chat.completions.create.mockRejectedValueOnce(mockError);

      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toThrow(AIError);
      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toMatchObject({
        type: 'RATE_LIMIT',
        retryable: true
      });
    });

    it('should handle network errors', async () => {
      const mockError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      (aiService as any).openai.chat.completions.create.mockRejectedValueOnce(mockError);

      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toThrow(AIError);
      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toMatchObject({
        type: 'NETWORK',
        retryable: true
      });
    });

    it('should handle validation errors', async () => {
      const mockError = new Error('Invalid response format');
      (aiService as any).parseAIResponse = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toThrow(AIError);
      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toMatchObject({
        type: 'VALIDATION',
        retryable: false
      });
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry on retryable errors', async () => {
      const mockError = {
        response: { status: 429 },
        message: 'Rate limit exceeded'
      };

      (aiService as any).openai.chat.completions.create
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Test response' } }]
        });

      const result = await aiService.analyzeCheckIn(mockCheckIn);
      expect(result).toBeDefined();
      expect((aiService as any).openai.chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockError = new Error('Invalid request');
      (aiService as any).openai.chat.completions.create.mockRejectedValueOnce(mockError);

      await expect(aiService.analyzeCheckIn(mockCheckIn)).rejects.toThrow();
      expect((aiService as any).openai.chat.completions.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Caching', () => {
    it('should return cached data when available', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }]
      };

      (aiService as any).openai.chat.completions.create.mockResolvedValueOnce(mockResponse);

      // First call should hit the API
      const result1 = await aiService.analyzeCheckIn(mockCheckIn);
      expect(result1).toBeDefined();

      // Second call should use cache
      const result2 = await aiService.analyzeCheckIn(mockCheckIn);
      expect(result2).toEqual(result1);
      expect((aiService as any).openai.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache after duration', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }]
      };

      (aiService as any).openai.chat.completions.create.mockResolvedValue(mockResponse);

      // First call
      await aiService.analyzeCheckIn(mockCheckIn);

      // Fast forward time
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Second call should hit API again
      await aiService.analyzeCheckIn(mockCheckIn);
      expect((aiService as any).openai.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid AI responses', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Line 1\nLine 2\nLine 3' } }]
      };

      (aiService as any).openai.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await aiService.analyzeCheckIn(mockCheckIn);
      expect(result.insights).toHaveLength(3);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        choices: [{ message: { content: '' } }]
      };

      (aiService as any).openai.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await aiService.analyzeCheckIn(mockCheckIn);
      expect(result.insights).toHaveLength(0);
    });
  });
}); 