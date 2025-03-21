'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';

// Temporary test data
const messages = [
  {
    id: 1,
    content: 'Hi Sarah, I have a question about my meal plan.',
    type: 'text',
    from: 'client',
    timestamp: '2024-03-16T10:30:00Z'
  },
  {
    id: 2,
    content: 'Of course! What would you like to know?',
    type: 'text',
    from: 'coach',
    timestamp: '2024-03-16T10:32:00Z'
  },
  {
    id: 3,
    content: 'meal-plan-question.mp3',
    type: 'audio',
    duration: '0:45',
    from: 'client',
    timestamp: '2024-03-16T10:35:00Z'
  },
  {
    id: 4,
    content: 'Here\'s a detailed explanation of how to adjust your portions.',
    type: 'text',
    from: 'coach',
    timestamp: '2024-03-16T10:40:00Z'
  },
  {
    id: 5,
    content: 'meal-plan-adjustments.pdf',
    type: 'file',
    from: 'coach',
    timestamp: '2024-03-16T10:41:00Z'
  }
];

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || selectedFile) {
      // TODO: Implement message sending
      setNewMessage('');
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Create audio blob and handle upload
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        // TODO: Handle audio upload
        audioChunksRef.current = [];
      };
    }
  };

  const toggleAudioPlay = (messageId: number) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      // TODO: Pause audio playback
    } else {
      setPlayingAudioId(messageId);
      // TODO: Start audio playback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Messages Container */}
        <div className="h-[calc(100vh-180px)] bg-white shadow-sm rounded-lg overflow-hidden flex flex-col">
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-medium text-gray-900">Messages with Coach Sarah</h1>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  message.from === 'client' ? 'bg-indigo-100' : 'bg-gray-100'
                } rounded-lg p-3`}>
                  {message.type === 'text' ? (
                    <p className="text-sm text-gray-900">{message.content}</p>
                  ) : message.type === 'audio' ? (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleAudioPlay(message.id)}
                        className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
                      >
                        {playingAudioId === message.id ? (
                          <PauseIcon className="h-5 w-5 text-gray-600" />
                        ) : (
                          <PlayIcon className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                      <span className="text-sm text-gray-600">{message.duration}</span>
                    </div>
                  ) : message.type === 'file' ? (
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-indigo-600 hover:text-indigo-500">
                        {message.content}
                      </span>
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="space-y-4">
              {selectedFile && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <PaperClipIcon className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              {isRecording && (
                <div className="flex items-center justify-between bg-red-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full" />
                    <span className="ml-2 text-sm text-red-600">
                      Recording... {formatDuration(recordingTime)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-red-600 hover:text-red-700"
                  >
                    <StopIcon className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`inline-flex items-center p-2 border rounded-md ${
                    isRecording
                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </button>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !selectedFile && !isRecording}
                  className="inline-flex items-center p-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 