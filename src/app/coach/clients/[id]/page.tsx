'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
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
  PaperAirplaneIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  CheckIcon,
  ChevronRightIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  ArrowsPointingOutIcon,
  UserIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { clientService } from '@/lib/services/clientService';
import ClientSettings from './components/ClientSettings';
import { SCORING_TIERS } from '../../templates-v2/services/scoringService';

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

interface TaskItem {
  id: string;
  text: string;
  category: 'training' | 'nutrition' | 'mindset';
  status: 'pending' | 'approved' | 'completed';
  points: number;
  dueDate?: string;
}

interface CoachResponse {
  id: string;
  type: 'text' | 'audio';
  content: string;
  timestamp: string;
  audioUrl?: string;
  tasks?: TaskItem[];
}

interface QuestionResponse {
  id: string;
  question: string;
  answer: string;
  coachReply?: CoachResponse;
}

interface CategoryReview {
  score: number;
  recommendations: string[];
  improvements: string[];
}

interface CoachReview {
  training: CategoryReview;
  nutrition: CategoryReview;
  mindset: CategoryReview;
  lastUpdated: string;
}

function processCheckInResponses(checkIns: any[], scoringTierId?: string): CoachReview {
  // Get the client's scoring tier or default to Beginner
  const scoringTier = SCORING_TIERS.find(tier => tier.id === scoringTierId) || SCORING_TIERS[3];
  
  const review: CoachReview = {
    training: {
      score: 0,
      recommendations: [],
      improvements: []
    },
    nutrition: {
      score: 0,
      recommendations: [],
      improvements: []
    },
    mindset: {
      score: 0,
      recommendations: [],
      improvements: []
    },
    lastUpdated: new Date().toISOString()
  };

  // Process the most recent check-in
  const latestCheckIn = checkIns[0];
  if (!latestCheckIn) return review;

  // Training Review with scoring tier thresholds
  const trainingScore = calculateTrainingScore(latestCheckIn);
  review.training.score = trainingScore;
  
  if (trainingScore < scoringTier.thresholds.red) {
    review.training.improvements.push('Needs immediate attention - Schedule a review session');
  } else if (trainingScore < scoringTier.thresholds.orange) {
    review.training.improvements.push('Room for improvement - Focus on form and consistency');
  }
  
  if (latestCheckIn.responses['training-warmup']?.value) {
    review.training.improvements.push('Maintain current warm-up routine');
  }
  
  if (!latestCheckIn.responses['training-mobility']?.value) {
    review.training.recommendations.push('Add mobility work between sets');
  }

  // Nutrition Review
  const nutritionScore = calculateNutritionScore(latestCheckIn);
  review.nutrition.score = nutritionScore;
  
  if (nutritionScore < scoringTier.thresholds.red) {
    review.nutrition.improvements.push('Needs immediate attention - Schedule a review session');
  } else if (nutritionScore < scoringTier.thresholds.orange) {
    review.nutrition.improvements.push('Room for improvement - Focus on form and consistency');
  }
  
  if (latestCheckIn.responses['nutrition-protein']?.value < 4) {
    review.nutrition.improvements.push('Increase protein intake consistency');
  }
  
  if (!latestCheckIn.responses['nutrition-meal-prep']?.value) {
    review.nutrition.recommendations.push('Implement meal preparation routine');
  }

  const waterIntake = latestCheckIn.responses['nutrition-water']?.value;
  if (waterIntake < 2.5) {
    review.nutrition.improvements.push('Increase daily water intake');
  }

  // Mindset Review
  const mindsetScore = calculateMindsetScore(latestCheckIn);
  review.mindset.score = mindsetScore;
  
  if (mindsetScore < scoringTier.thresholds.red) {
    review.mindset.improvements.push('Needs immediate attention - Schedule a review session');
  } else if (mindsetScore < scoringTier.thresholds.orange) {
    review.mindset.improvements.push('Room for improvement - Focus on form and consistency');
  }
  
  if (latestCheckIn.responses['mindset-stress']?.value > 3) {
    review.mindset.recommendations.push('Consider implementing stress management techniques');
  }
  
  if (latestCheckIn.responses['mindset-sleep-quality']?.value < 3) {
    review.mindset.improvements.push('Focus on sleep quality improvement');
  }

  return review;
}

