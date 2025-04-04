import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { MicrophoneIcon, PaperClipIcon, XMarkIcon, PlayIcon, CheckIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { AudioMessage, FileAttachment } from '@/types/feedback';
import { uploadFile } from '@/lib/services/uploadService';

interface FeedbackResponseProps {
  feedbackId: string;
  onSubmit: (data: {
    content?: string;
    audioMessage?: AudioMessage;
    attachments?: FileAttachment[];
    isAgreed: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function FeedbackResponse({
  feedbackId,
  onSubmit,
  onCancel
}: FeedbackResponseProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const {
    isRecording,
    duration: recordingDuration,
    recordedAudio,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadRecording,
    error: recordingError
  } = useAudioRecording({
    onError: (error) => setError(error.message)
  });

  useEffect(() => {
    if (audioRef.current && recordedAudio?.url) {
      const audio = audioRef.current;
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [recordedAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    try {
      const files = Array.from(event.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    } catch (err) {
      setError('Failed to add files. Please try again.');
    }
  };

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !recordedAudio?.url) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audioRef.current.play();
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          setCurrentTime(currentTime);
          setPlaybackProgress((currentTime / audioRef.current.duration) * 100);
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, recordedAudio]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setPlaybackProgress(0);
    setCurrentTime(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  const handleSubmit = useCallback(async (isAgreed: boolean) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let audioMessage: AudioMessage | undefined;
      if (recordedAudio) {
        audioMessage = await uploadRecording();
      }

      const attachments: FileAttachment[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            const attachment = await uploadFile(file);
            attachments.push(attachment);
          } catch (err) {
            console.error('Failed to upload file:', err);
            setError('Failed to upload some files. Please try again.');
            return;
          }
        }
      }

      await onSubmit({
        content: content.trim() || undefined,
        audioMessage,
        attachments,
        isAgreed
      });

      // Reset form
      setContent('');
      setUploadedFiles([]);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setPlaybackProgress(0);
        setCurrentTime(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, recordedAudio, uploadedFiles, onSubmit, uploadRecording]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 bg-gray-900/50 rounded-xl p-4">
      {/* Text Response */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your response here (minimum 10 words)..."
        className="w-full h-32 px-4 py-3 bg-gray-800/50 text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        disabled={isSubmitting}
      />

      {/* Audio Recording */}
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isRecording 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
          }`}
        >
          <MicrophoneIcon className="w-4 h-4" />
          {isRecording ? `Recording (${formatDuration(recordingDuration)})` : 'Record Audio'}
        </button>

        {recordedAudio && (
          <div className="flex items-center gap-2 flex-1">
            <button 
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
              disabled={isSubmitting}
            >
              {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-1 bg-amber-500 rounded-full transition-all duration-200" 
                  style={{ width: `${playbackProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                disabled={isSubmitting}
              />
            </div>
            <button 
              onClick={() => {
                cancelRecording();
                setPlaybackProgress(0);
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              disabled={isSubmitting}
              className="p-1.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            <audio
              ref={audioRef}
              src={recordedAudio.url}
              onEnded={handleAudioEnded}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
          <PaperClipIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Attach Files</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
        </label>
        {uploadedFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{uploadedFiles.length} file(s) selected</span>
            <button 
              onClick={() => setUploadedFiles([])}
              disabled={isSubmitting}
              className="p-1.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {(error || recordingError) && (
        <div className="text-red-400 text-sm">
          {error || recordingError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-400">
          {content.trim().split(/\s+/).length < 10 && 'Minimum 10 words required for text'}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || (!content.trim() && !recordedAudio && uploadedFiles.length === 0)}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Send Reply
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || (!content.trim() && !recordedAudio && uploadedFiles.length === 0)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            Reply & Agree
          </button>
        </div>
      </div>
    </div>
  );
} 