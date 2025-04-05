'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PhotoIcon,
  SparklesIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  MicrophoneIcon,
  PauseIcon,
  StopIcon,
  TrashIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TabContentProps {
  client: any;
}

// Add this interface for check-in responses
interface CheckInResponse {
  question: string;
  answer: string;
  type: 'text' | 'number' | 'scale' | 'choice';
}

// Add this interface for the check-in form
interface CheckInForm {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type: 'text' | 'number' | 'scale' | 'choice';
    options?: string[];
  }[];
}

// Mock check-in form data
const mockCheckInForm: CheckInForm = {
  id: 'weekly-checkin',
  title: 'Weekly Progress Check-in',
  description: 'Track your weekly progress and reflect on your journey',
  questions: [
    {
      id: 'q1',
      text: 'How would you rate your overall energy levels this week?',
      type: 'scale'
    },
    {
      id: 'q2',
      text: 'What challenges did you face with your nutrition plan?',
      type: 'text'
    },
    {
      id: 'q3',
      text: 'Did you complete all planned workouts?',
      type: 'choice',
      options: ['Yes', 'Partially', 'No']
    },
    {
      id: 'q4',
      text: 'Any additional notes or concerns?',
      type: 'text'
    }
  ]
};

interface CoachReply {
  type: 'text' | 'audio';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

interface QuestionResponse {
  id: string;
  question: string;
  answer: string;
  coachReply?: CoachReply;
}

// Add this component for the audio recorder
const AudioRecorder = ({ 
  onSave, 
  onCancel 
}: { 
  onSave: (audioUrl: string) => void;
  onCancel: () => void;
}) => {
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
        const audioUrl = URL.createObjectURL(audioBlob);
        onSave(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
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

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 bg-[#13141A] rounded-lg p-3">
      {isRecording ? (
        <>
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{formatTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <StopIcon className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={cancelRecording}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </>
      ) : (
        <button
          onClick={startRecording}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <MicrophoneIcon className="h-5 w-5 text-blue-500" />
        </button>
      )}
    </div>
  );
};

// Update the CheckInDetails component
const CheckInDetails = ({ 
  isOpen, 
  onClose, 
  checkIn 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  checkIn: any; 
}) => {
  const [responses, setResponses] = useState<QuestionResponse[]>(
    mockCheckInForm.questions.map(q => ({
      id: q.id,
      question: q.text,
      answer: checkIn.responses?.[q.id] || "No response provided",
      coachReply: undefined
    }))
  );

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleTextReply = (responseId: string) => {
    if (!replyText.trim()) return;

    setResponses(prev => prev.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          coachReply: {
            type: 'text',
            content: replyText,
            timestamp: new Date().toISOString()
          }
        };
      }
      return response;
    }));

