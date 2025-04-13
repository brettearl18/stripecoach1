'use client';

import { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ChartBarIcon,
  HashtagIcon,
  PencilSquareIcon,
  ListBulletIcon,
  RadioIcon,
  TagIcon,
  DocumentArrowUpIcon,
  PhotoIcon,
  TableCellsIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { Question } from '@/lib/services/firebaseService';

// Add categories for questions
const QUESTION_CATEGORIES = [
  {
    id: 'exercise',
    label: 'Exercise',
    description: 'Workout completion, form, intensity, and progress',
    subcategories: [
      'Workout Adherence',
      'Exercise Form',
      'Workout Intensity',
      'Recovery',
      'Strength Progress',
      'Cardio/Endurance'
    ]
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    description: 'Diet, hydration, and eating habits',
    subcategories: [
      'Meal Plan Adherence',
      'Hydration',
      'Portion Control',
      'Supplements',
      'Eating Habits',
      'Food Quality'
    ]
  },
  {
    id: 'mindset',
    label: 'Mindset',
    description: 'Motivation, goals, and mental state',
    subcategories: [
      'Motivation',
      'Goal Focus',
      'Self-Confidence',
      'Habit Formation',
      'Mental Resilience'
    ]
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Daily habits and work-life balance',
    subcategories: [
      'Work-Life Balance',
      'Daily Routine',
      'Social Support',
      'Time Management',
      'Lifestyle Habits'
    ]
  },
  {
    id: 'sleep',
    label: 'Sleep',
    description: 'Sleep quality and recovery',
    subcategories: [
      'Sleep Duration',
      'Sleep Quality',
      'Sleep Schedule',
      'Pre-sleep Routine',
      'Recovery Quality'
    ]
  },
  {
    id: 'stress',
    label: 'Stress Management',
    description: 'Stress levels and coping mechanisms',
    subcategories: [
      'Stress Levels',
      'Coping Mechanisms',
      'Relaxation',
      'Mental Health',
      'Energy Management'
    ]
  },
  {
    id: 'body',
    label: 'Body Metrics',
    description: 'Physical measurements and body composition',
    subcategories: [
      'Weight',
      'Body Composition',
      'Measurements',
      'Energy Levels',
      'Physical Health'
    ]
  },
  {
    id: 'goals',
    label: 'Goals & Progress',
    description: 'Goal tracking and achievement',
    subcategories: [
      'Short-term Goals',
      'Long-term Goals',
      'Progress Tracking',
      'Milestone Achievement',
      'Satisfaction'
    ]
  }
] as const;

// Update the Question type to include category
export type QuestionType = 'yesNo' | 'scale' | 'number' | 'text' | 'multipleChoice' | 'radio';

const QUESTION_TYPES = [
  { 
    value: 'yesNo', 
    label: 'Yes/No Question',
    description: 'Binary questions with impact weight',
    example: 'Did you complete all workouts?',
    icon: CheckCircleIcon
  },
  { 
    value: 'scale', 
    label: 'Scale (1-10)', 
    description: 'Rating questions (1=poor, 10=excellent)',
    example: 'Rate your energy levels',
    icon: ChartBarIcon
  },
  { 
    value: 'radio', 
    label: 'Radio Button',
    description: 'Single choice from options',
    example: 'Which best describes your mood?',
    icon: RadioIcon
  },
  { 
    value: 'number', 
    label: 'Number Input',
    description: 'Specific numeric measurements',
    example: 'Hours of sleep per night',
    icon: HashtagIcon
  },
  { 
    value: 'text', 
    label: 'Text Answer',
    description: 'Open-ended feedback',
    example: 'What challenges did you face?',
    icon: PencilSquareIcon
  },
  { 
    value: 'multipleChoice', 
    label: 'Multiple Choice',
    description: 'Select multiple options',
    example: 'Which areas need attention?',
    icon: ListBulletIcon
  }
] as const;

interface AIQuestionSuggestion {
  question: string;
  helpText?: string;
  weight: number;
  explanation: string;
}

interface QuestionBuilderProps {
  onSaveQuestions: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

// Update the getAISuggestion function to provide better context-aware suggestions
const getAISuggestion = (currentQuestion: Question): AIQuestionSuggestion => {
  const questionLower = currentQuestion.question.toLowerCase();
  
  if (currentQuestion.type === 'scale') {
    if (questionLower.includes('energy') || questionLower.includes('fatigue')) {
      return {
        question: "Rate your energy levels during workouts this week",
        helpText: "1 = extremely low energy, 10 = excellent energy levels",
        weight: 0,
        explanation: "Scale questions should be phrased where 10 is always the best outcome. Added clear scale anchors in help text."
      };
    }
    if (questionLower.includes('nutrition') || questionLower.includes('diet') || questionLower.includes('food')) {
      return {
        question: "Rate your adherence to your nutrition plan this week",
        helpText: "1 = poor adherence, 10 = perfect adherence",
        weight: 0,
        explanation: "Scale questions help measure subjective adherence levels. Clear anchors help clients rate consistently."
      };
    }
    return {
      question: currentQuestion.question,
      helpText: "1 = poor/low, 10 = excellent/high",
      weight: 0,
      explanation: "Added standard scale anchors. Remember that 10 should always represent the best outcome."
    };
  }

  if (currentQuestion.type === 'number') {
    if (questionLower.includes('sleep')) {
      return {
        question: "How many hours of sleep did you get on average this week?",
        helpText: "Round to the nearest half hour",
        weight: 0,
        explanation: "Number questions should ask for specific, measurable values. Added rounding guidance for consistency."
      };
    }
    if (questionLower.includes('water')) {
      return {
        question: "How many glasses of water did you drink daily on average?",
        helpText: "Count 8oz glasses or equivalent",
        weight: 0,
        explanation: "Specified measurement unit for clarity and consistency in responses."
      };
    }
    return {
      question: currentQuestion.question,
      helpText: "Please specify the unit of measurement in your answer",
      weight: 0,
      explanation: "Number questions should always clarify the expected unit of measurement."
    };
  }

  // Existing workout adherence patterns for Yes/No questions
  if (currentQuestion.type === 'yesNo') {
    if (questionLower.includes('workout') || questionLower.includes('exercise') || questionLower.includes('training')) {
      if (questionLower.includes('skip') || questionLower.includes('miss')) {
        return {
          question: "Did you miss any scheduled workouts this week?",
          helpText: "Please be honest - this helps us adjust your program if needed",
          weight: -8,
          explanation: "Negative phrasing with high negative weight (-8) for missed workouts. Clear impact on progress."
        };
      } else {
        return {
          question: "Did you complete all your scheduled workouts this week?",
          helpText: "Include all prescribed exercises and sets",
          weight: 8,
          explanation: "Positive phrasing with high positive weight (8) for workout completion. Key success metric."
        };
      }
    }
    
    if (questionLower.includes('alcohol') || questionLower.includes('drink') || questionLower.includes('smoking')) {
      return {
        question: "Did you consume any alcohol this week?",
        helpText: "Be honest - this helps us understand your recovery needs",
        weight: -5,
        explanation: "Negative weight for behaviors that impact recovery. Moderate weight (-5) to acknowledge but not over-penalize."
      };
    }
  }

  if (currentQuestion.type === 'text') {
    return {
      question: "What challenges or obstacles did you face this week?",
      helpText: "This helps us adjust your program and provide better support",
      weight: 0,
      explanation: "Open-ended questions should encourage detailed, honest feedback. No weight as this is qualitative feedback."
    };
  }

  if (currentQuestion.type === 'multipleChoice') {
    return {
      question: "Which area of your program needs the most attention?",
      helpText: "Select the area where you'd like more support",
      options: [
        "Workout Form/Technique",
        "Nutrition/Meal Planning",
        "Recovery/Sleep",
        "Motivation/Accountability"
      ],
      weight: 0,
      explanation: "Multiple choice questions should provide clear, distinct options that cover major areas of focus."
    };
  }

  return {
    question: currentQuestion.question,
    helpText: "Be specific in your response",
    weight: currentQuestion.weight,
    explanation: "Current question structure looks good. Consider adding more specific guidance in the help text."
  };
};

// Add supported file types
const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'PDF Document',
  'image/png': 'PNG Image',
  'image/jpeg': 'JPEG Image',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'text/csv': 'CSV File',
  'application/json': 'JSON File'
};

export default function QuestionBuilder({ onSaveQuestions, initialQuestions = [] }: QuestionBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'details' | 'method' | 'questions' | 'preview' | 'assign'>('method');
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedMethod, setSelectedMethod] = useState<'manual' | 'ai' | 'import' | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formDetails, setFormDetails] = useState({
    title: '',
    description: '',
    frequency: 'Weekly',
    availableFrom: {
      day: 'Monday',
      time: '09:00 AM'
    },
    dueBy: {
      day: 'Tuesday',
      time: '05:00 PM'
    },
    assignedClients: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<Partial<Question>[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showGoogleSheetInput, setShowGoogleSheetInput] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const handleSave = () => {
    // Validate based on question type
    if (!questions[0].question.trim()) {
      alert('Question text is required');
      return;
    }

    if (questions[0].type === 'multipleChoice' && questions[0].options.length < 2) {
      alert('Multiple choice questions must have at least 2 options');
      return;
    }

    if ((questions[0].type === 'scale' || questions[0].type === 'number') && 
        questions[0].validation &&
        questions[0].validation.max <= questions[0].validation.min) {
      alert('Maximum value must be greater than minimum value');
      return;
    }

    onSaveQuestions(questions);
  };

  const addOption = () => {
    setQuestions(prev => [
      {
        ...prev[0],
        options: [...prev[0].options, '']
      }
    ]);
  };

  const updateOption = (index: number, value: string) => {
    setQuestions(prev => [
      {
        ...prev[0],
        options: prev[0].options.map((opt, i) => i === index ? value : opt)
      }
    ]);
  };

  const removeOption = (index: number) => {
    setQuestions(prev => [
      {
        ...prev[0],
        options: prev[0].options.filter((_, i) => i !== index)
      }
    ]);
  };

  const handleGetSuggestion = () => {
    const newSuggestion = getAISuggestion(questions[0]);
    setQuestions(prev => [
      {
        ...prev[0],
        question: newSuggestion.question,
        helpText: newSuggestion.helpText || prev[0].helpText,
        weight: newSuggestion.weight
      }
    ]);
  };

  const applySuggestion = () => {
    handleGetSuggestion();
  };

  const handleImport = async (file?: File, googleSheetUrl?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (googleSheetUrl) {
        formData.append('googleSheetUrl', googleSheetUrl);
      }

      const response = await fetch('/api/extract-questions', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process import');
      }

      setPreviewText(data.preview?.extractedText);
      setExtractedQuestions(data.questions || []);
      setShowPreview(true);

      if (data.questions?.length > 0) {
        handleImportQuestions(data.questions.map((q: Partial<Question>) => ({
          id: crypto.randomUUID(),
          ...q as Question
        })));
      } else {
        setError('No questions were found in the imported content.');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while importing');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new question
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'text',
      question: '',
      required: false,
      weight: 1,
      options: [],
      validation: {
        min: 1,
        max: 10
      }
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  // Function to handle saving AI generated questions
  const handleSaveAIQuestions = (generatedQuestions: Question[]) => {
    setQuestions([...questions, ...generatedQuestions]);
    setShowAIBuilder(false);
  };

  // Function to handle importing questions
  const handleImportQuestions = (importedQuestions: Question[]) => {
    setQuestions([...questions, ...importedQuestions]);
    setShowPreview(false);
    setPreviewText(null);
    setExtractedQuestions([]);
  };

  const handleQuestionChange = (field: keyof Question, value: any) => {
    if (!selectedQuestion) return;
    
    const updatedQuestion = { ...selectedQuestion, [field]: value };
    const updatedQuestions = questions.map(q => 
      q.id === selectedQuestion.id ? updatedQuestion : q
    );
    
    setSelectedQuestion(updatedQuestion);
    setQuestions(updatedQuestions);
  };

  // Render form details step
  const renderFormDetails = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-normal text-gray-200 mb-6">Form Details</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-normal text-gray-400 mb-2">Form Title</label>
            <input
              type="text"
              value={formDetails.title}
              onChange={(e) => setFormDetails({ ...formDetails, title: e.target.value })}
              placeholder="Enter a descriptive name for your form"
              className="w-full h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-normal text-gray-400 mb-2">Description</label>
            <textarea
              value={formDetails.description}
              onChange={(e) => setFormDetails({ ...formDetails, description: e.target.value })}
              placeholder="Describe the purpose of this form"
              rows={4}
              className="w-full rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-normal text-gray-200 mb-6">Schedule</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-normal text-gray-400 mb-2">Frequency</label>
            <select
              value={formDetails.frequency}
              onChange={(e) => setFormDetails({ ...formDetails, frequency: e.target.value })}
              className="w-full h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Biweekly">Biweekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-normal text-gray-400 mb-2">Available From</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formDetails.availableFrom.day}
                  onChange={(e) => setFormDetails({
                    ...formDetails,
                    availableFrom: { ...formDetails.availableFrom, day: e.target.value }
                  })}
                  className="h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={formDetails.availableFrom.time}
                  onChange={(e) => setFormDetails({
                    ...formDetails,
                    availableFrom: { ...formDetails.availableFrom, time: e.target.value }
                  })}
                  className="h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-normal text-gray-400 mb-2">Due By</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formDetails.dueBy.day}
                  onChange={(e) => setFormDetails({
                    ...formDetails,
                    dueBy: { ...formDetails.dueBy, day: e.target.value }
                  })}
                  className="h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={formDetails.dueBy.time}
                  onChange={(e) => setFormDetails({
                    ...formDetails,
                    dueBy: { ...formDetails.dueBy, time: e.target.value }
                  })}
                  className="h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-normal text-gray-200 mb-6">Assign to Clients</h2>
        <div>
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full h-12 rounded-md bg-[#2A303A] border border-gray-700 text-gray-200 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  );

  // Render question method selection step
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-200">Choose Question Creation Method</h2>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => {
            setSelectedMethod('manual');
            setShowQuestionForm(true);
            setCurrentStep('questions');
          }}
          className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-700 bg-[#2A303A] hover:bg-[#2A303A]/80 transition-all"
        >
          <PlusIcon className="w-8 h-8 text-indigo-400 mb-3" />
          <h3 className="text-gray-200 font-medium">Add Manually</h3>
          <p className="text-sm text-gray-400 mt-1">Create custom questions one by one</p>
        </button>

        <button
          onClick={() => {
            setSelectedMethod('ai');
            setShowAIBuilder(true);
            setCurrentStep('questions');
          }}
          className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-700 bg-[#2A303A] hover:bg-[#2A303A]/80 transition-all"
        >
          <SparklesIcon className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-gray-200 font-medium">Build with AI</h3>
          <p className="text-sm text-gray-400 mt-1">Generate questions automatically</p>
        </button>

        <button
          onClick={() => {
            setSelectedMethod('import');
            setShowImport(true);
            setCurrentStep('questions');
          }}
          className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-700 bg-[#2A303A] hover:bg-[#2A303A]/80 transition-all"
        >
          <ArrowUpTrayIcon className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-gray-200 font-medium">Import Questions</h3>
          <p className="text-sm text-gray-400 mt-1">Upload from file or Google Sheets</p>
        </button>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('details')}
          className="px-4 py-2 text-gray-400 hover:text-gray-200"
        >
          Back
        </button>
      </div>
    </div>
  );

  // Render question preview and management step
  const renderQuestionPreview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-200">Review Questions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep('method')}
            className="px-4 py-2 text-gray-400 hover:text-gray-200"
          >
            Add More Questions
          </button>
          <button
            onClick={() => setCurrentStep('assign')}
            disabled={questions.length === 0}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-[#1F242C] rounded-lg p-4 relative group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-gray-200 font-medium">{question.question}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Type: {question.type} • Required: {question.required ? 'Yes' : 'No'} • 
                  Weight: {question.weight} • Category: {question.category}
                </p>
                {question.options && question.options.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">Options:</p>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                      {question.options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newQuestions = [...questions];
                    if (index > 0) {
                      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
                      setQuestions(newQuestions);
                    }
                  }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newQuestions = [...questions];
                    if (index < questions.length - 1) {
                      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
                      setQuestions(newQuestions);
                    }
                  }}
                  disabled={index === questions.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                >
                  <ArrowDownIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newQuestions = questions.filter((_, i) => i !== index);
                    setQuestions(newQuestions);
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render client assignment step
  const renderClientAssignment = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-200">Assign to Clients</h2>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded-md bg-[#1F242C] border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {/* Client list will be populated here */}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('preview')}
          className="px-4 py-2 text-gray-400 hover:text-gray-200"
        >
          Back
        </button>
        <button
          onClick={() => {
            // Handle final form submission
            onSaveQuestions(questions);
          }}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400"
        >
          Create Form
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1D21]">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-800 bg-[#1A1D21]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/check-ins" className="flex items-center text-gray-400 hover:text-gray-200">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span>Back to Check-ins</span>
              </a>
            </div>
            
            <h1 className="text-xl text-gray-200 font-normal">Create New Form</h1>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-gray-400 hover:text-gray-200 font-normal">
                Preview Form
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-gray-200 font-normal">
                Cancel
              </button>
              <button className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400">
                <ClipboardIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep !== 'details' && (
          /* Progress indicator - Only show when not on details step */
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {['details', 'method', 'questions', 'preview', 'assign'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${currentStep === step ? 'bg-indigo-500 text-white' : 
                      index < ['details', 'method', 'questions', 'preview', 'assign'].indexOf(currentStep) 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-gray-700 text-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-24 h-1 mx-2 ${
                      index < ['details', 'method', 'questions', 'preview', 'assign'].indexOf(currentStep)
                        ? 'bg-indigo-500/20'
                        : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Form Details</span>
              <span className="text-xs text-gray-400">Method</span>
              <span className="text-xs text-gray-400">Questions</span>
              <span className="text-xs text-gray-400">Preview</span>
              <span className="text-xs text-gray-400">Assign</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-[#1F242C] rounded-lg p-8">
          {currentStep === 'details' && renderFormDetails()}
          {currentStep === 'method' && renderMethodSelection()}
          {currentStep === 'questions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-normal text-gray-200">Questions</h2>
              <p className="text-sm text-gray-400">{questions.length} questions added</p>
              
              <div className="text-center">
                <h3 className="text-lg text-gray-300 mb-6">Choose how you'd like to create your questions:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manual Question Creation */}
                  <button
                    onClick={handleAddQuestion}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-700 bg-[#2A303A] hover:bg-[#2A303A]/80 transition-all"
                  >
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-3">
                      <PlusIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-gray-200 font-medium">Add a question</h3>
                    <p className="text-sm text-gray-400 mt-1">Create custom questions manually</p>
                  </button>

                  {/* AI Question Generation */}
                  <button
                    onClick={() => setShowAIBuilder(true)}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-700 bg-[#2A303A] hover:bg-[#2A303A]/80 transition-all"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                      <SparklesIcon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-gray-200 font-medium">Build with AI</h3>
                    <p className="text-sm text-gray-400 mt-1">Generate questions automatically</p>
                  </button>
                </div>
              </div>

              {/* Question Form */}
              {showQuestionForm && (
                <div className="mt-8 bg-[#2A303A] rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-200 mb-6">Add New Question</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text
                      </label>
                      <textarea
                        value={questions[questions.length - 1]?.text || ''}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[questions.length - 1].text = e.target.value;
                          setQuestions(updatedQuestions);
                        }}
                        rows={2}
                        className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Question Type
                        </label>
                        <select
                          value={questions[questions.length - 1]?.type || 'yesNo'}
                          onChange={(e) => {
                            const updatedQuestions = [...questions];
                            const type = e.target.value as QuestionType;
                            updatedQuestions[questions.length - 1] = {
                              ...updatedQuestions[questions.length - 1],
                              type,
                              // Reset options when changing type
                              options: type === 'multipleChoice' || type === 'radio' ? [] : undefined
                            };
                            setQuestions(updatedQuestions);
                          }}
                          className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {QUESTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={questions[questions.length - 1]?.category || ''}
                          onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questions.length - 1].category = e.target.value;
                            setQuestions(updatedQuestions);
                          }}
                          className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select a category</option>
                          {QUESTION_CATEGORIES.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Options for multiple choice or radio questions */}
                    {(questions[questions.length - 1]?.type === 'multipleChoice' || 
                      questions[questions.length - 1]?.type === 'radio') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {questions[questions.length - 1]?.options?.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const updatedQuestions = [...questions];
                                  const options = [...(updatedQuestions[questions.length - 1].options || [])];
                                  options[index] = e.target.value;
                                  updatedQuestions[questions.length - 1].options = options;
                                  setQuestions(updatedQuestions);
                                }}
                                className="flex-1 bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={`Option ${index + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const updatedQuestions = [...questions];
                                  const options = updatedQuestions[questions.length - 1].options?.filter((_, i) => i !== index) || [];
                                  updatedQuestions[questions.length - 1].options = options;
                                  setQuestions(updatedQuestions);
                                }}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updatedQuestions = [...questions];
                              const options = [...(updatedQuestions[questions.length - 1].options || []), ''];
                              updatedQuestions[questions.length - 1].options = options;
                              setQuestions(updatedQuestions);
                            }}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scale settings for scale questions */}
                    {questions[questions.length - 1]?.type === 'scale' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Minimum Value
                          </label>
                          <input
                            type="number"
                            value={questions[questions.length - 1]?.validation?.min || 1}
                            onChange={(e) => {
                              const updatedQuestions = [...questions];
                              updatedQuestions[questions.length - 1].validation = {
                                ...updatedQuestions[questions.length - 1].validation,
                                min: parseInt(e.target.value)
                              };
                              setQuestions(updatedQuestions);
                            }}
                            className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Value
                          </label>
                          <input
                            type="number"
                            value={questions[questions.length - 1]?.validation?.max || 10}
                            onChange={(e) => {
                              const updatedQuestions = [...questions];
                              updatedQuestions[questions.length - 1].validation = {
                                ...updatedQuestions[questions.length - 1].validation,
                                max: parseInt(e.target.value)
                              };
                              setQuestions(updatedQuestions);
                            }}
                            className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Weight input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Weight
                      </label>
                      <input
                        type="number"
                        value={questions[questions.length - 1]?.weight || 1}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[questions.length - 1].weight = parseInt(e.target.value);
                          setQuestions(updatedQuestions);
                        }}
                        min="1"
                        max="10"
                        className="w-full bg-[#1F242C] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Weight determines the importance of this question (1-10)</p>
                    </div>

                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="required"
                        checked={questions[questions.length - 1]?.required || false}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[questions.length - 1].required = e.target.checked;
                          setQuestions(updatedQuestions);
                        }}
                        className="h-4 w-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#1F242C]"
                      />
                      <label htmlFor="required" className="ml-2 text-sm text-gray-300">
                        This question is required
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setQuestions(questions.slice(0, -1));
                          setShowQuestionForm(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!questions[questions.length - 1]?.text?.trim()) {
                            alert('Please enter a question text');
                            return;
                          }
                          if ((questions[questions.length - 1]?.type === 'multipleChoice' || 
                               questions[questions.length - 1]?.type === 'radio') && 
                              (!questions[questions.length - 1]?.options?.length || 
                               questions[questions.length - 1]?.options?.some(opt => !opt.trim()))) {
                            alert('Please add at least one option for multiple choice or radio questions');
                            return;
                          }
                          setShowQuestionForm(false);
                          setCurrentStep('preview');
                        }}
                        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Save Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {currentStep === 'preview' && renderQuestionPreview()}
          {currentStep === 'assign' && renderClientAssignment()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep !== 'details' && (
            <button
              onClick={() => {
                const steps: Array<'details' | 'method' | 'questions' | 'preview' | 'assign'> = 
                  ['details', 'method', 'questions', 'preview', 'assign'];
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex - 1]);
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-200"
            >
              Back
            </button>
          )}
          {currentStep !== 'assign' && (
            <button
              onClick={() => {
                const steps: Array<'details' | 'method' | 'questions' | 'preview' | 'assign'> = 
                  ['details', 'method', 'questions', 'preview', 'assign'];
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex + 1]);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400"
              disabled={currentStep === 'details' && !formDetails.title}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 