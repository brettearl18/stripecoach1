'use client';

import { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Save, Copy, MoreVertical, X, Camera, Ruler, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DefaultTemplates } from './components/DefaultTemplates'
import { TemplateBranding } from './components/TemplateBranding'

// Template types with clear descriptions and icons
const TEMPLATE_TYPES = [
  {
    id: 'check-in',
    title: 'Check-in Form',
    description: 'Regular check-ins with your clients to track progress and gather feedback',
    icon: Calendar,
    defaultSections: ['Progress Update', 'Challenges', 'Goals Review']
  },
  {
    id: 'progress-photos',
    title: 'Progress Photos',
    description: 'Photo submission form with specific poses and measurement tracking',
    icon: Camera,
    defaultSections: ['Front View', 'Side View', 'Back View', 'Measurements']
  },
  {
    id: 'assessment',
    title: 'Assessment Form',
    description: 'Comprehensive assessment to evaluate client status and needs',
    icon: Ruler,
    defaultSections: ['Health History', 'Fitness Level', 'Goals', 'Lifestyle']
  }
];

// Question types with examples
const QUESTION_TYPES = [
  {
    type: 'text',
    label: 'Text Response',
    description: 'Open-ended text answer',
    example: 'What challenges did you face this week?'
  },
  {
    type: 'yesNo',
    label: 'Yes/No',
    description: 'Simple yes or no answer with impact settings',
    example: 'Did you follow your meal plan this week?'
  },
  {
    type: 'scale',
    label: 'Scale (1-5)',
    description: 'Rating scale with customizable range',
    example: 'Rate your energy levels today'
  },
  {
    type: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Select multiple options',
    example: 'Which areas need more focus?'
  }
];

const DAYS_OF_WEEK = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

const WEEK_NUMBERS = [
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second' },
  { value: 'third', label: 'Third' },
  { value: 'fourth', label: 'Fourth' },
  { value: 'last', label: 'Last' },
];

