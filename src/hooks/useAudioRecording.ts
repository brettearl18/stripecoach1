import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecordingService, AudioRecordingError } from '@/lib/services/audioRecordingService';
import { AudioMessage } from '@/types/feedback';

interface UseAudioRecordingProps {
  onError?: (error: Error) => void;
}

interface UseAudioRecordingReturn {
  isRecording: boolean;
  duration: number;
  recordedAudio: AudioMessage | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  uploadRecording: (feedbackId: string) => Promise<AudioMessage>;
  error: Error | null;
}

export function useAudioRecording({
  onError
}: UseAudioRecordingProps = {}): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<AudioMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const recordingService = useRef<AudioRecordingService | null>(null);
  const recordedBlob = useRef<Blob | null>(null);
  const recordedDuration = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize recording service
  useEffect(() => {
    recordingService.current = new AudioRecordingService();
    
    return () => {
      if (recordingService.current?.isRecording()) {
        recordingService.current.cancelRecording();
      }
    };
  }, []);

  // Update duration while recording
  useEffect(() => {
    if (isRecording && recordingService.current) {
      durationInterval.current = setInterval(() => {
        setDuration(recordingService.current!.getCurrentDuration());
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  const handleError = useCallback((error: Error) => {
    setError(error);
    onError?.(error);
  }, [onError]);

  const startRecording = useCallback(async () => {
    try {
      if (!recordingService.current) {
        throw new AudioRecordingError('Recording service not initialized');
      }

      await recordingService.current.startRecording();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new AudioRecordingError('Failed to start recording')
      );
    }
  }, [handleError]);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingService.current) {
        throw new AudioRecordingError('Recording service not initialized');
      }

      const { blob, duration } = await recordingService.current.stopRecording();
      recordedBlob.current = blob;
      recordedDuration.current = duration;
      setIsRecording(false);
      setDuration(0);
      setError(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new AudioRecordingError('Failed to stop recording')
      );
    }
  }, [handleError]);

  const cancelRecording = useCallback(() => {
    try {
      if (!recordingService.current) {
        throw new AudioRecordingError('Recording service not initialized');
      }

      recordingService.current.cancelRecording();
      setIsRecording(false);
      setDuration(0);
      recordedBlob.current = null;
      recordedDuration.current = 0;
      setError(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new AudioRecordingError('Failed to cancel recording')
      );
    }
  }, [handleError]);

  const uploadRecording = useCallback(async (feedbackId: string): Promise<AudioMessage> => {
    try {
      if (!recordingService.current) {
        throw new AudioRecordingError('Recording service not initialized');
      }

      if (!recordedBlob.current) {
        throw new AudioRecordingError('No recording available to upload');
      }

      const audioMessage = await recordingService.current.uploadRecording(
        feedbackId,
        recordedBlob.current,
        recordedDuration.current
      );

      setRecordedAudio(audioMessage);
      setError(null);
      return audioMessage;
    } catch (error) {
      handleError(
        error instanceof Error ? error : new AudioRecordingError('Failed to upload recording')
      );
      throw error;
    }
  }, [handleError]);

  return {
    isRecording,
    duration,
    recordedAudio,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadRecording,
    error
  };
} 