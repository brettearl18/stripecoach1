'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  HeartIcon,
  MoonIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { checkIns } from '@/data/checkIns';
import { ElevenLabsHandler } from '@/utils/elevenLabsHandler';

// Initialize ElevenLabs handler
const elevenLabs = new ElevenLabsHandler({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
  voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '',
});

// Sample check-in questions and answers
const checkInQuestions = {
  general: [
    { id: 1, question: "How are you feeling overall today?", answer: "I'm feeling pretty good overall, though a bit tired from work." },
    { id: 2, question: "Rate your energy levels (1-10):", answer: "7" },
    { id: 3, question: "Any notable changes since last check-in?", answer: "Sleep has improved with the new evening routine." },
  ],
  nutrition: [
    { id: 4, question: "Did you track your meals today?", answer: "Yes, used MyFitnessPal for all meals" },
    { id: 5, question: "How many meals did you eat?", answer: "4 meals including snacks" },
    { id: 6, question: "Water intake (glasses):", answer: "8" },
    { id: 7, question: "Any challenges with nutrition?", answer: "Struggled with late-night snacking" },
  ],
  exercise: [
    { id: 8, question: "Workouts completed this week:", answer: "4 sessions (2 strength, 2 cardio)" },
    { id: 9, question: "Average workout duration:", answer: "45 minutes" },
    { id: 10, question: "Any pain or discomfort?", answer: "Slight knee discomfort during squats" },
  ],
  sleep: [
    { id: 11, question: "Average hours of sleep:", answer: "7.5 hours" },
    { id: 12, question: "Sleep quality (1-10):", answer: "8" },
    { id: 13, question: "Bedtime routine followed?", answer: "Yes, most nights" },
  ],
  goals: [
    { id: 14, question: "Progress towards current goals:", answer: "On track with workout frequency, need to improve nutrition consistency" },
    { id: 15, question: "New goals or adjustments needed?", answer: "Would like to focus more on stress management" },
  ],
};

const categories = [
  { id: 'general', label: 'General Wellness', icon: HeartIcon },
  { id: 'nutrition', label: 'Nutrition', icon: FireIcon },
  { id: 'exercise', label: 'Exercise', icon: ChartBarIcon },
  { id: 'sleep', label: 'Sleep', icon: MoonIcon },
  { id: 'goals', label: 'Goals', icon: ArrowTrendingUpIcon },
];

export default function CheckInDetailPage() {
  const params = useParams();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
  const [aiAudioResponse, setAiAudioResponse] = useState<AudioMessage | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find check-in data based on ID (you would typically fetch this from an API)
  const checkIn = checkIns.find(c => c.id.toString() === params.id);

  if (!checkIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Check-in not found</h1>
            <Link href="/admin/check-ins" className="mt-4 text-indigo-600 hover:text-indigo-500">
              Return to Check-ins
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayAudio = (audioMessage: AudioMessage) => {
    if (!audioMessage.url) return;

    if (currentAudioId === audioMessage.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioMessage.url;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentAudioId(audioMessage.id);
      }
    }
  };

  const generateAIAudioResponse = async () => {
    try {
      const formattedInsights = elevenLabs.formatInsightsForSpeech(checkIn.aiInsights);
      const audioMessage = await elevenLabs.generateAIAudioResponse(formattedInsights);
      setAiAudioResponse(audioMessage);
    } catch (error) {
      console.error('Error generating AI audio response:', error);
    }
  };

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();

    // Add event listeners
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAudioId(null);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
      }
      // Cleanup any generated audio URLs
      if (aiAudioResponse?.url) {
        URL.revokeObjectURL(aiAudioResponse.url);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/check-ins"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Check-ins</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{checkIn.clientName}'s Check-in</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{checkIn.date}</span>
                <span className="text-gray-300">|</span>
                <span>{checkIn.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <SparklesIcon className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-900">AI Score: {checkIn.aiInsights.overallScore}</span>
                </div>
                <span className={`text-xs font-medium ${
                  checkIn.aiInsights.priorityLevel === 'high' ? 'text-red-600' :
                  checkIn.aiInsights.priorityLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {checkIn.aiInsights.priorityLevel.charAt(0).toUpperCase() + checkIn.aiInsights.priorityLevel.slice(1)} Priority
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                checkIn.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {checkIn.status === 'pending' ? 'Pending Review' : 'Completed'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-indigo-500" />
                    AI Insights
                  </h2>
                  <button
                    onClick={generateAIAudioResponse}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                  >
                    <SpeakerWaveIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Generate Audio</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                    <p className="text-sm text-gray-600">{checkIn.aiInsights.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(checkIn.aiInsights.keyMetrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                          <div className="text-sm font-medium text-gray-900">{value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* AI Audio Response */}
                  {aiAudioResponse && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlayAudio(aiAudioResponse)}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            {isPlaying && currentAudioId === aiAudioResponse.id ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-indigo-900">AI Voice Summary</span>
                            <span className="text-xs text-indigo-700">{aiAudioResponse.duration}</span>
                          </div>
                        </div>
                        <span className="text-xs text-indigo-700">
                          {new Date(aiAudioResponse.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categories Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                          selectedCategory === category.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {category.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Audio Messages */}
            {checkIn.audioMessages.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Messages</h2>
                  <div className="space-y-3">
                    {checkIn.audioMessages.map((audio) => (
                      <div
                        key={audio.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            {isPlaying ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
                          <span className="text-sm text-gray-600">{audio.duration}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(audio.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {checkIn.attachments.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                  <div className="space-y-2">
                    {checkIn.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                  AI Recommendations
                </h2>
                <div className="space-y-4">
                  {checkIn.aiInsights.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                    >
                      <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions and Answers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  {categories.find(c => c.id === selectedCategory)?.label} Responses
                </h2>
                <div className="space-y-6">
                  {checkInQuestions[selectedCategory].map((qa) => (
                    <div key={qa.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">{qa.question}</h3>
                      <p className="text-sm text-gray-600">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Reply to Check-in</span>
              </button>
              {checkIn.status === 'pending' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Mark as Reviewed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 