export default function TemplateBuilderV2() {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState({
    type: '',
    title: '',
    description: '',
    sections: [],
    frequency: 'weekly',
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8',
      logo: '',
      fontFamily: 'Inter',
      customCSS: ''
    },
    schedule: {
      type: 'weekly',
      days: [],
      timeWindow: {
        start: '09:00',
        end: '17:00'
      },
      monthlyPattern: {
        week: 'first',
        day: 'monday'
      },
      customPattern: ''
    }
  });
  
  // Step 1: Template Type Selection
  const renderTemplateTypeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Choose Template Type</h2>
          <p className="text-muted-foreground">Select the type of template you want to create</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATE_TYPES.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setTemplate({
                ...template,
                type: type.id,
                sections: type.defaultSections.map(title => ({
                  id: crypto.randomUUID(),
                  title,
                  questions: []
                }))
              });
              setStep(2);
            }}
            className={`p-6 rounded-xl border-2 transition-colors text-left ${
              template.type === type.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <type.icon className="w-8 h-8 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">{type.title}</h3>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Step 2: Basic Details
  const renderBasicDetails = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Template Details</h2>
        <p className="text-muted-foreground">Set up the basic information for your template</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Template Title</label>
          <input
            type="text"
            value={template.title}
            onChange={(e) => setTemplate({ ...template, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-input"
            placeholder="e.g., Weekly Check-in Form"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-input min-h-[100px]"
            placeholder="Describe the purpose of this template..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Frequency</label>
          <select
            value={template.frequency}
            onChange={(e) => {
              setTemplate({
                ...template,
                frequency: e.target.value,
                schedule: {
                  ...template.schedule,
                  type: e.target.value,
                  days: [],
                  timeWindow: { start: '09:00', end: '17:00' }
                }
              });
            }}
            className="w-full px-4 py-2 rounded-lg bg-background border border-input"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Schedule Settings */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Schedule Settings</h3>
          
          {/* Time Window */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Open Time</label>
              <input
                type="time"
                value={template.schedule?.timeWindow?.start || '09:00'}
                onChange={(e) => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    timeWindow: {
                      ...template.schedule?.timeWindow,
                      start: e.target.value
                    }
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Close Time</label>
              <input
                type="time"
                value={template.schedule?.timeWindow?.end || '17:00'}
                onChange={(e) => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    timeWindow: {
                      ...template.schedule?.timeWindow,
                      end: e.target.value
                    }
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input"
              />
            </div>
          </div>

          {/* Days Selection for Weekly/Fortnightly */}
          {(template.frequency === 'weekly' || template.frequency === 'fortnightly') && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Days {template.frequency === 'fortnightly' ? '(Every Two Weeks)' : ''}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={template.schedule?.days?.includes(day.value)}
                      onChange={(e) => {
                        const days = template.schedule?.days || [];
                        setTemplate({
                          ...template,
                          schedule: {
                            ...template.schedule,
                            days: e.target.checked
                              ? [...days, day.value]
                              : days.filter(d => d !== day.value)
                          }
                        });
                      }}
                      className="rounded border-input"
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Pattern */}
          {template.frequency === 'monthly' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Pattern</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={template.schedule?.monthlyPattern?.week || 'first'}
                    onChange={(e) => setTemplate({
                      ...template,
                      schedule: {
                        ...template.schedule,
                        monthlyPattern: {
                          ...template.schedule?.monthlyPattern,
                          week: e.target.value
                        }
                      }
                    })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input"
                  >
                    {WEEK_NUMBERS.map((week) => (
                      <option key={week.value} value={week.value}>
                        {week.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={template.schedule?.monthlyPattern?.day || 'monday'}
                    onChange={(e) => setTemplate({
                      ...template,
                      schedule: {
                        ...template.schedule,
                        monthlyPattern: {
                          ...template.schedule?.monthlyPattern,
                          day: e.target.value
                        }
                      }
                    })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Example: First Monday of every month
                </p>
              </div>
            </div>
          )}

          {/* Custom Schedule */}
          {template.frequency === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Schedule</label>
                <textarea
                  value={template.schedule?.customPattern || ''}
                  onChange={(e) => setTemplate({
                    ...template,
                    schedule: {
                      ...template.schedule,
                      customPattern: e.target.value
                    }
                  })}
                  placeholder="Describe your custom schedule pattern..."
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Examples:
                  <br />- Every 3 weeks on Monday and Wednesday
                  <br />- First and third Tuesday of each month
                  <br />- Every 10 days
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
              <button 
          onClick={() => setStep(1)}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
          Back
              </button>
              <button
          onClick={() => setStep(3)}
          disabled={!template.title || !template.description}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
              </button>
            </div>
          </div>
  );

  // Step 3: Section Builder
  const renderSectionBuilder = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Build Your Template</h2>
        <p className="text-muted-foreground">Add and organize sections and questions</p>
        </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sections Panel */}
        <div className="col-span-8 space-y-6">
          {template.sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const newSections = [...template.sections];
                    newSections[sectionIndex].title = e.target.value;
                    setTemplate({ ...template, sections: newSections });
                  }}
                  className="text-lg font-medium bg-transparent border-none focus:outline-none"
                  placeholder="Section Title"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newSections = [...template.sections];
                      newSections.splice(sectionIndex, 1);
                      setTemplate({ ...template, sections: newSections });
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-muted-foreground cursor-move">
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {section.questions.map((question, questionIndex) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-4 p-4 bg-background rounded-lg group"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => {
                          const newSections = [...template.sections];
                          newSections[sectionIndex].questions[questionIndex].text = e.target.value;
                          setTemplate({ ...template, sections: newSections });
                        }}
                        className="w-full bg-transparent border-none focus:outline-none"
                        placeholder="Enter your question"
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <select
                          value={question.type}
                          onChange={(e) => {
                            const newSections = [...template.sections];
                            newSections[sectionIndex].questions[questionIndex].type = e.target.value;
                            setTemplate({ ...template, sections: newSections });
                          }}
                          className="px-2 py-1 text-sm bg-primary/10 text-primary rounded border-none"
                        >
                          {QUESTION_TYPES.map(type => (
                            <option key={type.type} value={type.type}>{type.label}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => {
                              const newSections = [...template.sections];
                              newSections[sectionIndex].questions[questionIndex].required = e.target.checked;
                              setTemplate({ ...template, sections: newSections });
                            }}
                            className="rounded border-input"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          const newSections = [...template.sections];
                          newSections[sectionIndex].questions.splice(questionIndex, 1);
                          setTemplate({ ...template, sections: newSections });
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground cursor-move rounded-md hover:bg-accent">
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => {
                    const newSections = [...template.sections];
                    newSections[sectionIndex].questions.push({
                      id: crypto.randomUUID(),
                      text: '',
                      type: 'text',
                      required: false
                    });
                    setTemplate({ ...template, sections: newSections });
                  }}
                  className="w-full py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
            </div>
            </motion.div>
          ))}

          <button
            onClick={() => {
              setTemplate({
                ...template,
                sections: [
                  ...template.sections,
                  {
                    id: crypto.randomUUID(),
                    title: 'New Section',
                    questions: []
                  }
                ]
              });
            }}
            className="w-full py-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </div>

        {/* AI Assistant Panel */}
        <div className="col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered suggestions for questions based on your template type and sections.
            </p>
            <button
              className="w-full bg-primary/10 text-primary rounded-lg py-2 px-4 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Suggestions
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
        <button
          onClick={() => {
            // Save template logic here
            alert('Template saved successfully!');
          }}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Template
        </button>
      </div>
    </div>
  );

  // Add the branding step render function
  const renderBranding = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customize Branding</h2>
        <p className="text-muted-foreground">Personalize the appearance of your template</p>
      </div>
      <TemplateBranding
        onBrandingUpdate={(branding) => setTemplate({ ...template, branding })}
        initialBranding={template.branding}
      />
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
        <button
          onClick={() => setStep(5)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/coach/templates" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Templates
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Step {step} of 5</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {step === 1 && renderTemplateTypeSelection()}
            {step === 2 && renderBasicDetails()}
            {step === 3 && renderSectionBuilder()}
            {step === 4 && renderBranding()}
            {step === 5 && renderPreview()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
} 