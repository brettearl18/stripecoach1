import { useState, useCallback } from 'react';
import { AIError } from '@/lib/services/aiService';

interface UseAIServiceOptions {
  cacheDuration?: number;
  retryCount?: number;
}

interface UseAIServiceState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAIService<T>(options: UseAIServiceOptions = {}) {
  const [state, setState] = useState<UseAIServiceState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const cache = new Map<string, { data: T; timestamp: number }>();
  const cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutes default
  const retryCount = options.retryCount || 3;

  const getCachedData = useCallback((key: string): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cacheDuration) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }, [cacheDuration]);

  const setCachedData = useCallback((key: string, data: T): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const execute = useCallback(async (
    key: string,
    apiCall: () => Promise<T>,
    retryAttempt: number = 0
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check cache first
      const cachedData = getCachedData(key);
      if (cachedData) {
        setState({ data: cachedData, isLoading: false, error: null });
        return;
      }

      // Make API call
      const data = await apiCall();
      
      // Cache the result
      setCachedData(key, data);
      
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      if (error instanceof AIError && error.retryable && retryAttempt < retryCount) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return execute(key, apiCall, retryAttempt + 1);
      }

      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }, [getCachedData, setCachedData, retryCount]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
} 