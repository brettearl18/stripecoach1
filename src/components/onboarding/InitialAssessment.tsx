'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { getAuth } from 'firebase/auth';
import { saveAssessmentProgress, getAssessmentProgress, deleteAssessmentProgress } from '@/lib/services/assessmentService';

interface InitialAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  selectedGoals: string[];
}

const goalSpecificQuestions = {
  sleep: [
    {
      id: 'sleep_quality',
      question: 'How would you rate your current sleep quality?',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Poor', 'Excellent']
    },
    {
      id: 'sleep_duration',
      question: 'How many hours of sleep do you typically get?',
      type: 'number',
      min: 4,
      max: 12
    },
    {
      id: 'sleep_routine',
      question: 'Do you have a consistent sleep routine?',
      type: 'boolean'
    }
  ],
  stress: [
    {
      id: 'stress_level',
      question: 'How would you rate your current stress level?',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Low', 'High']
    },
    {
      id: 'stress_sources',
      question: 'What are your main sources of stress?',
      type: 'multiselect',
      options: ['Work', 'Relationships', 'Health', 'Finances', 'Other']
    },
    {
      id: 'stress_management',
      question: 'Do you currently practice any stress management techniques?',
      type: 'boolean'
    }
  ],
  energy: [
    {
      id: 'energy_level',
      question: 'How would you rate your daily energy levels?',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Low', 'High']
    },
    {
      id: 'energy_patterns',
      question: 'When do you typically feel most energetic?',
      type: 'select',
      options: ['Morning', 'Afternoon', 'Evening', 'No specific pattern']
    }
  ],
  weight: [
    {
      id: 'weight_goal',
      question: 'What is your primary weight goal?',
      type: 'select',
      options: ['Lose weight', 'Gain weight', 'Maintain weight']
    },
    {
      id: 'weight_history',
      question: 'Have you tried to achieve this goal before?',
      type: 'boolean'
    }
  ],
  activity: [
    {
      id: 'activity_level',
      question: 'How would you describe your current activity level?',
      type: 'select',
      options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active']
    },
    {
      id: 'exercise_frequency',
      question: 'How often do you currently exercise?',
      type: 'select',
      options: ['Never', '1-2 times/week', '3-4 times/week', '5+ times/week']
    }
  ],
  recovery: [
    {
      id: 'recovery_quality',
      question: 'How well do you feel you recover between workouts?',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Poor', 'Excellent']
    },
    {
      id: 'recovery_practices',
      question: 'What recovery practices do you currently use?',
      type: 'multiselect',
      options: ['Stretching', 'Foam rolling', 'Massage', 'Ice baths', 'None']
    }
  ],
  nutrition: [
    {
      id: 'nutrition_quality',
      question: 'How would you rate your current nutrition?',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Poor', 'Excellent']
    },
    {
      id: 'dietary_restrictions',
      question: 'Do you have any dietary restrictions?',
      type: 'multiselect',
      options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'None']
    }
  ]
};

export default function InitialAssessment({ isOpen, onClose, onComplete, selectedGoals }: InitialAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const auth = getAuth();

  // Get all questions for selected goals
  const questions = selectedGoals.flatMap(goal => 
    goalSpecificQuestions[goal as keyof typeof goalSpecificQuestions] || []
  );

  const currentQuestion = questions[currentQuestionIndex];

  // Check for saved progress on mount
  useEffect(() => {
    const checkSavedProgress = async () => {
      if (auth.currentUser) {
        const savedProgress = await getAssessmentProgress(auth.currentUser.uid);
        if (savedProgress && savedProgress.selectedGoals.length > 0) {
          setShowResumeDialog(true);
        }
      }
    };
    checkSavedProgress();
  }, [auth.currentUser]);

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveProgress = async () => {
    if (!auth.currentUser) return;
    
    setIsSaving(true);
    try {
      const success = await saveAssessmentProgress(auth.currentUser.uid, {
        selectedGoals,
        answers,
        currentQuestionIndex
      });
      if (success) {
        setHasSavedProgress(true);
        // Show success message
        setTimeout(() => setHasSavedProgress(false), 3000);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeProgress = async () => {
    if (!auth.currentUser) return;
    
    const savedProgress = await getAssessmentProgress(auth.currentUser.uid);
    if (savedProgress) {
      setAnswers(savedProgress.answers);
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
      setShowResumeDialog(false);
    }
  };

  const handleStartNew = async () => {
    if (!auth.currentUser) return;
    
    await deleteAssessmentProgress(auth.currentUser.uid);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResumeDialog(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically send the answers to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      // Delete saved progress after successful submission
      if (auth.currentUser) {
        await deleteAssessmentProgress(auth.currentUser.uid);
      }
      
      onComplete({
        answers,
        selectedGoals,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showResumeDialog) {
    return (
      <div className="w-full">
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">
            Resume Previous Assessment?
          </h3>
          <p className="text-gray-300 mb-6">
            We found a saved assessment in progress. Would you like to continue where you left off or start a new assessment?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleResumeProgress}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Resume
            </button>
            <button
              onClick={handleStartNew}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Start New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Initial Assessment</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <button
              onClick={handleSaveProgress}
              disabled={isSaving}
              className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
            >
              <BookmarkIcon className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : hasSavedProgress ? 'Saved!' : 'Save Progress'}
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-white mb-4">
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === 'range' && (
          <div className="space-y-4">
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={answers[currentQuestion.id] || currentQuestion.min}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{currentQuestion.labels[0]}</span>
              <span>{currentQuestion.labels[1]}</span>
            </div>
            <div className="text-center text-2xl font-bold text-blue-500">
              {answers[currentQuestion.id] || currentQuestion.min}
            </div>
          </div>
        )}

        {currentQuestion.type === 'boolean' && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(true)}
              className={`flex-1 py-3 rounded-lg ${
                answers[currentQuestion.id] === true
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`flex-1 py-3 rounded-lg ${
                answers[currentQuestion.id] === false
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              No
            </button>
          </div>
        )}

        {currentQuestion.type === 'select' && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left py-3 px-4 rounded-lg ${
                  answers[currentQuestion.id] === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multiselect' && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  const currentAnswers = answers[currentQuestion.id] || [];
                  handleAnswer(
                    currentAnswers.includes(option)
                      ? currentAnswers.filter((a: string) => a !== option)
                      : [...currentAnswers, option]
                  );
                }}
                className={`w-full text-left py-3 px-4 rounded-lg ${
                  (answers[currentQuestion.id] || []).includes(option)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'number' && (
          <input
            type="number"
            min={currentQuestion.min}
            max={currentQuestion.max}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Next
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
} 