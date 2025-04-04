import { AudioMessage } from '@/types/feedback';
import { uploadAudio } from './uploadService';

export class AudioRecordingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioRecordingError';
  }
}

interface RecordingState {
  isRecording: boolean;
  duration: number;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  startTime: number;
}

export class AudioRecordingService {
  private state: RecordingState = {
    isRecording: false,
    duration: 0,
    stream: null,
    mediaRecorder: null,
    audioChunks: [],
    startTime: 0
  };

  private timer: NodeJS.Timeout | null = null;

  // Start recording audio
  async startRecording(): Promise<void> {
    try {
      if (this.state.isRecording) {
        throw new AudioRecordingError('Recording is already in progress');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.state.audioChunks.push(event.data);
        }
      };

      // Reset state
      this.state = {
        isRecording: true,
        duration: 0,
        stream,
        mediaRecorder,
        audioChunks: [],
        startTime: Date.now()
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Start duration timer
      this.timer = setInterval(() => {
        this.state.duration = Math.floor((Date.now() - this.state.startTime) / 1000);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new AudioRecordingError(
        error instanceof Error ? error.message : 'Failed to start recording'
      );
    }
  }

  // Stop recording and get the audio blob
  async stopRecording(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.state.isRecording || !this.state.mediaRecorder) {
          throw new AudioRecordingError('No recording in progress');
        }

        const { mediaRecorder } = this.state;

        mediaRecorder.onstop = () => {
          // Clear timer
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }

          // Create final audio blob
          const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
          const duration = this.state.duration;

          // Stop all tracks
          if (this.state.stream) {
            this.state.stream.getTracks().forEach(track => track.stop());
          }

          // Reset state
          this.state = {
            isRecording: false,
            duration: 0,
            stream: null,
            mediaRecorder: null,
            audioChunks: [],
            startTime: 0
          };

          resolve({ blob: audioBlob, duration });
        };

        mediaRecorder.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
        reject(
          new AudioRecordingError(
            error instanceof Error ? error.message : 'Failed to stop recording'
          )
        );
      }
    });
  }

  // Cancel recording
  cancelRecording(): void {
    try {
      if (!this.state.isRecording) {
        return;
      }

      // Clear timer
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      // Stop media recorder if active
      if (this.state.mediaRecorder?.state === 'recording') {
        this.state.mediaRecorder.stop();
      }

      // Stop all tracks
      if (this.state.stream) {
        this.state.stream.getTracks().forEach(track => track.stop());
      }

      // Reset state
      this.state = {
        isRecording: false,
        duration: 0,
        stream: null,
        mediaRecorder: null,
        audioChunks: [],
        startTime: 0
      };
    } catch (error) {
      console.error('Error canceling recording:', error);
      throw new AudioRecordingError(
        error instanceof Error ? error.message : 'Failed to cancel recording'
      );
    }
  }

  // Get current recording duration
  getCurrentDuration(): number {
    return this.state.duration;
  }

  // Check if currently recording
  isRecording(): boolean {
    return this.state.isRecording;
  }

  // Upload recorded audio
  async uploadRecording(
    feedbackId: string,
    blob: Blob,
    duration: number
  ): Promise<AudioMessage> {
    try {
      return await uploadAudio(feedbackId, blob, duration);
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw new AudioRecordingError(
        error instanceof Error ? error.message : 'Failed to upload recording'
      );
    }
  }
} 