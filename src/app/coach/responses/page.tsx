'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardNav } from '@/components/DashboardNav';
import { io, Socket } from 'socket.io-client';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FlagIcon,
  InboxIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

// Enhanced Message Interface
interface Message {
  id: string;
  clientId: string;
  clientName: string;
  coachId: string;
  type: 'check-in' | 'question' | 'feedback' | 'urgent';
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied' | 'flagged';
  category?: string;
  rating?: number;
  audioUrl?: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'audio' | 'video' | 'document';
    url: string;
    name: string;
  }>;
  metadata?: {
    readAt?: string;
    repliedAt?: string;
    device?: string;
    location?: string;
  };
  checkInData?: {
    workouts: number;
    nutrition: number;
    sleep: number;
    stress: number;
    mood: string;
    notes?: string;
    progress_photos?: string[];
  };
}

// Message Queue for Reliable Delivery
class MessageQueue {
  private queue: Message[] = [];
  private processing = false;

  async add(message: Message): Promise<void> {
    this.queue.push(message);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.processing = true;
    while (this.queue.length > 0) {
      const message = this.queue[0];
      try {
        await this.sendMessage(message);
        this.queue.shift(); // Remove sent message
      } catch (error) {
        console.error('Failed to send message:', error);
        // Implement retry logic with backoff
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    this.processing = false;
  }

  private async sendMessage(message: Message): Promise<void> {
    // Implement actual message sending logic
    // This would typically involve API calls or WebSocket communication
    return new Promise((resolve) => {
      // Simulated network delay
      setTimeout(resolve, 100);
    });
  }
}

// WebSocket Connection Manager
class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string, private onMessage: (message: Message) => void) {}

  connect() {
    this.socket = io(this.url, {
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('message', (message: Message) => {
      this.onMessage(message);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  send(message: Message) {
    if (this.socket?.connected) {
      this.socket.emit('message', message);
    } else {
      console.error('WebSocket not connected');
    }
  }
}

// Message Cache using LRU Cache
class MessageCache {
  private cache = new Map<string, Message>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(id: string): Message | undefined {
    const message = this.cache.get(id);
    if (message) {
      // Move to front (most recently used)
      this.cache.delete(id);
      this.cache.set(id, message);
    }
    return message;
  }

  set(message: Message) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(message.id, message);
  }
}

function AudioRecorder({ onRecordingComplete: handleRecordingComplete }: { onRecordingComplete: (audioBlob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        handleRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
        >
          <MicrophoneIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
        >
          <StopIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        </button>
      )}
      {isRecording && (
        <span className="text-sm text-red-600 dark:text-red-400">
          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
        </span>
      )}
    </div>
  );
}

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
      <button
        onClick={togglePlay}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {isPlaying ? (
          <PauseIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <PlayIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <div className="text-xs text-gray-500 dark:text-gray-400">Audio Message</div>
    </div>
  );
}

export default function Responses() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'check-ins' | 'questions' | 'feedback'>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  const messageQueueRef = useRef(new MessageQueue());
  const messageCacheRef = useRef(new MessageCache());
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  // Handle incoming messages
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const index = newMessages.findIndex(m => m.id === message.id);
      if (index !== -1) {
        newMessages[index] = message;
      } else {
        newMessages.unshift(message);
      }
      return newMessages;
    });
    messageCacheRef.current.set(message);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const wsManager = new WebSocketManager(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      handleNewMessage
    );
    wsManagerRef.current = wsManager;
    wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, [user, handleNewMessage]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        // Implement API call to load messages
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data);
        data.forEach((message: Message) => {
          messageCacheRef.current.set(message);
        });
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  const handleReply = async () => {
    if (!selectedMessage || (!replyText.trim() && !audioBlob)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      clientId: selectedMessage.clientId,
      clientName: selectedMessage.clientName,
      coachId: user?.id || '',
      type: 'feedback',
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
      status: 'unread',
    };

    if (audioBlob) {
      // Upload audio file and get URL
      const audioUrl = await uploadAudio(audioBlob);
      newMessage.audioUrl = audioUrl;
    }

    try {
      // Add to queue for reliable delivery
      await messageQueueRef.current.add(newMessage);
      
      // Update UI immediately
      handleNewMessage(newMessage);
      
      // Send via WebSocket for real-time delivery
      wsManagerRef.current?.send(newMessage);
      
      // Clear form
      setReplyText('');
      setAudioBlob(null);
    } catch (err) {
      console.error('Failed to send reply:', err);
      // Implement error handling UI
    }
  };

  const filteredMessages = messages.filter(message => {
    if (activeTab === 'all') return true;
    if (activeTab === 'check-ins') return message.type === 'check-in';
    if (activeTab === 'questions') return message.type === 'question';
    if (activeTab === 'feedback') return message.type === 'feedback';
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    urgent: messages.filter(m => m.type === 'urgent').length,
    checkIns: messages.filter(m => m.type === 'check-in').length
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'check-in':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'question':
        return <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'feedback':
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case 'urgent':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <DashboardNav />
      
      <main className="p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Responses</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage client communications and check-ins
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Messages</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                  <InboxIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.unread}</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.urgent}</h3>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-ins</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.checkIns}</h3>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Message List */}
            <div className="lg:w-1/2 xl:w-2/5">
              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl mb-4">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-4 px-4" aria-label="Tabs">
                    {['all', 'check-ins', 'questions', 'feedback'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`${
                          activeTab === tab
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                      >
                        {tab.replace('-', ' ')}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getMessageIcon(message.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {message.clientName}
                            </p>
                            <div className="flex items-center gap-2">
                              {message.status === 'unread' && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                                  New
                                </span>
                              )}
                              {message.status === 'flagged' && (
                                <FlagIcon className="h-4 w-4 text-red-500" />
                              )}
                              <time className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </time>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:flex-1">
              {selectedMessage ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl h-full">
                  <div className="flex flex-col h-full">
                    {/* Message Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            {selectedMessage.clientName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedMessage.clientName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(selectedMessage.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMessage.type === 'urgent'
                              ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                              : selectedMessage.type === 'check-in'
                              ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                          }`}
                        >
                          {selectedMessage.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {selectedMessage.type === 'check-in' && selectedMessage.checkInData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workouts</p>
                              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedMessage.checkInData.workouts}/7
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nutrition</p>
                              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedMessage.checkInData.nutrition}%
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sleep</p>
                              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedMessage.checkInData.sleep} hrs
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mood</p>
                              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {selectedMessage.checkInData.mood}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {selectedMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Reply Box */}
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                          
                          <button
                            onClick={handleReply}
                            disabled={!replyText.trim() && !audioBlob}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                            Send Reply
                          </button>
                        </div>
                        
                        {audioBlob && (
                          <div className="mt-2">
                            <AudioPlayer audioUrl={URL.createObjectURL(audioBlob)} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No message selected</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select a message from the list to view its contents
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to upload audio
async function uploadAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob);
  
  try {
    const response = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.url;
  } catch (err) {
    console.error('Failed to upload audio:', err);
    throw err;
  }
} 