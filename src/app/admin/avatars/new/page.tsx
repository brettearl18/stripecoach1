'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ProgressSteps } from '@/components/avatars/ProgressSteps';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Checkbox } from '@/components/ui/checkbox';
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
  icon?: string;
}

const steps: FormStep[] = [
  {
    title: 'Basic Information',
    description: 'Enter the foundational details about your coaching business',
    icon: '👋'
  },
  {
    title: 'Mission & Values',
    description: 'Define your purpose and core values',
    icon: '🎯'
  },
  {
    title: 'Target Audience',
    description: 'Specify who you want to help and their needs',
    icon: '🎯'
  },
  {
    title: 'Coaching Approach',
    description: 'Define your coaching style and methodology',
    icon: '🚀'
  }
];

interface Question {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select';
  options?: string[];
  field: string;
  required?: boolean;
}

export default function NewAvatarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
    communicationStyle: '',
    approachTypes: [] as ApproachType[],
    personalityTraits: [] as PersonalityTrait[],
    communicationTone: '' as CommunicationTone,
    specialties: [] as string[],
    certifications: [] as string[],
    experience: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleArrayInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAIAvatar = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate avatar');
      }

      const data = await response.json();
      router.push('/admin/avatars');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (question: Question) => {
    const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2">
          <Label htmlFor={question.id} className="text-base font-semibold">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{question.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {children}
      </div>
    );

    switch (question.type) {
      case 'text':
        return (
          <FieldWrapper>
            <Input
              id={question.id}
              placeholder={question.placeholder}
              value={formData[question.field] || ''}
              onChange={(e) => handleInputChange(question.field, e.target.value)}
              className="w-full"
            />
          </FieldWrapper>
        );

      case 'textarea':
        return (
          <FieldWrapper>
            <Textarea
              id={question.id}
              placeholder={question.placeholder}
              value={formData[question.field] || ''}
              onChange={(e) => handleInputChange(question.field, e.target.value)}
              className="min-h-[100px]"
            />
          </FieldWrapper>
        );

      case 'checkbox':
        return (
          <FieldWrapper>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={formData[question.field].includes(option)}
                    onCheckedChange={() => handleArrayInputChange(question.field, option)}
                  />
                  <label
                    htmlFor={`${question.id}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </FieldWrapper>
        );

      default:
        return null;
    }
  };

  const getCurrentQuestions = () => {
    switch (currentStep) {
      case 0:
        return [
          {
            id: 'name',
            label: 'Avatar Name',
            description: 'Choose a memorable name for your coaching avatar',
            placeholder: 'e.g., Coach Sarah',
            type: 'text',
            field: 'name',
            required: true
          },
          {
            id: 'niches',
            label: 'Coaching Niches',
            description: 'Select the areas you specialize in',
            type: 'checkbox',
            options: BUSINESS_NICHES,
            field: 'niches',
            required: true
          },
          {
            id: 'gender',
            label: 'Target Gender',
            description: 'Select the gender(s) you primarily work with',
            type: 'checkbox',
            options: GENDER_OPTIONS,
            field: 'gender',
            required: true
          },
          {
            id: 'description',
            label: 'Brief Description',
            description: 'Describe your coaching avatar in a few sentences',
            placeholder: 'Tell us about your coaching approach and what makes you unique...',
            type: 'textarea',
            field: 'description',
            required: true
          }
        ];
      case 1:
        return [
          {
            id: 'missionStatement',
            label: 'Mission Statement',
            description: 'Define the purpose and impact of your coaching practice',
            placeholder: 'To empower individuals to...',
            type: 'textarea',
            field: 'missionStatement',
            required: true
          },
          {
            id: 'values',
            label: 'Core Values',
            description: 'Select the principles that guide your coaching practice',
            type: 'checkbox',
            options: ['Integrity', 'Growth', 'Empowerment', 'Innovation', 'Authenticity', 'Excellence', 'Compassion', 'Accountability'],
            field: 'values',
            required: true
          }
        ];
      case 2:
        return [
          {
            id: 'clientTypes',
            label: 'Target Client Types',
            description: 'Select the types of clients you work with',
            type: 'checkbox',
            options: CLIENT_TYPES,
            field: 'clientTypes',
            required: true
          },
          {
            id: 'painPoints',
            label: 'Client Pain Points',
            description: 'What challenges do your clients typically face?',
            type: 'checkbox',
            options: [
              'Lack of Direction',
              'Low Confidence',
              'Work-Life Balance',
              'Career Transition',
              'Relationship Issues',
              'Health & Wellness',
              'Personal Growth',
              'Leadership Skills',
              'Time Management',
              'Stress & Anxiety'
            ],
            field: 'painPoints',
            required: true
          },
          {
            id: 'demographics',
            label: 'Target Demographics',
            description: 'Describe your ideal client profile',
            placeholder: 'e.g., Professionals aged 30-50, entrepreneurs, working parents...',
            type: 'textarea',
            field: 'demographics',
            required: true
          }
        ];
      case 3:
        return [
          {
            id: 'approachTypes',
            label: 'Coaching Approach',
            description: 'Select your primary coaching methodologies',
            type: 'checkbox',
            options: APPROACH_TYPES,
            field: 'approachTypes',
            required: true
          },
          {
            id: 'personalityTraits',
            label: 'Personality Traits',
            description: 'Choose traits that define your coaching style',
            type: 'checkbox',
            options: PERSONALITY_TRAITS,
            field: 'personalityTraits',
            required: true
          },
          {
            id: 'communicationTone',
            label: 'Communication Style',
            description: 'How do you prefer to communicate with clients?',
            type: 'checkbox',
            options: COMMUNICATION_TONES,
            field: 'communicationTone',
            required: true
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-base">
            {steps[currentStep].description}
          </CardDescription>
          <div className="pt-6">
            <ProgressSteps
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {getCurrentQuestions().map((question) => renderField(question))}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={generateAIAvatar}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Generating...' : 'Generate Avatar'}
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}