    setReplyText('');
    setActiveReplyId(null);
  };

  const handleAudioReply = (responseId: string, audioUrl: string) => {
    setResponses(prev => prev.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          coachReply: {
            type: 'audio',
            content: 'Audio Reply',
            timestamp: new Date().toISOString(),
            audioUrl
          }
        };
      }
      return response;
    }));

    setIsRecording(false);
    setActiveReplyId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b1e] border-gray-800 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {checkIn.formTitle} - {checkIn.date}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Metrics Summary */}
          <div className="grid grid-cols-3 gap-4 bg-[#13141A] rounded-lg p-4">
            <div>
              <div className="text-sm text-gray-400">Weight</div>
              <div className="text-lg font-medium">{checkIn.metrics.weight} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Energy</div>
              <div className="text-lg font-medium">{checkIn.metrics.energy}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Sleep</div>
              <div className="text-lg font-medium">{checkIn.metrics.sleep} hrs</div>
            </div>
          </div>

          {/* Check-in Responses with Coach Replies */}
          <div className="space-y-6">
            {responses.map((response) => (
              <div key={response.id} className="bg-[#13141A] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">{response.question}</div>
                <div className="text-white mb-4">{response.answer}</div>

                {/* Coach Reply Section */}
                {response.coachReply ? (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <UserCircleIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">Coach Reply</div>
                        {response.coachReply.type === 'text' ? (
                          <p className="mt-1 text-white">{response.coachReply.content}</p>
                        ) : (
                          <audio 
                            className="mt-2" 
                            controls 
                            src={response.coachReply.audioUrl}
                          />
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(response.coachReply.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    {activeReplyId === response.id ? (
                      <div className="space-y-4">
                        {isRecording ? (
                          <AudioRecorder
                            onSave={(audioUrl) => handleAudioReply(response.id, audioUrl)}
                            onCancel={() => {
                              setIsRecording(false);
                              setActiveReplyId(null);
                            }}
                          />
                        ) : (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="flex-1 bg-[#1a1b1e] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleTextReply(response.id)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setIsRecording(true)}
                              className="p-2 bg-gray-800 text-blue-500 rounded-lg hover:bg-gray-700"
                            >
                              <MicrophoneIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(response.id)}
                        className="text-blue-500 hover:text-blue-400 text-sm"
                      >
                        Add Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Tab content components
const OverviewTab = ({ client }: TabContentProps) => (
  <div className="space-y-8">
    {/* Goals Card */}
    <div className="grid grid-cols-3 gap-8">
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Goals</h2>
        <div className="space-y-4">
          {client.goals.map((goal: any) => (
            <div key={goal.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{goal.title}</span>
                <span className="text-gray-400">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Metrics */}
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Latest Metrics</h2>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Weight</span>
              <span>{client.metrics.weight[client.metrics.weight.length - 1].value} kg</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Energy Level</span>
              <span>{client.metrics.energy[client.metrics.energy.length - 1].value}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Sleep Quality</span>
              <span>{client.metrics.sleep[client.metrics.sleep.length - 1].value} hrs</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-[#13141A] rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <ChartBarIcon className="h-6 w-6 mb-2" />
            <span className="text-sm">View Progress</span>
          </button>
          <button className="p-4 bg-[#13141A] rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <ClipboardDocumentListIcon className="h-6 w-6 mb-2" />
            <span className="text-sm">New Check-in</span>
          </button>
          <button className="p-4 bg-[#13141A] rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <CalendarIcon className="h-6 w-6 mb-2" />
            <span className="text-sm">Schedule</span>
          </button>
          <button className="p-4 bg-[#13141A] rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <PhotoIcon className="h-6 w-6 mb-2" />
            <span className="text-sm">Progress Pics</span>
          </button>
        </div>
      </div>
    </div>

    {/* AI Summary */}
    <div className="bg-[#1a1b1e] rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <SparklesIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-lg font-semibold">AI Progress Summary</h2>
      </div>
      
      <div className="space-y-6">
        <div className="bg-[#13141A] rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed">
            {client.aiSummary.overview}
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrophyIcon className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-green-500">Recent Wins</h3>
          </div>
          <ul className="space-y-2">
            {client.aiSummary.wins.map((win: string, index: number) => (
              <li key={index} className="flex items-start space-x-2 text-gray-300">
                <span className="text-green-500 mt-1">•</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium text-yellow-500">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {client.aiSummary.challenges.map((challenge: string, index: number) => (
              <li key={index} className="flex items-start space-x-2 text-gray-300">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <SparklesIcon className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-blue-500">AI Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {client.aiSummary.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start space-x-2 text-gray-300">
                <span className="text-blue-500 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const CheckInsTab = ({ client }: TabContentProps) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);

  // Enhanced mock check-in data
  const enhancedCheckIns = client.checkIns.map((checkIn: any) => ({
    ...checkIn,
    formTitle: 'Weekly Progress Check-in',
    responses: {
      q1: '8/10',
      q2: 'Had some difficulty with late-night snacking, but otherwise stayed on track.',
      q3: 'Partially',
      q4: 'Would like to discuss modifying the workout schedule.'
    }
  }));

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Recent Check-ins</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>New Check-in</span>
          </button>
        </div>

        <div className="space-y-4">
          {enhancedCheckIns.map((checkIn: any) => (
            <div key={checkIn.id} className="bg-[#13141A] rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-white mb-1">{checkIn.formTitle}</h3>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">{checkIn.date}</span>
                    <span className="text-gray-500">•</span>
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">{checkIn.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    checkIn.status === 'completed'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {checkIn.status}
                  </span>
                  <button
                    onClick={() => setSelectedCheckIn(checkIn)}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#1a1b1e] rounded p-3">
                  <div className="text-sm text-gray-400 mb-1">Weight</div>
                  <div className="text-lg">{checkIn.metrics.weight} kg</div>
                </div>
                <div className="bg-[#1a1b1e] rounded p-3">
                  <div className="text-sm text-gray-400 mb-1">Energy</div>
                  <div className="text-lg">{checkIn.metrics.energy}%</div>
                </div>
                <div className="bg-[#1a1b1e] rounded p-3">
                  <div className="text-sm text-gray-400 mb-1">Sleep</div>
                  <div className="text-lg">{checkIn.metrics.sleep} hrs</div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <strong>Preview:</strong>
                <p className="mt-1 text-gray-300 line-clamp-2">{checkIn.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in Details Modal */}
      {selectedCheckIn && (
        <CheckInDetails
          isOpen={!!selectedCheckIn}
          onClose={() => setSelectedCheckIn(null)}
          checkIn={selectedCheckIn}
        />
      )}
    </div>
  );
};

const ProgressTab = ({ client }: TabContentProps) => (
  <div className="space-y-6">
    {/* Progress Charts */}
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Weight Progress</h2>
        <div className="h-64 bg-[#13141A] rounded-lg"></div>
      </div>
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Energy Levels</h2>
        <div className="h-64 bg-[#13141A] rounded-lg"></div>
      </div>
    </div>

    {/* Progress Photos */}
    <div className="bg-[#1a1b1e] rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Progress Photos</h2>
      <div className="grid grid-cols-4 gap-4">
        {client.progressPhotos.map((photo: any) => (
          <div key={photo.id} className="aspect-square bg-[#13141A] rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

const FormsTab = ({ client }: TabContentProps) => (
  <div className="space-y-6">
    <div className="bg-[#1a1b1e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Forms & Documents</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5" />
          <span>New Form</span>
        </button>
      </div>

      <div className="space-y-4">
        {client.forms.map((form: any) => (
          <div key={form.id} className="flex items-center justify-between bg-[#13141A] rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              <div>
                <div className="font-medium">{form.title}</div>
                <div className="text-sm text-gray-500">{form.date}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded text-sm ${
                form.status === 'completed' 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {form.status}
              </span>
              <button className="text-blue-500 hover:text-blue-400">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PhotosTab = ({ client }: TabContentProps) => (
  <div className="space-y-6">
    <div className="bg-[#1a1b1e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Progress Photos</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
          <PhotoIcon className="h-5 w-5" />
          <span>Upload Photos</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {client.photos.map((photo: any) => (
          <div key={photo.id} className="space-y-2">
            <div className="aspect-square bg-[#13141A] rounded-lg"></div>
            <div className="text-sm text-gray-400">{photo.date}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CalendarTab = ({ client }: TabContentProps) => {
  // Group all events by month
  const allEvents = [
    {
      id: 'start',
      type: 'milestone',
      title: 'Started Coaching Program',
      date: '2024-01-15',
      time: '09:00 AM',
      status: 'completed',
      icon: 'star'
    },
    ...client.checkIns.map((checkIn: any) => ({
      id: checkIn.id,
      type: 'check-in',
      title: 'Check-in Session',
      date: checkIn.date,
      time: checkIn.time,
      status: checkIn.status,
      metrics: checkIn.metrics,
      notes: checkIn.notes
    })),
    ...client.photos.map((photo: any) => ({
      id: photo.id,
      type: 'photo',
      title: 'Progress Photos',
      date: photo.date,
      status: 'completed'
    })),
    ...client.schedule.map((session: any) => ({
      id: session.id,
      type: 'session',
      title: session.title,
      date: session.date,
      time: session.time,
      status: session.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <SparklesIcon className="h-6 w-6 text-yellow-500" />;
      case 'check-in':
        return <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />;
      case 'photo':
        return <PhotoIcon className="h-6 w-6 text-purple-500" />;
      case 'session':
        return <CalendarIcon className="h-6 w-6 text-green-500" />;
      default:
        return <CalendarIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'check-in':
        return 'text-blue-500 bg-blue-500/10';
      case 'photo':
        return 'text-purple-500 bg-purple-500/10';
      case 'session':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1b1e] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule Session</span>
          </button>
        </div>

        <div className="space-y-8">
          {allEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline connector */}
              {index < allEvents.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-800" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Event icon */}
                <div className={`relative z-10 p-2 rounded-full ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex-1 bg-[#13141A] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-white">{event.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span>{event.date}</span>
                        {event.time && (
                          <>
                            <span>•</span>
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.status === 'completed' || event.status === 'confirmed'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {event.status}
                      </span>
                      <button className="text-blue-500 hover:text-blue-400">
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Event-specific content */}
                  {event.type === 'check-in' && event.metrics && (
                    <div className="grid grid-cols-3 gap-4 mt-4 bg-[#1a1b1e] rounded-lg p-3">
                      <div>
                        <div className="text-sm text-gray-400">Weight</div>
                        <div className="font-medium">{event.metrics.weight} kg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Energy</div>
                        <div className="font-medium">{event.metrics.energy}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Sleep</div>
                        <div className="font-medium">{event.metrics.sleep} hrs</div>
                      </div>
                    </div>
                  )}

                  {event.type === 'check-in' && event.notes && (
                    <div className="mt-3 text-sm text-gray-400">
                      <p>{event.notes}</p>
                    </div>
                  )}

                  {event.type === 'photo' && (
                    <div className="mt-3 grid grid-cols-4 gap-4">
                      <div className="aspect-square bg-[#1a1b1e] rounded-lg"></div>
                      <div className="aspect-square bg-[#1a1b1e] rounded-lg"></div>
                      <div className="aspect-square bg-[#1a1b1e] rounded-lg"></div>
                      <div className="aspect-square bg-[#1a1b1e] rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ClientDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const loadClient = async () => {
      try {
        // Mock client data for development
        const mockClient = {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah.w@example.com',
          goals: [
            { id: '1', title: 'Weight Loss', progress: 65 },
            { id: '2', title: 'Muscle Tone', progress: 45 },
            { id: '3', title: 'Better Energy', progress: 80 }
          ],
          metrics: {
            weight: [
              { date: '2024-01', value: 75 },
              { date: '2024-02', value: 73 },
              { date: '2024-03', value: 71 }
            ],
            energy: [
              { date: '2024-01', value: 60 },
              { date: '2024-02', value: 75 },
              { date: '2024-03', value: 85 }
            ],
            sleep: [
              { date: '2024-01', value: 6.5 },
              { date: '2024-02', value: 7.2 },
              { date: '2024-03', value: 7.8 }
            ]
          },
          aiSummary: {
            overview: "Based on Sarah's recent check-ins and progress data, she's showing consistent improvement in most areas, particularly in energy levels and sleep quality. Her commitment to the program is evident in her regular check-ins and goal progression.",
            wins: [
              "Achieved a steady weight loss trend, down 4kg over the past 3 months",
              "Significant improvement in energy levels, up from 60% to 85%",
              "Sleep quality has improved by 1.3 hours on average"
            ],
            challenges: [
              "Muscle tone progress is slightly behind schedule at 45%",
              "Weekend workout consistency could be improved"
            ],
            recommendations: [
              "Consider adjusting the strength training program to accelerate muscle tone development",
              "Schedule check-ins earlier in the day when energy levels are highest",
              "Maintain the current sleep hygiene practices as they're showing positive results"
            ]
          },
          checkIns: [
            {
              id: '1',
              date: 'March 10, 2024',
              time: '9:30 AM',
              status: 'completed',
              metrics: {
                weight: 71,
                energy: 85,
                sleep: 7.8
              },
              notes: "Great progress this week! Energy levels are consistently high and sleep quality has improved significantly."
            },
            {
              id: '2',
              date: 'March 3, 2024',
              time: '10:00 AM',
              status: 'completed',
              metrics: {
                weight: 72,
                energy: 80,
                sleep: 7.5
              },
              notes: "Feeling stronger but had some challenges with weekend workouts."
            }
          ],
          forms: [
            {
              id: '1',
              title: 'Initial Assessment',
              date: 'January 15, 2024',
              status: 'completed'
            },
            {
              id: '2',
              title: 'Monthly Progress Review',
              date: 'March 1, 2024',
              status: 'pending'
            }
          ],
          photos: [
            { id: '1', date: 'March 1, 2024' },
            { id: '2', date: 'February 1, 2024' },
            { id: '3', date: 'January 1, 2024' }
          ],
          schedule: [
            {
              id: '1',
              title: 'Progress Review Session',
              date: 'March 15, 2024',
              time: '10:00 AM',
              status: 'confirmed'
            },
            {
              id: '2',
              title: 'Training Session',
              date: 'March 18, 2024',
              time: '2:00 PM',
              status: 'pending'
            }
          ],
          progressPhotos: [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' }
          ]
        };
        
        setClient(mockClient);
        setLoading(false);
      } catch (error) {
        console.error('Error loading client:', error);
      }
    };

    loadClient();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13141A]">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'check-ins', label: 'Check-ins' },
    { id: 'progress', label: 'Progress' },
    { id: 'forms', label: 'Forms' },
    { id: 'photos', label: 'Photos' },
    { id: 'calendar', label: 'Calendar' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab client={client} />;
      case 'check-ins':
        return <CheckInsTab client={client} />;
      case 'progress':
        return <ProgressTab client={client} />;
      case 'forms':
        return <FormsTab client={client} />;
      case 'photos':
        return <PhotosTab client={client} />;
      case 'calendar':
        return <CalendarTab client={client} />;
      default:
        return <OverviewTab client={client} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{client.name}</h1>
                <div className="flex items-center text-gray-400 mt-1">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Message
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                New Check-in
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
} 