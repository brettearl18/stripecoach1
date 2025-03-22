'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ProgressSteps } from '@/components/avatars/ProgressSteps';
import {
  BUSINESS_NICHES,
  CLIENT_TYPES,
  APPROACH_TYPES,
  COACHING_STYLES,
  PERSONALITY_TRAITS,
  COMMUNICATION_TONES,
  GENDER_OPTIONS,
  type BusinessNiche,
  type ClientType,
  type ApproachType,
  type CoachingStyle,
  type PersonalityTrait,
  type CommunicationTone,
  type Gender
} from '@/lib/types/avatar';

interface FormStep {
  title: string;
  description: string;
}

const steps: FormStep[] = [
  {
    title: 'Basic Information',
    description: 'Enter the foundational details about your coaching business'
  },
  {
    title: 'Mission & Values',
    description: 'Define your purpose and core values'
  },
  {
    title: 'Target Audience',
    description: 'Specify who you want to help and their needs'
  },
  {
    title: 'Coaching Approach',
    description: 'Define your coaching style and methodology'
  }
];

interface Question {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select';
  options?: string[];
  field: string;
}

const questions: Record<number, Question[]> = {
  0: [
    {
      id: 'name',
      label: 'Business Name',
      placeholder: 'Enter your coaching business name',
      type: 'text',
      field: 'name'
    },
    {
      id: 'niches',
      label: 'Coaching Niches',
      type: 'checkbox',
      options: BUSINESS_NICHES,
      field: 'niches'
    },
    {
      id: 'gender',
      label: 'Target Gender',
      type: 'checkbox',
      options: GENDER_OPTIONS,
      field: 'gender'
    },
    {
      id: 'description',
      label: 'Business Description',
      placeholder: 'Describe your coaching business and its unique value proposition',
      type: 'textarea',
      field: 'description'
    }
  ],
  1: [
    {
      id: 'missionStatement',
      label: 'Mission Statement',
      placeholder: "What is your coaching business's mission and purpose?",
      type: 'textarea',
      field: 'missionStatement'
    },
    {
      id: 'values',
      label: 'Core Values',
      placeholder: 'Enter values separated by commas (e.g., Integrity, Excellence, Growth)',
      type: 'text',
      field: 'values'
    }
  ],
  2: [
    {
      id: 'clientTypes',
      label: 'Target Client Types',
      type: 'checkbox',
      options: CLIENT_TYPES,
      field: 'clientTypes'
    },
    {
      id: 'painPoints',
      label: 'Client Pain Points',
      placeholder: 'Enter pain points separated by commas',
      type: 'text',
      field: 'painPoints'
    },
    {
      id: 'demographics',
      label: 'Target Demographics',
      placeholder: 'Describe your ideal client demographics',
      type: 'text',
      field: 'demographics'
    },
    {
      id: 'goals',
      label: 'Client Goals',
      placeholder: 'Enter client goals separated by commas',
      type: 'text',
      field: 'goals'
    }
  ],
  3: [
    {
      id: 'communicationStyle',
      label: 'Communication Style',
      type: 'select',
      options: COACHING_STYLES,
      field: 'communicationStyle'
    },
    {
      id: 'approachTypes',
      label: 'Coaching Approach',
      type: 'checkbox',
      options: APPROACH_TYPES,
      field: 'approachTypes'
    }
  ]
};

export default function NewAvatarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    niches: [] as BusinessNiche[],
    gender: [] as Gender[],
    description: '',
    missionStatement: '',
    values: [] as string[],
    clientTypes: [] as ClientType[],
    painPoints: [] as string[],
    demographics: '',
    goals: [] as string[],
    communicationStyle: '' as CoachingStyle,
    approachTypes: [] as ApproachType[],
    personalityTraits: [] as PersonalityTrait[],
    communicationTone: '' as CommunicationTone,
    specialties: [] as string[],
    certifications: [] as string[],
    experience: ''
  });

  const currentQuestions = questions[currentStep] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...currentValues, value] };
    });
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setCurrentQuestionIndex(questions[currentStep - 1].length - 1);
    }
  };

  const generateAIAvatar = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      router.push(`/admin/avatars/${data.id}`);
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={Array.isArray(formData[question.field]) ? formData[question.field].join(', ') : formData[question.field]}
            onChange={(e) => Array.isArray(formData[question.field]) 
              ? handleArrayInputChange(question.field, e.target.value)
              : handleInputChange(question.field, e.target.value)
            }
            placeholder={question.placeholder}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={formData[question.field]}
            onChange={(e) => handleInputChange(question.field, e.target.value)}
            placeholder={question.placeholder}
            className="h-32 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${question.id}-${option}`}
                  checked={formData[question.field].includes(option)}
                  onChange={() => handleMultiSelect(question.field, option)}
                  className="mr-2 bg-gray-800 border-gray-700"
                />
                <Label htmlFor={`${question.id}-${option}`} className="text-gray-300">{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <Select
            value={formData[question.field]}
            onValueChange={(value) => handleInputChange(question.field, value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder={`Select your ${question.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Create New Avatar</CardTitle>
          <CardDescription className="text-gray-400">Set up your AI coaching avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <ProgressSteps steps={steps} currentStep={currentStep} />
          </div>
          <div className="space-y-6">
            <div className="min-h-[300px] flex flex-col">
              <Label htmlFor={currentQuestion?.id} className="text-gray-200 text-lg mb-4">
                {currentQuestion?.label}
              </Label>
              {currentQuestion && renderQuestion(currentQuestion)}
            </div>
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 && isFirstQuestion}
                className="text-gray-300 border-gray-700 hover:bg-gray-800"
              >
                Back
              </Button>
              <div className="text-gray-400">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </div>
              <Button
                onClick={currentStep === steps.length - 1 && isLastQuestion ? generateAIAvatar : handleNext}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === steps.length - 1 && isLastQuestion ? (
                  isGenerating ? 'Generating...' : 'Generate Avatar'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}