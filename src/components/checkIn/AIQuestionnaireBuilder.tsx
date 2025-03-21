'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface AIQuestionnaireBuilderProps {
  onQuestionsGenerated: (questions: any[]) => void;
}

export function AIQuestionnaireBuilder({ onQuestionsGenerated }: AIQuestionnaireBuilderProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    goals: '',
    fitnessLevel: '',
    limitations: '',
    trackingPreference: '',
    focusAreas: ''
  });

  const questions = [
    {
      id: 'goals',
      question: "What are the primary goals for this client?",
      placeholder: "E.g., weight loss, muscle gain, improved endurance...",
      help: "Understanding their goals helps create relevant progress tracking questions"
    },
    {
      id: 'fitnessLevel',
      question: "What is their current fitness level?",
      placeholder: "E.g., beginner, intermediate, experienced...",
      help: "This helps adjust the complexity and scope of questions"
    },
    {
      id: 'limitations',
      question: "Are there any health conditions or limitations to consider?",
      placeholder: "E.g., injuries, medical conditions, time constraints...",
      help: "Ensures questions are appropriate and safe"
    },
    {
      id: 'trackingPreference',
      question: "What metrics are most important to track for this client?",
      placeholder: "E.g., weight, measurements, energy levels, sleep quality...",
      help: "Determines the types of questions and data to collect"
    },
    {
      id: 'focusAreas',
      question: "What specific areas should the check-in focus on?",
      placeholder: "E.g., nutrition habits, workout adherence, recovery...",
      help: "Helps prioritize question categories"
    }
  ];

  const handleInputChange = (id: string, value: string) => {
    setClientInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: Integrate with OpenAI to generate questions
      // For now, we'll simulate the generation
      setTimeout(() => {
        const sampleQuestions = [
          {
            type: 'scale',
            text: 'How would you rate your energy levels today? (1-10)',
            required: true
          },
          {
            type: 'text',
            text: 'What challenges did you face with your nutrition this week?',
            required: true
          },
          {
            type: 'number',
            text: 'How many hours of sleep did you get on average?',
            required: true
          },
          // Add more sample questions based on the client info
        ];
        onQuestionsGenerated(sampleQuestions);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating questions:', error);
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-800">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI Question Generator</h2>
          <div className="text-sm text-gray-400">Step {step} of {questions.length}</div>
        </div>

        <div className="space-y-8">
          {questions.map((q, index) => (
            <div 
              key={q.id}
              className={`space-y-4 transition-opacity duration-300 ${
                index + 1 === step ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  {q.question}
                  <span className="text-xs text-gray-400">{index + 1}/{questions.length}</span>
                </label>
                <Textarea
                  placeholder={q.placeholder}
                  value={clientInfo[q.id as keyof typeof clientInfo]}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  className="h-24"
                  disabled={index + 1 !== step}
                />
                <p className="text-xs text-gray-400">{q.help}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < questions.length ? (
            <Button
              onClick={() => setStep(prev => Math.min(questions.length, prev + 1))}
              disabled={!clientInfo[questions[step - 1].id as keyof typeof clientInfo]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !Object.values(clientInfo).every(Boolean)}
            >
              {isGenerating ? 'Generating...' : 'Generate Questions'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 