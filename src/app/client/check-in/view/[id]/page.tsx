'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  PaperClipIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

// Temporary test data
const checkInData = {
  id: '1',
  date: '2024-03-15',
  type: 'Weekly Check-in',
  status: 'Reviewed',
  responses: {
    nutrition: {
      question: 'How well did you follow your meal plan this week?',
      answer: '8/10 - Followed the plan closely but had one cheat meal',
      type: 'rating_scale'
    },
    training: {
      question: 'Did you complete all scheduled workouts?',
      answer: 'Yes, completed all 4 sessions as planned',
      type: 'text'
    },
    progress_photos: {
      question: 'Weekly progress photos',
      answer: ['front.jpg', 'side.jpg'],
      type: 'photo'
    }
  },
  coachResponse: {
    type: 'mixed',
    text: 'Great job this week! Your consistency is showing in your progress photos.',
    audio: 'feedback-audio.mp3',
    video: 'https://www.loom.com/share/123456789',
    date: '2024-03-16'
  }
};

export default function CheckInView() {
  const params = useParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    if (checkInData.coachResponse.audio) {
      const audio = new Audio(checkInData.coachResponse.audio);
      setAudioElement(audio);

      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.pause();
      };
    }
  }, []);

  const toggleAudio = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/check-in"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Check-ins
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{checkInData.type}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Submitted on {new Date(checkInData.date).toLocaleDateString()}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              checkInData.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {checkInData.status}
            </span>
          </div>
        </div>

        {/* Check-in Responses */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Your Responses</h2>
            <div className="space-y-6">
              {Object.entries(checkInData.responses).map(([category, data]) => (
                <div key={category} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-medium text-gray-900 capitalize mb-2">
                    {category.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{data.question}</p>
                  {data.type === 'photo' ? (
                    <div className="grid grid-cols-2 gap-4">
                      {(data.answer as string[]).map((photo, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {/* Replace with actual image component */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PaperClipIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">{data.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coach's Response */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Coach's Feedback</h2>
            <div className="space-y-6">
              {/* Text Response */}
              {checkInData.coachResponse.text && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{checkInData.coachResponse.text}</p>
                </div>
              )}

              {/* Audio Response */}
              {checkInData.coachResponse.audio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleAudio}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isPlaying ? (
                        <PauseIcon className="h-5 w-5" />
                      ) : (
                        <PlayIcon className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <SpeakerWaveIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">Audio Feedback</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Response */}
              {checkInData.coachResponse.video && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Video Feedback</span>
                    </div>
                    <a
                      href={checkInData.coachResponse.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Reviewed on {new Date(checkInData.coachResponse.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 