function calculateTrainingScore(checkIn: any): number {
  let score = 0;
  let maxScore = 0;

  // Calculate percentage-based score
  if (checkIn.responses['training-form-quality']?.value) {
    score += checkIn.responses['training-form-quality'].value;
    maxScore += 5;
  }

  if (checkIn.responses['training-warmup']?.value) {
    score += 1;
    maxScore += 1;
  }

  if (checkIn.responses['training-mobility']?.value) {
    score += 1;
    maxScore += 1;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

function calculateNutritionScore(checkIn: any): number {
  const scores = [
    checkIn.responses['nutrition-adherence']?.value || 0,
    checkIn.responses['nutrition-protein']?.value || 0,
    checkIn.responses['nutrition-water']?.value / 2 || 0,
    checkIn.responses['nutrition-meal-prep']?.value ? 5 : 0
  ];
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function calculateMindsetScore(checkIn: any): number {
  const scores = [
    checkIn.responses['mindset-motivation']?.value || 0,
    5 - (checkIn.responses['mindset-stress']?.value || 0), // Invert stress score
    checkIn.responses['mindset-sleep-quality']?.value || 0
  ];
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
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

// Add this component for task allocation
const TaskAllocation = ({ 
  onAddTask,
  existingTasks = []
}: { 
  onAddTask: (task: TaskItem) => void;
  existingTasks: TaskItem[];
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    category: 'training',
    points: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.text) return;

    onAddTask({
      id: `task-${Date.now()}`,
      text: newTask.text!,
      category: newTask.category!,
      status: 'pending',
      points: newTask.points!,
      dueDate: newTask.dueDate
    });

    setIsAdding(false);
    setNewTask({ category: 'training', points: 1 });
  };

    return (
    <div className="mt-4">
      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#1E2128] p-4 rounded-lg border border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Task Description</label>
            <input
              type="text"
              value={newTask.text || ''}
              onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
              className="w-full bg-[#13141A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description..."
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskItem['category'] })}
                className="w-full bg-[#13141A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="training">Training</option>
                <option value="nutrition">Nutrition</option>
                <option value="mindset">Mindset</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Points</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newTask.points}
                onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                className="w-full bg-[#13141A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate || ''}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-[#13141A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-400"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      )}

      {existingTasks.length > 0 && (
        <div className="mt-4 space-y-2">
          {existingTasks.map((task) => (
            <div 
              key={task.id}
              className="flex items-center justify-between p-3 bg-[#1E2128] rounded-lg border border-gray-800"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'approved' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-white">{task.text}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{task.points} pts</span>
                {task.status === 'pending' && (
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
  const [responses, setResponses] = useState<QuestionResponse[]>(() => {
    if (!checkIn) return [];
    return mockCheckInForm.questions.map(q => ({
      id: q.id,
      question: q.text,
      answer: checkIn.responses?.[q.id]?.text || "No response provided",
      coachReply: undefined
    }));
  });

  // If checkIn changes, update responses
  useEffect(() => {
    if (checkIn) {
      setResponses(mockCheckInForm.questions.map(q => ({
        id: q.id,
        question: q.text,
        answer: checkIn.responses?.[q.id]?.text || "No response provided",
        coachReply: undefined
      })));
    }
  }, [checkIn]);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Don't render dialog if no checkIn is selected
  if (!checkIn) return null;

  const handleAddTask = (task: TaskItem) => {
    setTasks([...tasks, task]);
  };

  const handleTextReply = (responseId: string) => {
    if (!replyText.trim()) return;

    setResponses(prev => prev.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          coachReply: {
            type: 'text',
            content: replyText,
            timestamp: new Date().toISOString(),
            tasks: tasks
          }
        };
      }
      return response;
    }));

    setReplyText('');
    setActiveReplyId(null);
    setTasks([]);
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
                          <>
                            <p className="mt-1 text-white">{response.coachReply.content}</p>
                            {response.coachReply.tasks && response.coachReply.tasks.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Assigned Tasks</h4>
                <div className="space-y-2">
                                  {response.coachReply.tasks.map((task) => (
                                    <div 
                                      key={task.id}
                                      className="flex items-center justify-between p-2 bg-[#1E2128] rounded border border-gray-800"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          task.status === 'completed' ? 'bg-green-500' :
                                          task.status === 'approved' ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`} />
                                        <span className="text-sm">{task.text}</span>
                                      </div>
                                      <span className="text-sm text-gray-400">{task.points} pts</span>
                    </div>
                  ))}
                </div>
                              </div>
                            )}
                          </>
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
                          <>
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
                            
                            <TaskAllocation
                              onAddTask={handleAddTask}
                              existingTasks={tasks}
                            />
                          </>
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
  <div className="space-y-6">
    {/* Client Settings */}
    <ClientSettings 
      client={client}
      onUpdate={async (updates) => {
        try {
          await clientService.updateClient(client.id, updates);
          // You might want to refresh the client data here
        } catch (error) {
          console.error('Failed to update client:', error);
        }
      }}
    />

    {/* Existing Overview content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - Progress & Metrics */}
      <div className="col-span-2 space-y-6">
        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Progress Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(client.weeklyProgress || {}).map(([area, progress]) => (
                <div key={area} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{area}</div>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Check-ins</h2>
            <div className="space-y-4">
              {client.checkIns?.slice(0, 3).map((checkIn: any) => (
                <div key={checkIn.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
      {/* Recent Check-ins */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Check-ins</h2>
          <div className="space-y-4">
            {client.checkIns?.slice(0, 3).map((checkIn: any) => (
              <div key={checkIn.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(checkIn.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{checkIn.notes}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    checkIn.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                  }`}>
                    {checkIn.status}
                  </span>
                </div>
                {checkIn.metrics && (
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    {Object.entries(checkIn.metrics).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">{key}: </span>
                        <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Right Column - AI Insights & Actions */}
    <div className="space-y-6">
      {/* AI Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
            <SparklesIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-300">{client.aiSummary?.overview}</p>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <TrophyIcon className="h-4 w-4 text-green-500 mr-2" />
                Recent Wins
              </h3>
              <ul className="mt-2 space-y-2">
                {client.aiSummary?.wins.map((win: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                Areas for Attention
              </h3>
              <ul className="mt-2 space-y-2">
                {client.aiSummary?.challenges.map((challenge: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <ClockIcon className="h-4 w-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <SparklesIcon className="h-4 w-4 text-blue-500 mr-2" />
                Recommendations
              </h3>
              <ul className="mt-2 space-y-2">
                {client.aiSummary?.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Check-in</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Send Message</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Update Goals</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CheckInsTab = ({ client }: TabContentProps) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* Check-ins List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Check-in History</h2>
            <button
              onClick={() => {/* TODO: Implement new check-in */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Check-in
            </button>
          </div>

          <div className="space-y-4">
            {client.checkIns?.map((checkIn: any) => (
              <div
                key={checkIn.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setSelectedCheckIn(checkIn);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(checkIn.date).toLocaleDateString()} at {checkIn.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{checkIn.notes}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    checkIn.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                  }`}>
                    {checkIn.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  {Object.entries(checkIn.metrics).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">{key}: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCheckIn(checkIn);
                      setShowDetails(true);
                    }}
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View Details
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Details Dialog */}
      <CheckInDetails
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedCheckIn(null);
        }}
        checkIn={selectedCheckIn}
      />
    </div>
  );
};

const ProgressTab = ({ client }: TabContentProps) => {
  // Filter out metrics we don't want to show in the progress view
  const relevantMetrics = Object.entries(client.metrics || {}).filter(
    ([key]) => !['streak', 'completionRate', 'lastCheckIn'].includes(key)
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Progress Charts */}
      <div className="col-span-2 space-y-6">
        {/* Goals Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Goals Progress</h2>
            <div className="space-y-6">
              {client.goals?.map((goal: any) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Progress Overview</h2>
            <div className="space-y-8">
              {relevantMetrics.map(([metric, value]) => (
                <div key={metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {value}
                        {metric === 'weight' ? ' kg' : metric === 'sleep' ? ' hrs' : '%'}
                      </span>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric === 'weight' ? 'bg-green-500' :
                        metric === 'energy' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}
                      style={{
                        width: `${value}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Progress Photos & Achievements */}
      <div className="space-y-6">
        {/* Progress Photos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Photos</h2>
              <button
                onClick={() => {/* TODO: Implement photo upload */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Upload New Photos
              </button>
            </div>

            {/* Upload Area */}
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Achievements</h2>
            <div className="space-y-4">
              {[
                { icon: TrophyIcon, color: 'text-yellow-500', text: 'Completed 4-week program' },
                { icon: FireIcon, color: 'text-red-500', text: '7-day streak maintained' },
                { icon: SparklesIcon, color: 'text-blue-500', text: 'Hit weight goal milestone' }
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                  <span className="text-sm text-gray-900 dark:text-white">{achievement.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormsTab = ({ client }: TabContentProps) => (
  <div className="space-y-6">
    {/* Active Forms */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Forms</h2>
          <button
            onClick={() => {/* TODO: Implement new form */}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Assign New Form
          </button>
        </div>
        <div className="space-y-4">
          {client.forms?.filter((form: any) => form.status === 'pending').map((form: any) => (
            <div key={form.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{form.title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    Due by {new Date(form.date).toLocaleDateString()}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400">
                  Pending
                </span>
              </div>
              <div className="mt-4 flex items-center justify-end space-x-4">
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View Form
                </button>
                <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Completed Forms */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Completed Forms</h2>
        <div className="space-y-4">
          {client.forms?.filter((form: any) => form.status === 'completed').map((form: any) => (
            <div key={form.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{form.title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    Completed on {new Date(form.date).toLocaleDateString()}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                  Completed
                </span>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View Responses
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Form Templates */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Available Templates</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Initial Assessment', icon: ClipboardDocumentListIcon },
            { title: 'Monthly Progress Review', icon: ChartBarIcon },
            { title: 'Nutrition Questionnaire', icon: HeartIcon },
            { title: 'Workout Feedback', icon: BoltIcon },
            { title: 'Goal Setting', icon: TrophyIcon },
            { title: 'Mindset Check-in', icon: BrainIcon }
          ].map((template, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <template.icon className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                {template.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CalendarTab = ({ client }: TabContentProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h2>
        <button
          onClick={() => {/* TODO: Implement new event */}}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Calendar Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{day}</span>
            </div>
          ))}
          
          {/* Calendar Days */}
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 min-h-[100px] relative"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>
              {/* Example Event */}
              {index === 15 && (
                <div className="mt-2">
                  <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs p-1 rounded">
                    Check-in
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Check-in</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow at 10:00 AM</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PhotosTab = () => {
  // Add state for tracking if there are photos
  const [hasPhotos, setHasPhotos] = useState(true);

  // Mock photo data
  const mockPhotos = [
    {
      id: 1,
      type: 'progress',
      date: '2024-03-10',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop',
      category: 'Progress Photos'
    },
    {
      id: 2,
      type: 'form',
      date: '2024-03-08',
      url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=500&fit=crop',
      category: 'Form Check'
    },
    {
      id: 3,
      type: 'progress',
      date: '2024-03-05',
      url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&h=500&fit=crop',
      category: 'Progress Photos'
    },
    {
      id: 4,
      type: 'before-after',
      date: '2024-03-01',
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
      category: 'Before/After'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Progress Photos</h2>
        <div className="flex items-center space-x-2">
          <select className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
            <option>All Photos</option>
            <option>Progress Photos</option>
            <option>Form Check</option>
            <option>Before/After</option>
          </select>
        </div>
      </div>

      {/* Photo Categories */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progress Photos</span>
            <span className="text-gray-400 text-sm">12 photos</span>
          </div>
          <p className="text-gray-400 text-sm">Weekly progress tracking photos</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Form Check</span>
            <span className="text-gray-400 text-sm">5 photos</span>
          </div>
          <p className="text-gray-400 text-sm">Exercise form verification photos</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Before/After</span>
            <span className="text-gray-400 text-sm">2 sets</span>
          </div>
          <p className="text-gray-400 text-sm">Transformation comparison photos</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-4 gap-4">
        {mockPhotos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={photo.url}
              alt={`${photo.category} - ${photo.date}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="p-2 bg-blue-500 rounded-full mx-1" title="View photo">
                  <ArrowsPointingOutIcon className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 bg-gray-600 rounded-full mx-1" title="Add comment">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
              <p className="text-white text-sm">{new Date(photo.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CoachReviewSection = () => {
  const [activeTab, setActiveTab] = useState('training');
  const [review, setReview] = useState<CoachReview | null>(null);

  useEffect(() => {
    // In a real app, fetch check-ins from API
    const mockCheckIns = [/* ... mock data ... */];
    const processedReview = processCheckInResponses(mockCheckIns);
    setReview(processedReview);
  }, []);

  if (!review) return null;

  const renderCategoryContent = (category: keyof CoachReview) => {
    const categoryData = review[category];
    if (!categoryData || typeof categoryData === 'string') return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-semibold">{categoryData.score}/5</div>
          <div className="text-gray-400">Overall Score</div>
        </div>

        {categoryData.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Areas for Improvement</h4>
            <ul className="space-y-2">
              {categoryData.improvements.map((item, i) => (
                <li key={i} className="flex items-center space-x-2 text-sm">
                  <CheckCircleIcon className="h-5 w-5 text-yellow-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {categoryData.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {categoryData.recommendations.map((item, i) => (
                <li key={i} className="flex items-center space-x-2 text-sm">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5 text-blue-500" />
          Coach's Review
        </h3>
        <div className="text-sm text-gray-400">
          Updated {new Date(review.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      <div className="flex space-x-1 mb-6">
        {['training', 'nutrition', 'mindset'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderCategoryContent(activeTab as keyof CoachReview)}
    </div>
  );
};

export default function ClientProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadClient();
  }, [params.id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get client profile from clientService
      const profile = await clientService.getClientProfile(params.id as string);
      if (!profile) {
        throw new Error('Client profile not found');
      }

      // Transform profile data to match the component's expected format
      setClient({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        phone: profile.phone,
        startDate: profile.startDate,
        status: profile.status,
        metrics: {
          streak: profile.metrics?.daysStreak || 0,
          completionRate: profile.metrics?.completionRate || 0,
          lastCheckIn: profile.metrics?.lastCheckIn,
          progress: profile.metrics?.consistency || 0
        },
        program: profile.program,
        forms: profile.assignedForms || [],
        notes: profile.notes,
        goals: profile.goals || []
      });
    } catch (err) {
      setError('Failed to load client data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
        return <PhotosTab />;
      case 'calendar':
        return <CalendarTab client={client} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {client.avatar ? (
                    <Image
                      src={client.avatar}
                      alt={client.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {client.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {new Date(client.startDate).toLocaleDateString()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                    }`}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href={`/coach/messages?client=${client.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Message
                </Link>
                <button
                  onClick={() => {/* TODO: Implement quick check-in */}}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Quick Check-in
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in Streak</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{client.metrics?.streak || 0}</div>
                  <div className="ml-2 text-sm text-green-600 dark:text-green-400">weeks</div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{client.metrics?.completionRate || 0}%</div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Check-in</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {client.metrics?.lastCheckIn ? format(new Date(client.metrics.lastCheckIn), 'MMM d') : 'Never'}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Progress</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{client.metrics?.progress || 0}%</div>
                  <div className="ml-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    <span>+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'check-ins', 'progress', 'forms', 'photos', 'calendar'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 