'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormTemplate, Question } from '@/lib/types/forms';
import QuestionBuilder from '@/components/forms/QuestionBuilder';

export default function NewFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: false,
    weight: false
  });
  const [selectedCategories, setSelectedCategories] = useState({
    demographics: [],
    exercise: [],
    lifestyle: [],
    mindset: [],
    goals: [],
    other: []
  });
  const [otherCategories, setOtherCategories] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const totalSteps = 7;
  const steps = [
    'Demographics',
    'Exercise & Activity',
    'Lifestyle & Habits',
    'Mindset & Mental Health',
    'Goals & Aspirations',
    'Other Categories',
    'Additional Notes'
  ];

  const ageRanges = [
    'Under 18',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65+'
  ];

  const genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Other',
    'Prefer not to say'
  ];

  const activityCategories = [
    {
      id: 'currentActivity',
      label: 'Current Activity Level',
      tooltip: 'How active is the client in their daily life?',
      options: [
        'Sedentary (Office job, minimal movement)',
        'Lightly Active (Walking, standing job)',
        'Moderately Active (Regular exercise)',
        'Very Active (Daily intense exercise)',
        'Athlete (Multiple training sessions daily)'
      ]
    },
    {
      id: 'exerciseFreq',
      label: 'Exercise Frequency',
      tooltip: 'How often does the client currently exercise?',
      options: [
        'No regular exercise',
        '1-2 times per week',
        '3-4 times per week',
        '5+ times per week'
      ]
    },
    {
      id: 'exerciseTypes',
      label: 'Preferred Exercise Types',
      tooltip: 'What types of exercise does the client enjoy or want to try?',
      options: [
        'Weight Training',
        'Cardio',
        'HIIT',
        'Yoga/Pilates',
        'Sports',
        'Swimming',
        'Running',
        'Walking',
        'Other (specify in notes)'
      ]
    },
    {
      id: 'fitnessLevel',
      label: 'Fitness Level',
      tooltip: 'Current overall fitness level',
      options: [
        'Beginner (New to exercise)',
        'Intermediate (Some experience)',
        'Advanced (Regular exerciser)',
        'Elite (Competitive athlete)'
      ]
    },
    {
      id: 'limitations',
      label: 'Physical Limitations',
      tooltip: 'Any injuries or conditions that affect exercise?',
      showTextArea: true
    },
    {
      id: 'recovery',
      label: 'Recovery Habits',
      tooltip: 'How does the client currently recover from exercise?',
      options: [
        'Stretching',
        'Foam Rolling',
        'Massage',
        'Rest Days',
        'Active Recovery',
        'Other (specify in notes)'
      ]
    }
  ];

  const commonTemplates = [
    {
      id: 'weight-loss',
      name: 'Weight Loss Client',
      description: 'Track nutrition, exercise, measurements, and mindset',
      preSelectedCategories: ['weight', 'nutrition', 'exercise', 'measurements', 'mindset']
    },
    {
      id: 'muscle-gain',
      name: 'Muscle Building Client',
      description: 'Focus on strength training, nutrition, and recovery',
      preSelectedCategories: ['exercise', 'nutrition', 'recovery', 'measurements']
    },
    {
      id: 'general-health',
      name: 'General Health & Wellness',
      description: 'Balance of exercise, nutrition, and lifestyle habits',
      preSelectedCategories: ['lifestyle', 'exercise', 'nutrition', 'mindset']
    },
    {
      id: 'athlete',
      name: 'Athletic Performance',
      description: 'Performance metrics, training load, and recovery',
      preSelectedCategories: ['performance', 'exercise', 'recovery', 'nutrition']
    }
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCategoryChange = (section: string, category: string, checked: boolean) => {
    setSelectedCategories(prev => ({
      ...prev,
      [section]: checked 
        ? [...prev[section], category]
        : prev[section].filter(c => c !== category)
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = commonTemplates.find(t => t.id === templateId);
    if (template) {
      // Pre-select categories based on template
      setSelectedCategories(prev => ({
        ...prev,
        ...template.preSelectedCategories.reduce((acc, cat) => ({...acc, [cat]: true}), {})
      }));
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step}
            className={`flex-1 text-center ${
              currentStep > index + 1 ? 'text-indigo-400' :
              currentStep === index + 1 ? 'text-white' :
              'text-gray-500'
            }`}
          >
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-700 rounded-full">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Demographics</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Age Range Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Range
                </label>
                <select
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select age range</option>
                  {ageRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Gender Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Height Checkbox */}
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.checked)}
                  className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">Include Height Question</span>
              </label>

              {/* Weight Checkbox */}
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.checked)}
                  className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">Include Weight Question</span>
              </label>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Exercise & Activity</h3>
              <button 
                onClick={() => handleSelectAll('exercise')}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Select All
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Select the exercise and activity information you'd like to gather from your client. 
              This will help create personalized questions for their fitness assessment.
            </p>
            <div className="space-y-6">
              {activityCategories.map(category => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.exercise.includes(category.id)}
                        onChange={(e) => handleCategoryChange('exercise', category.id, e.target.checked)}
                        className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{category.label}</span>
                    </label>
                    <div className="group relative">
                      <button className="text-gray-500 hover:text-gray-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {category.tooltip}
                      </div>
                    </div>
                  </div>
                  {selectedCategories.exercise.includes(category.id) && category.options && (
                    <div className="ml-8 grid grid-cols-2 gap-2">
                      {category.options.map(option => (
                        <div key={option} className="text-sm text-gray-400">
                          • {option}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedCategories.exercise.includes(category.id) && category.showTextArea && (
                    <div className="ml-8">
                      <textarea 
                        placeholder="Enter any physical limitations or injuries..."
                        className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-white placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Lifestyle & Habits</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Sleep Patterns',
                'Nutrition Habits',
                'Stress Management',
                'Daily Routine',
                'Work Schedule',
                'Meal Planning',
                'Hydration Habits',
                'Supplement Usage',
                'Smoking Status',
                'Alcohol Consumption'
              ].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={selectedCategories.lifestyle.includes(category)}
                    onChange={(e) => handleCategoryChange('lifestyle', category, e.target.checked)}
                    className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Mindset & Mental Health</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Motivation Level',
                'Stress Levels',
                'Mental Barriers',
                'Self-Image',
                'Emotional Relationship with Food',
                'Past Success/Failures',
                'Support System',
                'Confidence Level',
                'Anxiety Management',
                'Work-Life Balance'
              ].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={selectedCategories.mindset.includes(category)}
                    onChange={(e) => handleCategoryChange('mindset', category, e.target.checked)}
                    className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Goals & Aspirations</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Weight Loss',
                'Muscle Gain',
                'Strength Improvement',
                'Endurance Building',
                'Body Composition',
                'Athletic Performance',
                'Health Improvement',
                'Lifestyle Change',
                'Specific Event Preparation',
                'Long-term Maintenance'
              ].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={selectedCategories.goals.includes(category)}
                    onChange={(e) => handleCategoryChange('goals', category, e.target.checked)}
                    className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Other Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Medical History',
                'Injury History',
                'Dietary Restrictions',
                'Allergies',
                'Medications',
                'Previous Coaching Experience',
                'Budget Constraints',
                'Time Availability'
              ].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={selectedCategories.other.includes(category)}
                    onChange={(e) => handleCategoryChange('other', category, e.target.checked)}
                    className="form-checkbox text-indigo-500 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">{category}</span>
                </label>
              ))}
              <div className="col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Categories
                </label>
                <input 
                  type="text"
                  value={otherCategories}
                  onChange={(e) => setOtherCategories(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
                  placeholder="Enter additional categories..."
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Additional Requirements</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes for the AI
              </label>
              <textarea 
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
                placeholder="Add any specific requirements, preferences, or additional context for the AI to consider when generating questions..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6">
          {currentStep === 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Start Templates</h2>
              <p className="text-gray-400 mb-6">
                Choose a template to quickly set up common client types, or start from scratch to customize everything.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {commonTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 hover:border-indigo-500/50'
                    }`}
                  >
                    <h3 className="text-white font-medium mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>
              <button
                onClick={() => setSelectedTemplate('')}
                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-700 hover:border-indigo-500/50 transition-all"
              >
                <h3 className="text-white font-medium">Start from Scratch</h3>
                <p className="text-sm text-gray-400">Customize everything for your specific needs</p>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Form Builder Wizard</h2>
              <p className="text-gray-400">Step {currentStep} of {totalSteps}</p>
            </div>
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Using template:</span>
                <span className="text-sm text-white">{commonTemplates.find(t => t.id === selectedTemplate)?.name}</span>
                <button
                  onClick={() => setSelectedTemplate('')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  (Change)
                </button>
              </div>
            )}
          </div>

          {renderProgressBar()}
          
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Back
            </button>
            <button
              onClick={currentStep === totalSteps ? () => {/* Handle form generation */} : handleNext}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              {currentStep === totalSteps ? 'Generate Form' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 