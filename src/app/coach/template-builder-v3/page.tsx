'use client';

import * as React from "react";
import { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Save, Copy, MoreVertical, X, Camera, Ruler, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
interface Template {
  id: string;
  type: 'standard' | 'progress_photos' | 'measurements';
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'custom';
  scheduleConfig: {
    frequency: 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'custom';
    openWindow: {
      type: 'specific_day' | 'nth_day' | 'last_day';
      day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      nthDay?: number; // For monthly: 1st, 2nd, etc.
      time: string; // HH:mm format
    };
    closeWindow: {
      type: 'specific_day' | 'after_hours';
      day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      time: string; // HH:mm format
      hoursAfterOpen?: number;
    };
    customConfig?: {
      value: number;
      unit: 'days' | 'weeks' | 'months';
      startDay?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    };
  };
  categories: string[];
  sections: Section[];
  photoRequirements?: PhotoRequirement[];
  measurementPoints?: MeasurementPoint[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  type: string;
  question: string;
  required: boolean;
  weight?: number;  // Importance factor (1-10)
  yesImpact?: 'positive' | 'negative' | 'neutral';  // For yes/no questions
  options?: string[];  // For multiple choice
  allowMultiple?: boolean;  // For multiple choice - allow multiple selections
  description?: string;  // Helper text/description for the question
}

interface PhotoRequirement {
  id: string;
  type: 'front' | 'side' | 'back' | 'custom';
  required: boolean;
  instructions: string;
  customLabel?: string;
}

interface MeasurementPoint {
  id: string;
  name: string;
  type: 'weight' | 'circumference' | 'skinfold';
  required: boolean;
  unit: 'kg' | 'lbs' | 'cm' | 'inches' | 'mm';
  instructions?: string;
  targetValue?: number;
}

export default function TemplateBuilderV3() {
  const [template, setTemplate] = useState<Template>({
    id: crypto.randomUUID(),
    type: 'standard',
    title: '',
    description: '',
    frequency: 'weekly',
    scheduleConfig: {
      frequency: 'weekly',
      openWindow: {
        type: 'specific_day',
        day: 'monday',
        time: '09:00'
      },
      closeWindow: {
        type: 'specific_day',
        day: 'tuesday',
        time: '17:00'
      }
    },
    categories: [],
    sections: [],
    photoRequirements: [],
    measurementPoints: []
  });

  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'content' | 'preview'>('type');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionId: string;
    questionId: string | null;
  } | null>(null);

  const [formErrors, setFormErrors] = useState<{
    frequency?: string;
    openWindow?: string;
    closeWindow?: string;
  }>({});

  const templateTypes = [
    {
      id: 'standard',
      title: 'Standard Check-in',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Create a customizable check-in form with various question types',
      features: ['Multiple question types', 'Customizable sections', 'Scoring options', 'Progress tracking']
    },
    {
      id: 'progress_photos',
      title: 'Progress Photos',
      icon: <Camera className="w-6 h-6" />,
      description: 'Design a template for collecting and tracking progress photos',
      features: ['Front/back/side views', 'Custom angles', 'Pose instructions', 'Comparison tools']
    },
    {
      id: 'measurements',
      title: 'Measurements',
      icon: <Ruler className="w-6 h-6" />,
      description: 'Build a template for tracking body measurements and metrics',
      features: ['Key body measurements', 'Custom measurement points', 'Unit conversion', 'Progress graphs']
    }
  ];

  const questionTypes = [
    { 
      id: 'yesNo', 
      label: 'Yes/No', 
      icon: '✓',
      hasWeight: true,
      hasImpact: true 
    },
    { 
      id: 'scale', 
      label: 'Scale (1-10)', 
      icon: '◉',
      hasWeight: true,
      hasImpact: false
    },
    { 
      id: 'multipleChoice', 
      label: 'Multiple Choice', 
      icon: '☐',
      hasWeight: true,
      hasImpact: false,
      hasOptions: true
    },
    { 
      id: 'text', 
      label: 'Text Response', 
      icon: '✎',
      hasWeight: false,
      hasImpact: false
    }
  ];

  const commonSchedulePresets = [
    {
      name: 'Weekly Monday Check-in',
      config: {
        frequency: 'weekly',
        openWindow: { type: 'specific_day', day: 'monday', time: '09:00' },
        closeWindow: { type: 'after_hours', time: '17:00', hoursAfterOpen: 24 }
      }
    },
    {
      name: 'Bi-weekly Progress Update',
      config: {
        frequency: 'fortnightly',
        openWindow: { type: 'specific_day', day: 'monday', time: '09:00' },
        closeWindow: { type: 'after_hours', time: '17:00', hoursAfterOpen: 48 }
      }
    },
    {
      name: 'Monthly Review',
      config: {
        frequency: 'monthly',
        openWindow: { type: 'nth_day', nthDay: 1, time: '09:00' },
        closeWindow: { type: 'after_hours', time: '17:00', hoursAfterOpen: 72 }
      }
    }
  ];

  const questionTemplates = {
    wellness: [
      { type: 'scale', question: 'How would you rate your energy levels today?', required: true },
      { type: 'scale', question: 'How would you rate your sleep quality?', required: true },
      { type: 'text', question: 'What are your main stress factors this week?', required: false },
      { type: 'yesNo', question: 'Did you follow your meal plan?', required: true }
    ],
    workout: [
      { type: 'number', question: 'How many workouts did you complete this week?', required: true },
      { type: 'scale', question: 'Rate your workout intensity', required: true },
      { type: 'text', question: 'Any injuries or physical concerns?', required: false }
    ],
    nutrition: [
      { type: 'yesNo', question: 'Did you track your meals?', required: true },
      { type: 'scale', question: 'Rate your adherence to the meal plan', required: true },
      { type: 'text', question: 'What nutrition challenges did you face?', required: false }
    ]
  };

  const handleTemplateTypeSelect = (type: Template['type']) => {
    setTemplate(prev => ({ ...prev, type }));
    setCurrentStep('details');
  };

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add mock suggestions based on template type
    const suggestions = {
      standard: [
        {
          title: 'Weekly Progress',
          questions: [
            { type: 'scale', question: 'How would you rate your overall progress this week?', required: true },
            { type: 'text', question: 'What challenges did you face this week?', required: true },
            { type: 'multipleChoice', question: 'Which areas need more focus?', required: true }
          ]
        }
      ],
      progress_photos: [
        { type: 'front', required: true, instructions: 'Stand straight, feet shoulder-width apart' },
        { type: 'side', required: true, instructions: 'Arms at sides, natural posture' },
        { type: 'back', required: true, instructions: 'Stand straight, arms slightly away from body' }
      ],
      measurements: [
        { name: 'Weight', type: 'weight', required: true, unit: 'kg' },
        { name: 'Waist', type: 'circumference', required: true, unit: 'cm' },
        { name: 'Body Fat', type: 'skinfold', required: false, unit: 'mm' }
      ]
    };

    setTemplate(prev => {
      if (prev.type === 'standard') {
        return {
          ...prev,
          sections: [...prev.sections, ...suggestions.standard]
        };
      } else if (prev.type === 'progress_photos') {
        return {
          ...prev,
          photoRequirements: suggestions.progress_photos
        };
      } else {
        return {
          ...prev,
          measurementPoints: suggestions.measurements
        };
      }
    });

    setIsGenerating(false);
  };

  const handleDetailsSubmit = (details: Pick<Template, 'title' | 'description' | 'frequency' | 'scheduleConfig' | 'categories'>) => {
    setTemplate(prev => ({
      ...prev,
      ...details
    }));
    setCurrentStep('content');
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      description: '',
      questions: []
    };
    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newSection.id);
  };

  const addQuestion = (sectionId: string, type: string) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      question: '',
      required: false,
      weight: 5,
      yesImpact: 'neutral',
      options: type === 'multipleChoice' ? [''] : undefined,
      allowMultiple: false,
      description: ''
    };

    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }));

    setEditingQuestion({ sectionId, questionId: newQuestion.id });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId
                  ? { ...question, ...updates }
                  : question
              )
            }
          : section
      )
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    }));
  };

  const validateScheduleConfig = (config: Template['scheduleConfig']) => {
    const errors: typeof formErrors = {};
    
    if (!config.frequency) {
      errors.frequency = 'Please select a frequency';
    }

    if (config.frequency !== 'daily') {
      if (!config.openWindow.day && config.openWindow.type === 'specific_day') {
        errors.openWindow = 'Please select an opening day';
      }
      if (!config.openWindow.time) {
        errors.openWindow = 'Please select an opening time';
      }
      if (config.closeWindow.type === 'specific_day' && !config.closeWindow.day) {
        errors.closeWindow = 'Please select a closing day';
      }
      if (!config.closeWindow.time && config.closeWindow.type === 'specific_day') {
        errors.closeWindow = 'Please select a closing time';
      }
    }

    return errors;
  };

  const handleFrequencyChange = (newFreq: Template['frequency']) => {
    try {
      console.log('Changing frequency to:', newFreq);
      
      // Clear any previous errors
      setFormErrors({});

      const updatedTemplate = {
        ...template,
        frequency: newFreq,
        scheduleConfig: {
          ...template.scheduleConfig,
          frequency: newFreq,
          customConfig: newFreq === 'custom' 
            ? { value: 1, unit: 'days', startDay: 'monday' }
            : undefined,
          openWindow: {
            ...template.scheduleConfig.openWindow,
            type: newFreq === 'monthly' ? 'nth_day' : 'specific_day',
            day: 'monday',
            time: '09:00'
          },
          closeWindow: {
            ...template.scheduleConfig.closeWindow,
            type: 'specific_day',
            day: 'tuesday',
            time: '17:00'
          }
        }
      };

      // Validate the updated config
      const errors = validateScheduleConfig(updatedTemplate.scheduleConfig);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setTemplate(updatedTemplate);
    } catch (error) {
      console.error('Error changing frequency:', error);
      setFormErrors({ frequency: 'Failed to update frequency. Please try again.' });
    }
  };

  const renderTemplateTypeSelection = React.useCallback(() => {
    return (
      <div className="space-y-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templateTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleTemplateTypeSelect(type.id as Template['type'])}
              className="flex flex-col items-start p-6 bg-card border border-border rounded-xl hover:border-primary transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                {type.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 text-left">{type.description}</p>
              <div className="w-full border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
                <ul className="text-sm space-y-1">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Need help choosing?</p>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View template examples
            </button>
          </div>
        </div>
      </div>
    );
  }, [handleTemplateTypeSelect]);

  const renderFrequencySelection = React.useCallback(() => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const frequencies = ['daily', 'weekly', 'fortnightly', 'monthly', 'custom'] as const;

    return (
      <div className="space-y-6">
        {/* Quick Schedule Presets */}
        <div className="p-6 bg-muted/30 rounded-lg border border-border">
          <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {commonSchedulePresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setTemplate(prev => ({
                    ...prev,
                    frequency: preset.config.frequency,
                    scheduleConfig: preset.config
                  }));
                }}
                className="p-4 text-left bg-card border border-border rounded-lg hover:border-primary transition-all"
              >
                <h5 className="font-medium mb-1">{preset.name}</h5>
                <p className="text-xs text-muted-foreground">
                  Opens: {preset.config.openWindow.day || `${preset.config.openWindow.nthDay}st`} at {preset.config.openWindow.time}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Schedule Configuration */}
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Custom Schedule</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Frequency
                {formErrors.frequency && (
                  <span className="text-red-500 ml-2 text-xs">{formErrors.frequency}</span>
                )}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {frequencies.map((freq) => {
                  const isSelected = template.frequency === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => handleFrequencyChange(freq)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all relative",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border hover:border-primary/50 text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      )}
                    >
                      <span className="capitalize">
                        {freq}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {template.frequency !== 'daily' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Opens
                    {formErrors.openWindow && (
                      <span className="text-red-500 ml-2 text-xs">{formErrors.openWindow}</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.frequency === 'monthly' ? (
                      <div className="flex space-x-3">
                        <select
                          value={template.scheduleConfig.openWindow.nthDay || 1}
                          onChange={(e) => {
                            try {
                              setFormErrors(prev => ({ ...prev, openWindow: undefined }));
                              setTemplate(prev => ({
                                ...prev,
                                scheduleConfig: {
                                  ...prev.scheduleConfig,
                                  openWindow: {
                                    ...prev.scheduleConfig.openWindow,
                                    type: 'nth_day',
                                    nthDay: parseInt(e.target.value)
                                  }
                                }
                              }));
                            } catch (error) {
                              console.error('Error updating opening day:', error);
                              setFormErrors(prev => ({ 
                                ...prev, 
                                openWindow: 'Failed to update opening day. Please try again.' 
                              }));
                            }
                          }}
                          className={cn(
                            "flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            formErrors.openWindow ? "border-red-500" : "border-input"
                          )}
                        >
                          {[1,2,3,4].map(n => (
                            <option key={n} value={n}>{n}st/nd/rd/th</option>
                          ))}
                          <option value={-1}>Last</option>
                        </select>
                      </div>
                    ) : (
                      <select
                        value={template.scheduleConfig.openWindow.day || 'monday'}
                        onChange={(e) => {
                          try {
                            setFormErrors(prev => ({ ...prev, openWindow: undefined }));
                            setTemplate(prev => ({
                              ...prev,
                              scheduleConfig: {
                                ...prev.scheduleConfig,
                                openWindow: {
                                  ...prev.scheduleConfig.openWindow,
                                  type: 'specific_day',
                                  day: e.target.value as any
                                }
                              }
                            }));
                          } catch (error) {
                            console.error('Error updating opening day:', error);
                            setFormErrors(prev => ({ 
                              ...prev, 
                              openWindow: 'Failed to update opening day. Please try again.' 
                            }));
                          }
                        }}
                        className={cn(
                          "rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          formErrors.openWindow ? "border-red-500" : "border-input"
                        )}
                      >
                        {days.map(day => (
                          <option key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="time"
                      value={template.scheduleConfig.openWindow.time}
                      onChange={(e) => {
                        try {
                          setFormErrors(prev => ({ ...prev, openWindow: undefined }));
                          setTemplate(prev => ({
                            ...prev,
                            scheduleConfig: {
                              ...prev.scheduleConfig,
                              openWindow: {
                                ...prev.scheduleConfig.openWindow,
                                time: e.target.value
                              }
                            }
                          }));
                        } catch (error) {
                          console.error('Error updating opening time:', error);
                          setFormErrors(prev => ({ 
                            ...prev, 
                            openWindow: 'Failed to update opening time. Please try again.' 
                          }));
                        }
                      }}
                      className={cn(
                        "rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        formErrors.openWindow ? "border-red-500" : "border-input"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Closes
                    {formErrors.closeWindow && (
                      <span className="text-red-500 ml-2 text-xs">{formErrors.closeWindow}</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <select
                        value={template.scheduleConfig.closeWindow.type}
                        onChange={(e) => {
                          try {
                            setFormErrors(prev => ({ ...prev, closeWindow: undefined }));
                            setTemplate(prev => ({
                              ...prev,
                              scheduleConfig: {
                                ...prev.scheduleConfig,
                                closeWindow: {
                                  ...prev.scheduleConfig.closeWindow,
                                  type: e.target.value as any
                                }
                              }
                            }));
                          } catch (error) {
                            console.error('Error updating closing window type:', error);
                            setFormErrors(prev => ({ 
                              ...prev, 
                              closeWindow: 'Failed to update closing window type. Please try again.' 
                            }));
                          }
                        }}
                        className={cn(
                          "w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          formErrors.closeWindow ? "border-red-500" : "border-input"
                        )}
                      >
                        <option value="specific_day">Specific Day & Time</option>
                        <option value="after_hours">Hours After Opening</option>
                      </select>
                    </div>

                    {template.scheduleConfig.closeWindow.type === 'specific_day' ? (
                      <input
                        type="time"
                        value={template.scheduleConfig.closeWindow.time}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          scheduleConfig: {
                            ...prev.scheduleConfig,
                            closeWindow: {
                              ...prev.scheduleConfig.closeWindow,
                              time: e.target.value
                            }
                          }
                        }))}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="72"
                          value={template.scheduleConfig.closeWindow.hoursAfterOpen || 24}
                          onChange={(e) => setTemplate(prev => ({
                            ...prev,
                            scheduleConfig: {
                              ...prev.scheduleConfig,
                              closeWindow: {
                                ...prev.scheduleConfig.closeWindow,
                                hoursAfterOpen: parseInt(e.target.value)
                              }
                            }
                          }))}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">hours after opening</span>
                      </div>
                    )}
                  </div>
                  {template.scheduleConfig.closeWindow.type === 'specific_day' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Note: The closing time can be on a different day than the opening time, allowing for multi-day windows.
                    </p>
                  )}
                </div>
              </div>
            )}

            {template.frequency === 'custom' && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="text-sm font-medium mb-3">Custom Frequency Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Repeat every</label>
                    <input
                      type="number"
                      min="1"
                      value={template.scheduleConfig.customConfig?.value || 1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          setTemplate(prev => ({
                            ...prev,
                            scheduleConfig: {
                              ...prev.scheduleConfig,
                              customConfig: {
                                ...prev.scheduleConfig.customConfig!,
                                value
                              }
                            }
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Unit</label>
                    <select
                      value={template.scheduleConfig.customConfig?.unit || 'days'}
                      onChange={(e) => {
                        setTemplate(prev => ({
                          ...prev,
                          scheduleConfig: {
                            ...prev.scheduleConfig,
                            customConfig: {
                              ...prev.scheduleConfig.customConfig!,
                              unit: e.target.value as 'days' | 'weeks' | 'months'
                            }
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm mb-1">Start on</label>
                  <select
                    value={template.scheduleConfig.customConfig?.startDay || 'monday'}
                    onChange={(e) => {
                      setTemplate(prev => ({
                        ...prev,
                        scheduleConfig: {
                          ...prev.scheduleConfig,
                          customConfig: {
                            ...prev.scheduleConfig.customConfig!,
                            startDay: e.target.value
                          }
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [template.frequency, template.scheduleConfig, formErrors, handleFrequencyChange]);

  const renderTemplateDetails = React.useCallback(() => {
    if (!template) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentStep('type')}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Template Details</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-6 p-6 bg-card rounded-lg border border-border shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Enter template name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                rows={3}
                placeholder="Enter template description..."
              />
            </div>
          </div>

          {renderFrequencySelection()}

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep('content')}
              disabled={!template.title}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Add Content
            </button>
          </div>
        </div>
      </div>
    );
  }, [template.title, template.description, setCurrentStep]);

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    const questionType = questionTypes.find(t => t.id === question.type);

    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded">
                {questionType?.icon}
              </span>
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(sectionId, question.id, { question: e.target.value })}
                placeholder="Enter your question"
                className="flex-1 bg-transparent border-none text-base focus:outline-none focus:ring-0"
              />
            </div>
            
            <input
              type="text"
              value={question.description || ''}
              onChange={(e) => updateQuestion(sectionId, question.id, { description: e.target.value })}
              placeholder="Add helper text (optional)"
              className="w-full px-3 py-1.5 text-sm bg-background/50 border border-input rounded-md"
            />

            {questionType?.hasWeight && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Importance:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={question.weight || 5}
                  onChange={(e) => updateQuestion(sectionId, question.id, { weight: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-medium">{question.weight || 5}</span>
              </div>
            )}

            {questionType?.hasImpact && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Yes Impact:</label>
                <select
                  value={question.yesImpact || 'neutral'}
                  onChange={(e) => updateQuestion(sectionId, question.id, { yesImpact: e.target.value as 'positive' | 'negative' | 'neutral' })}
                  className="px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            )}

            {questionType?.hasOptions && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Options:</label>
                <div className="space-y-2">
                  {(question.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[index] = e.target.value;
                          updateQuestion(sectionId, question.id, { options: newOptions });
                        }}
                        className="flex-1 px-3 py-1.5 bg-background border border-input rounded-md text-sm"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(index, 1);
                          updateQuestion(sectionId, question.id, { options: newOptions });
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(question.options || []), ''];
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`allow-multiple-${question.id}`}
                    checked={question.allowMultiple}
                    onChange={(e) => updateQuestion(sectionId, question.id, { allowMultiple: e.target.checked })}
                    className="rounded border-input"
                  />
                  <label htmlFor={`allow-multiple-${question.id}`} className="text-sm">
                    Allow multiple selections
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
              className="rounded border-input"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm">Required</label>
            
            <button
              onClick={() => deleteQuestion(sectionId, question.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStandardBuilder = () => (
    <div className="space-y-6">
      {/* Quick Templates Section */}
      <div className="p-6 bg-muted/30 rounded-lg border border-border mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Question Templates</h3>
          <button
            onClick={generateAISuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Suggestions</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(questionTemplates).map(([category, questions]) => (
            <div key={category} className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium capitalize mb-2">{category}</h4>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (template.sections.length === 0) {
                        // Create a new section if none exists
                        const newSection: Section = {
                          id: crypto.randomUUID(),
                          title: `${category.charAt(0).toUpperCase()}${category.slice(1)} Check-in`,
                          description: '',
                          questions: []
                        };
                        setTemplate(prev => ({
                          ...prev,
                          sections: [...prev.sections, { ...newSection, questions: [{ ...q, id: crypto.randomUUID() }] }]
                        }));
                      } else {
                        // Add to the active section or last section
                        const targetSectionId = activeSection || template.sections[template.sections.length - 1].id;
                        setTemplate(prev => ({
                          ...prev,
                          sections: prev.sections.map(section =>
                            section.id === targetSectionId
                              ? { ...section, questions: [...section.questions, { ...q, id: crypto.randomUUID() }] }
                              : section
                          )
                        }));
                      }
                    }}
                    className="w-full text-left p-2 hover:bg-muted rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="w-4 h-4 flex items-center justify-center bg-primary/10 text-primary rounded">
                      {questionTypes.find(t => t.id === q.type)?.icon}
                    </span>
                    <span className="truncate">{q.question}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {template.sections.map((section) => (
        <motion.div
          key={section.id}
          layout
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setTemplate(prev => ({
                      ...prev,
                      sections: prev.sections.map(s =>
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      )
                    }));
                  }}
                  className="text-xl font-semibold bg-transparent border-none p-0 focus:outline-none"
                  placeholder="Section Title"
                />
                <input
                  type="text"
                  value={section.description}
                  onChange={(e) => {
                    setTemplate(prev => ({
                      ...prev,
                      sections: prev.sections.map(s =>
                        s.id === section.id ? { ...s, description: e.target.value } : s
                      )
                    }));
                  }}
                  className="text-sm text-gray-400 bg-transparent border-none p-0 mt-1 focus:outline-none w-full"
                  placeholder="Add a description..."
                />
              </div>
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {section.questions.map((question) => (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 last:mb-0"
                >
                  <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-700 rounded">
                          {questionTypes.find(t => t.id === question.type)?.label}
                        </span>
                        {question.required && (
                          <span className="text-xs text-red-400">Required</span>
                        )}
                      </div>
                      <div className="font-medium">{question.question || 'Untitled Question'}</div>
                      {question.helpText && (
                        <div className="text-sm text-gray-400 mt-1">{question.helpText}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingQuestion({
                          sectionId: section.id,
                          questionId: question.id
                        })}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(section.id, question.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingQuestion?.sectionId === section.id && 
                   editingQuestion?.questionId === question.id && 
                   renderQuestionEditor(question, section.id)}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addQuestion(section.id, type.id as string)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <span className="w-5 h-5 flex items-center justify-center bg-gray-600 rounded">
                      {type.icon}
                    </span>
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <button
        onClick={addSection}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Section
      </button>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentStep('details')}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep('preview')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <span>Preview</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderProgressPhotoBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photo Requirements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure the required photos and instructions for clients</p>
        </div>
        <button
          onClick={generateAISuggestions}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Requirements</span>
            </>
          )}
        </button>
      </div>

      {/* Photo Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {template.photoRequirements?.map((photo) => (
          <div key={photo.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{photo.type === 'custom' ? photo.customLabel : `${photo.type.charAt(0).toUpperCase()}${photo.type.slice(1)} View`}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {photo.instructions || 'No instructions provided'}
                </p>
              </div>
              <button
                onClick={() => {
                  setTemplate(prev => ({
                    ...prev,
                    photoRequirements: prev.photoRequirements?.filter(p => p.id !== photo.id)
                  }));
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${photo.id}`}
                  checked={photo.required}
                  onChange={(e) => {
                    setTemplate(prev => ({
                      ...prev,
                      photoRequirements: prev.photoRequirements?.map(p =>
                        p.id === photo.id ? { ...p, required: e.target.checked } : p
                      )
                    }));
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`required-${photo.id}`} className="text-sm">Required</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  value={photo.instructions}
                  onChange={(e) => {
                    setTemplate(prev => ({
                      ...prev,
                      photoRequirements: prev.photoRequirements?.map(p =>
                        p.id === photo.id ? { ...p, instructions: e.target.value } : p
                      )
                    }));
                  }}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter instructions for this photo..."
                />
              </div>

              {photo.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Label</label>
                  <input
                    type="text"
                    value={photo.customLabel}
                    onChange={(e) => {
                      setTemplate(prev => ({
                        ...prev,
                        photoRequirements: prev.photoRequirements?.map(p =>
                          p.id === photo.id ? { ...p, customLabel: e.target.value } : p
                        )
                      }));
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter custom label..."
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Type Button */}
      <button
        onClick={() => {
          const newPhoto: PhotoRequirement = {
            id: crypto.randomUUID(),
            type: 'custom',
            required: false,
            instructions: '',
            customLabel: 'New Photo Type'
          };
          setTemplate(prev => ({
            ...prev,
            photoRequirements: [...(prev.photoRequirements || []), newPhoto]
          }));
        }}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Photo Type
      </button>

      {/* Preview Section */}
      <div className="bg-card border border-border rounded-xl p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Client Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {template.photoRequirements?.map((photo) => (
            <div key={photo.id} className="relative aspect-square bg-background rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Camera className="w-8 h-8 mb-4 text-gray-400" />
                <h4 className="font-medium mb-2">
                  {photo.type === 'custom' ? photo.customLabel : `${photo.type.charAt(0).toUpperCase()}${photo.type.slice(1)} View`}
                </h4>
                <p className="text-sm text-gray-500">{photo.instructions}</p>
                {photo.required && (
                  <span className="absolute top-2 right-2 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={() => setCurrentStep('details')}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep('preview')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <span>Preview</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderPreview = () => {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep('content')}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Preview Template</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {/* Toggle preview mode */}}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2"
            >
              <span>View as Client</span>
            </button>
            <button
              onClick={() => {/* Save template */}}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Save Template
            </button>
          </div>
        </div>

        {/* Template Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">{template.title}</h1>
          <p className="text-muted-foreground">{template.description}</p>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{template.frequency} Check-in</span>
            </div>
            {template.frequency !== 'daily' && (
              <div>
                Opens: {template.scheduleConfig.openWindow.type === 'nth_day' 
                  ? `${template.scheduleConfig.openWindow.nthDay}${['st', 'nd', 'rd', 'th'][Math.min(3, template.scheduleConfig.openWindow.nthDay! - 1)]} of each month` 
                  : template.scheduleConfig.openWindow.day} at {template.scheduleConfig.openWindow.time}
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        {template.type === 'standard' && (
          <div className="space-y-6">
            {template.sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-card border border-border rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  {section.description && (
                    <p className="text-muted-foreground">{section.description}</p>
                  )}
                </div>

                <div className="space-y-6">
                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <label className="block font-medium">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {question.weight && (
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                            Weight: {question.weight}
                          </span>
                        )}
                      </div>
                      
                      {question.description && (
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                      )}

                      {/* Question Type Preview */}
                      <div className="mt-2">
                        {question.type === 'yesNo' && (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name={`q-${question.id}`} disabled />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name={`q-${question.id}`} disabled />
                              <span>No</span>
                            </label>
                          </div>
                        )}

                        {question.type === 'scale' && (
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <label key={num} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`q-${question.id}`}
                                  value={num}
                                  className="sr-only peer"
                                />
                                <span className="w-8 h-8 flex items-center justify-center rounded-full border border-input hover:border-primary cursor-pointer peer-checked:bg-primary peer-checked:text-white transition-colors">
                                  {num}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'multipleChoice' && (
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center gap-2">
                                <input
                                  type={question.allowMultiple ? "checkbox" : "radio"}
                                  name={`q-${question.id}`}
                                  disabled
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'text' && (
                          <textarea
                            className="w-full px-3 py-2 rounded-md border border-input bg-background"
                            rows={3}
                            placeholder="Enter your response..."
                            disabled
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {template.type === 'progress_photos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {template.photoRequirements?.map((photo) => (
              <div key={photo.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="aspect-square bg-background relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                    <h4 className="font-medium text-lg mb-2">
                      {photo.type === 'custom' ? photo.customLabel : `${photo.type.charAt(0).toUpperCase()}${photo.type.slice(1)} View`}
                    </h4>
                    <p className="text-sm text-muted-foreground text-center">{photo.instructions}</p>
                  </div>
                  {photo.required && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                        Required
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => setCurrentStep('content')}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Editor
          </button>
          <button
            onClick={() => {/* Save template */}}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      {/* Navigation */}
      <nav className="bg-[#1C1C1F] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/coach/templates" className="flex items-center text-gray-300 hover:text-white">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Templates
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Template
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Template</h1>
          <p className="text-gray-400">Design a new check-in template for your clients</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['type', 'details', 'content', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${currentStep === step ? 'bg-primary text-white' : 
                    index < ['type', 'details', 'content', 'preview'].indexOf(currentStep) ? 'bg-primary/20 text-primary' : 
                    'bg-gray-700 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-24 h-0.5 mx-2 ${
                    index < ['type', 'details', 'content', 'preview'].indexOf(currentStep) ? 'bg-primary' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 'type' && renderTemplateTypeSelection()}
          {currentStep === 'details' && renderTemplateDetails()}
          {currentStep === 'content' && template.type === 'standard' && renderStandardBuilder()}
          {currentStep === 'content' && template.type === 'progress_photos' && renderProgressPhotoBuilder()}
          {currentStep === 'preview' && renderPreview()}
        </div>
      </div>
    </div>
  );
} 