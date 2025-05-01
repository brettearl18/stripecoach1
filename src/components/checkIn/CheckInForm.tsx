import { useState, useCallback, useEffect } from 'react';
import { CheckInForm, DailyMetrics, MetricValue, ProgressUpdate } from '@/types/checkIn';
import { CompletionScreen } from './CompletionScreen';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDropzone } from 'react-dropzone';
import { ProgressCharts } from './ProgressCharts';

interface ValidationErrors {
  goals?: string[];
  achievements?: string[];
  challenges?: string[];
  metrics?: string[];
  questions?: string[];
}

interface CheckInFormProps {
  onSubmit: (data: CheckInForm) => Promise<void>;
  initialData?: Partial<CheckInForm>;
  history?: CheckInHistory;
}

export const CheckInForm = ({ onSubmit, initialData, history }: CheckInFormProps) => {
  const [formData, setFormData] = useState<CheckInForm>(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('checkInDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only use saved data if it's from today
        if (new Date(parsed.lastSaved).toDateString() === new Date().toDateString()) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved check-in data:', e);
      }
    }
    // Fall back to initialData or defaults
    return {
      metrics: {
        weight: initialData?.metrics?.weight,
        weightUnit: initialData?.metrics?.weightUnit || 'kg',
        sleep: initialData?.metrics?.sleep,
        energy: initialData?.metrics?.energy,
        mood: initialData?.metrics?.mood,
        stress: initialData?.metrics?.stress,
        water: initialData?.metrics?.water,
        steps: initialData?.metrics?.steps,
      },
      progress: {
        goals: initialData?.progress?.goals || [],
        achievements: initialData?.progress?.achievements || [],
        challenges: initialData?.progress?.challenges || [],
      },
      questions: initialData?.questions || [],
      photos: initialData?.photos || [],
      notes: initialData?.notes || '',
      status: 'draft',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save function
  const autoSave = useCallback(
    debounce(async (data: CheckInForm) => {
      setIsSaving(true);
      try {
        // Save to localStorage
        const dataToSave = {
          ...data,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem('checkInDraft', JSON.stringify(dataToSave));
        setLastSaved(new Date());
      } catch (err) {
        console.error('Error auto-saving:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  // Update form data and trigger auto-save
  const updateFormData = useCallback((updater: (prev: CheckInForm) => CheckInForm) => {
    setFormData(prev => {
      const newData = updater(prev);
      autoSave(newData);
      return newData;
    });
  }, [autoSave]);

  const handleMetricChange = (field: keyof DailyMetrics, value: number | MetricValue) => {
    updateFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [field]: value
      }
    }));
    debouncedValidate('metrics');
  };

  const validateField = useCallback((field: keyof ValidationErrors, value: any): string[] => {
    const errors: string[] = [];
    
    switch (field) {
      case 'metrics':
        if (formData.metrics.weight !== undefined && formData.metrics.weight < 0) {
          errors.push('Weight cannot be negative');
        }
        if (formData.metrics.sleep !== undefined && (formData.metrics.sleep < 0 || formData.metrics.sleep > 24)) {
          errors.push('Sleep hours must be between 0 and 24');
        }
        if (formData.metrics.energy !== undefined && (formData.metrics.energy < 1 || formData.metrics.energy > 5)) {
          errors.push('Energy level must be between 1 and 5');
        }
        if (formData.metrics.mood !== undefined && (formData.metrics.mood < 1 || formData.metrics.mood > 5)) {
          errors.push('Mood level must be between 1 and 5');
        }
        break;

      case 'questions':
        formData.questions.forEach((question, index) => {
          if (question.required && !question.value) {
            errors.push(`Question ${index + 1} is required`);
          }
        });
        break;

      case 'goals':
        if (formData.progress.goals.length === 0) {
          errors.push('At least one goal is required');
        } else {
          formData.progress.goals.forEach((goal, index) => {
            if (!goal.name.trim()) {
              errors.push(`Goal ${index + 1} must have a name`);
            }
            if (goal.status === 'in-progress' && !goal.notes?.trim()) {
              errors.push(`Goal "${goal.name}" needs progress notes`);
            }
          });
        }
        break;
      
      case 'achievements':
        formData.progress.achievements.forEach((achievement, index) => {
          if (!achievement.description.trim()) {
            errors.push(`Achievement ${index + 1} cannot be empty`);
          }
          if (achievement.description.length > 500) {
            errors.push(`Achievement ${index + 1} is too long (max 500 characters)`);
          }
        });
        break;
      
      case 'challenges':
        formData.progress.challenges.forEach((challenge, index) => {
          if (!challenge.description.trim()) {
            errors.push(`Challenge ${index + 1} cannot be empty`);
          }
          if (challenge.description.length > 500) {
            errors.push(`Challenge ${index + 1} is too long (max 500 characters)`);
          }
        });
        break;
    }
    
    return errors;
  }, [formData]);

  const debouncedValidate = useCallback(
    debounce((field: keyof ValidationErrors) => {
      const errors = validateField(field, formData.progress[field]);
      setValidationErrors(prev => ({
        ...prev,
        [field]: errors
      }));
    }, 300),
    [validateField, formData.progress]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateProgressUpdate()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        status: 'submitted',
        lastSaved: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (questionId: string, value: any) => {
    updateFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId ? { ...question, value } : question
      )
    }));
  };

  const currentQuestion = formData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / formData.questions.length) * 100;

  const goToNextQuestion = () => {
    if (currentQuestionIndex < formData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderInput = (question: CheckInForm['questions'][0]) => {
    switch (question.type) {
      case 'number':
        return (
          <input
            type="number"
            value={question.value || ''}
            onChange={(e) => handleInputChange(question.id, parseFloat(e.target.value))}
            className="w-full px-4 py-3 text-lg bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            placeholder="Enter a number"
            min={0}
            required={question.required}
          />
        );
      case 'rating_scale':
        return (
          <div className="flex justify-center space-x-4 py-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleInputChange(question.id, rating)}
                className={`w-12 h-12 rounded-full text-lg font-semibold transition-all duration-200 ${
                  question.value === rating
                    ? 'bg-blue-500 text-white transform scale-110'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleGoalStatusChange = (goalId: string, status: 'completed' | 'in-progress' | 'not-started') => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        goals: prev.progress.goals.map(goal =>
          goal.id === goalId ? { ...goal, status } : goal
        )
      }
    }));
    debouncedValidate('goals');
  };

  const handleGoalNotesChange = (goalId: string, notes: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        goals: prev.progress.goals.map(goal =>
          goal.id === goalId ? { ...goal, notes } : goal
        )
      }
    }));
    debouncedValidate('goals');
  };

  const handleAchievementChange = (id: string, description: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        achievements: prev.progress.achievements.map(achievement =>
          achievement.id === id ? { ...achievement, description } : achievement
        )
      }
    }));
    debouncedValidate('achievements');
  };

  const handleAddAchievement = () => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        achievements: [
          ...prev.progress.achievements,
          {
            id: uuidv4(),
            description: '',
            date: new Date().toISOString()
          }
        ]
      }
    }));
    debouncedValidate('achievements');
  };

  const handleAddChallenge = () => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        challenges: [
          ...prev.progress.challenges,
          {
            id: uuidv4(),
            description: '',
            impact: 'medium'
          }
        ]
      }
    }));
    debouncedValidate('challenges');
  };

  const handleChallengeChange = (id: string, field: 'description' | 'impact', value: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        challenges: prev.progress.challenges.map(challenge =>
          challenge.id === id ? { ...challenge, [field]: value } : challenge
        )
      }
    }));
    if (field === 'description') {
      debouncedValidate('challenges');
    }
  };

  const validateProgressUpdate = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate Goals
    const goalErrors = validateField('goals', formData.progress.goals);
    if (goalErrors.length > 0) {
      errors.goals = goalErrors;
      isValid = false;
    }

    // Validate Achievements
    const achievementErrors = validateField('achievements', formData.progress.achievements);
    if (achievementErrors.length > 0) {
      errors.achievements = achievementErrors;
      isValid = false;
    }

    // Validate Challenges
    const challengeErrors = validateField('challenges', formData.progress.challenges);
    if (challengeErrors.length > 0) {
      errors.challenges = challengeErrors;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Add character count indicators
  const renderCharacterCount = (text: string, maxLength: number) => {
    const remaining = maxLength - text.length;
    return (
      <span className={`text-xs ${remaining < 50 ? 'text-red-500' : 'text-gray-500'}`}>
        {remaining} characters remaining
      </span>
    );
  };

  // Add delete handlers
  const handleDeleteGoal = (goalId: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        goals: prev.progress.goals.filter(goal => goal.id !== goalId)
      }
    }));
    debouncedValidate('goals');
  };

  const handleDeleteAchievement = (achievementId: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        achievements: prev.progress.achievements.filter(achievement => achievement.id !== achievementId)
      }
    }));
    debouncedValidate('achievements');
  };

  const handleDeleteChallenge = (challengeId: string) => {
    updateFormData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        challenges: prev.progress.challenges.filter(challenge => challenge.id !== challengeId)
      }
    }));
    debouncedValidate('challenges');
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    if (type === 'goals') {
      const newGoals = Array.from(formData.progress.goals);
      const [removed] = newGoals.splice(source.index, 1);
      newGoals.splice(destination.index, 0, removed);

      updateFormData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          goals: newGoals
        }
      }));
    } else if (type === 'achievements') {
      const newAchievements = Array.from(formData.progress.achievements);
      const [removed] = newAchievements.splice(source.index, 1);
      newAchievements.splice(destination.index, 0, removed);

      updateFormData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          achievements: newAchievements
        }
      }));
    } else if (type === 'challenges') {
      const newChallenges = Array.from(formData.progress.challenges);
      const [removed] = newChallenges.splice(source.index, 1);
      newChallenges.splice(destination.index, 0, removed);

      updateFormData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          challenges: newChallenges
        }
      }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }));

    updateFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: true
  });

  const handleDeletePhoto = (photoId: string) => {
    updateFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => {
        if (photo.id === photoId) {
          // Clean up the preview URL
          URL.revokeObjectURL(photo.preview);
          return false;
        }
        return true;
      })
    }));
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.photos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, []);

  if (isCompleted) {
    return <CompletionScreen formTitle={formData.title} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-save status */}
      <div className="fixed bottom-4 right-4 bg-gray-800/80 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
        {isSaving ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving...</span>
          </div>
        ) : lastSaved ? (
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          </div>
        ) : null}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Daily Metrics Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Metrics</h2>
        {validationErrors.metrics && (
          <div className="mb-4 text-sm text-red-600">
            {validationErrors.metrics.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                step="0.1"
                value={formData.metrics.weight || ''}
                onChange={(e) => handleMetricChange('weight', parseFloat(e.target.value))}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md border ${
                  validationErrors.metrics?.some(err => err.includes('Weight'))
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter weight"
              />
              <select
                value={formData.metrics.weightUnit}
                onChange={(e) => handleMetricChange('weightUnit', e.target.value as 'kg' | 'lbs')}
                className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm rounded-md bg-gray-50 text-gray-700"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Sleep Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sleep (hours)</label>
            <input
              type="number"
              step="0.5"
              value={formData.metrics.sleep || ''}
              onChange={(e) => handleMetricChange('sleep', parseFloat(e.target.value))}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                validationErrors.metrics?.some(err => err.includes('Sleep'))
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Hours of sleep"
            />
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Energy Level</label>
            <select
              value={formData.metrics.energy || ''}
              onChange={(e) => handleMetricChange('energy', parseInt(e.target.value) as MetricValue)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                validationErrors.metrics?.some(err => err.includes('Energy'))
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="">Select energy level</option>
              <option value="1">Very Low</option>
              <option value="2">Low</option>
              <option value="3">Moderate</option>
              <option value="4">High</option>
              <option value="5">Very High</option>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mood</label>
            <select
              value={formData.metrics.mood || ''}
              onChange={(e) => handleMetricChange('mood', parseInt(e.target.value) as MetricValue)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                validationErrors.metrics?.some(err => err.includes('Mood'))
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="">Select mood</option>
              <option value="1">Very Low</option>
              <option value="2">Low</option>
              <option value="3">Moderate</option>
              <option value="4">High</option>
              <option value="5">Very High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Update Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Update</h2>
        
        {/* Goals Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-700">Goals</h3>
            {validationErrors.goals && (
              <div className="text-sm text-red-600">
                {validationErrors.goals.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="goals" type="goals">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {formData.progress.goals.map((goal, index) => (
                    <Draggable key={goal.id} draggableId={goal.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-gray-50 p-4 rounded-lg ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">{goal.name}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={goal.status}
                                onChange={(e) => handleGoalStatusChange(goal.id, e.target.value as 'completed' | 'in-progress' | 'not-started')}
                                className={`px-3 py-1 border rounded-md text-sm ${
                                  goal.status === 'in-progress' && !goal.notes?.trim()
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={goal.notes || ''}
                            onChange={(e) => handleGoalNotesChange(goal.id, e.target.value)}
                            placeholder="Add notes about your progress..."
                            className={`w-full px-3 py-2 border rounded-md text-sm ${
                              goal.status === 'in-progress' && !goal.notes?.trim()
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            rows={2}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Achievements Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-700">Achievements</h3>
            <div className="flex items-center gap-2">
              {validationErrors.achievements && (
                <div className="text-sm text-red-600">
                  {validationErrors.achievements.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Achievement
              </button>
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="achievements" type="achievements">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {formData.progress.achievements.map((achievement, index) => (
                    <Draggable key={achievement.id} draggableId={achievement.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex flex-col gap-1 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={achievement.description}
                              onChange={(e) => handleAchievementChange(achievement.id, e.target.value)}
                              placeholder="What did you achieve?"
                              className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                                !achievement.description.trim() || achievement.description.length > 500
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                              }`}
                            />
                            <span className="text-sm text-gray-500">
                              {new Date(achievement.date).toLocaleDateString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAchievement(achievement.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {renderCharacterCount(achievement.description, 500)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Challenges Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-700">Challenges</h3>
            <div className="flex items-center gap-2">
              {validationErrors.challenges && (
                <div className="text-sm text-red-600">
                  {validationErrors.challenges.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleAddChallenge}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Challenge
              </button>
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="challenges" type="challenges">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {formData.progress.challenges.map((challenge, index) => (
                    <Draggable key={challenge.id} draggableId={challenge.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex flex-col gap-1 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={challenge.description}
                              onChange={(e) => handleChallengeChange(challenge.id, 'description', e.target.value)}
                              placeholder="What challenges are you facing?"
                              className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                                !challenge.description.trim() || challenge.description.length > 500
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                              }`}
                            />
                            <select
                              value={challenge.impact}
                              onChange={(e) => handleChallengeChange(challenge.id, 'impact', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="low">Low Impact</option>
                              <option value="medium">Medium Impact</option>
                              <option value="high">High Impact</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {renderCharacterCount(challenge.description, 500)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-500 bg-blue-900/30">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-500">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-800/50">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-gray-800/30 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">
              Question {currentQuestionIndex + 1} of {formData.questions.length}
            </span>
            {currentQuestion.required && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-900/30 text-red-400">
                Required
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-medium text-white">
            {currentQuestion.text}
          </h3>

          <div className="pt-4">
            {renderInput(currentQuestion)}
          </div>

          {validationErrors.questions && validationErrors.questions[currentQuestionIndex] && (
            <div className="text-sm text-red-400 mt-2">
              {validationErrors.questions[currentQuestionIndex]}
            </div>
          )}
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Visualization</h2>
        <ProgressCharts
          metrics={[formData.metrics]}
          progress={[formData.progress]}
          history={history}
        />
      </div>

      {/* Photo Upload Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Photos</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>
                  Drag and drop photos here, or click to select files
                  <br />
                  <span className="text-xs text-gray-500">
                    (Max file size: 5MB, Supported formats: JPEG, PNG, GIF)
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Preview Grid */}
        {formData.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white hover:text-red-500"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6">
        <button
          type="button"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentQuestionIndex === 0
              ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
              : 'bg-gray-800/50 text-white hover:bg-gray-700/50'
          }`}
        >
          Previous
        </button>

        {currentQuestionIndex === formData.questions.length - 1 ? (
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
          >
            Submit Check-in
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextQuestion}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
          >
            Next Question
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
        </button>
      </div>
    </form>
  );
}; 