'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Save, Copy, MoreVertical, X, Camera, Ruler, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DefaultTemplates } from './components/DefaultTemplates'
import { TemplateBranding } from './components/TemplateBranding'
import { getUserQuestions, getCompanyQuestions, getGlobalQuestions, Question } from '@/lib/services/questionBankService';
import TemplateAllocation from './components/TemplateAllocation';

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
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    example: 'How many workouts did you complete?'
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    example: 'When did you start your program?'
  },
  {
    type: 'fileUpload',
    label: 'File Upload',
    description: 'Upload a file or photo',
    example: 'Upload your progress photo'
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

const SUGGESTED_BASICS = [
  {
    key: 'weight',
    label: 'Weight',
    type: 'number',
    placeholder: 'Enter weight',
    helpText: 'Client body weight (kg or lbs)'
  },
  {
    key: 'nutritionCompliance',
    label: 'Nutrition Compliance',
    type: 'scale',
    min: 1,
    max: 5,
    placeholder: '',
    helpText: 'How well did you stick to your nutrition plan? (1-5)'
  },
  {
    key: 'gymCompliance',
    label: 'Gym Compliance',
    type: 'scale',
    min: 1,
    max: 5,
    placeholder: '',
    helpText: 'How well did you stick to your gym/workout plan? (1-5)'
  }
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
      primaryColor: '#635BFF',
      secondaryColor: '#00B87C',
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
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'user' | 'company' | 'global'>('user');
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [companyQuestions, setCompanyQuestions] = useState<Question[]>([]);
  const [globalQuestions, setGlobalQuestions] = useState<Question[]>([]);
  const coachId = 'demo-coach'; // TODO: Replace with real auth
  const companyId = 'demo-company'; // TODO: Replace with real company
  const [showBrandingAdvanced, setShowBrandingAdvanced] = useState(false);
  const [showAllocationSuccess, setShowAllocationSuccess] = useState(false);

  const defaultBranding = {
    primaryColor: '#635BFF',
    secondaryColor: '#00B87C',
    fontFamily: 'Inter',
  };

  useEffect(() => {
    if (showLibrary) {
      getUserQuestions(coachId).then(setUserQuestions);
      getCompanyQuestions(companyId).then(setCompanyQuestions);
      getGlobalQuestions().then(setGlobalQuestions);
    }
  }, [showLibrary]);

  useEffect(() => {
    if (!template.branding.primaryColor) {
      setTemplate(t => ({
        ...t,
        branding: { ...defaultBranding }
      }));
    }
  }, []);

  // Step 1: Template Type Selection
  const renderTemplateTypeSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Choose Template Type</h2>
          <p className="text-[#6B7280] mt-2">Select the type of template you want to create</p>
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
            className={`p-8 rounded-xl border-2 transition-all duration-200 text-left ${
              template.type === type.id
                ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-lg'
                : 'border-[#E5E7EB] hover:border-[#635BFF]/50 hover:shadow-md'
            }`}
          >
            <type.icon className="w-10 h-10 mb-4 text-[#635BFF]" />
            <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">{type.title}</h3>
            <p className="text-[#6B7280] leading-relaxed">{type.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Step 2: Basic Details
  const renderBasicDetails = () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A]">Template Details</h2>
        <p className="text-[#6B7280] mt-2">Set up the basic information for your template</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block text-[#1A1A1A]">Template Title</label>
          <input
            type="text"
            value={template.title}
            onChange={(e) => setTemplate({ ...template, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition-all duration-200 text-white placeholder:text-gray-300"
            placeholder="e.g., Weekly Check-in Form"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-[#1A1A1A]">Description</label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition-all duration-200 min-h-[120px] text-white placeholder:text-gray-300"
            placeholder="Describe the purpose of this template..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-[#1A1A1A]">Frequency</label>
          <select
            value={template.frequency}
            onChange={(e) => setTemplate({ ...template, frequency: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition-all duration-200 text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
          </div>

        {/* Schedule Settings */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Schedule Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Open Day</label>
              <select
                value={template.schedule?.openDay || 'monday'}
                onChange={e => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    openDay: e.target.value
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-[#18181b] border border-input text-white"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Open Time</label>
              <input
                type="time"
                value={template.schedule?.openTime || '09:00'}
                onChange={e => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    openTime: e.target.value
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-[#18181b] border border-input text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Close Day</label>
              <select
                value={template.schedule?.closeDay || 'tuesday'}
                onChange={e => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    closeDay: e.target.value
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-[#18181b] border border-input text-white"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Close Time</label>
              <input
                type="time"
                value={template.schedule?.closeTime || '17:00'}
                onChange={e => setTemplate({
                  ...template,
                  schedule: {
                    ...template.schedule,
                    closeTime: e.target.value
                  }
                })}
                className="w-full px-4 py-2 rounded-lg bg-[#18181b] border border-input text-white"
              />
            </div>
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Template Sections</h2>
          <p className="text-[#6B7280] mt-2">Organize your template into logical sections</p>
        </div>
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#635BFF] text-white hover:bg-[#635BFF]/90 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Section
        </button>
      </div>

      {/* Suggested Basics Panel */}
      <div className="mb-6 p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl">
        <h3 className="font-semibold text-[#635BFF] mb-2">Suggested Basics</h3>
        <div className="flex flex-wrap gap-4">
          {SUGGESTED_BASICS.map(basic => {
            // Check if this basic is already in the first section
            const basicsSection = template.sections[0];
            const exists = basicsSection && basicsSection.questions.some(q => q.key === basic.key);
            return (
              <div key={basic.key} className="flex items-center gap-2">
                <label className="font-medium text-[#635BFF] flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exists}
                    onChange={e => {
                      let newSections = [...template.sections];
                      // Ensure at least one section exists
                      if (!newSections.length) {
                        newSections = [{
                          id: crypto.randomUUID(),
                          title: 'Basics',
                          questions: []
                        }];
                      }
                      if (e.target.checked) {
                        // Add the basic question if not present
                        if (!newSections[0].questions.some(q => q.key === basic.key)) {
                          newSections[0].questions.unshift({
                            id: crypto.randomUUID(),
                            text: basic.label,
                            type: basic.type,
                            min: basic.min,
                            max: basic.max,
                            placeholder: basic.placeholder,
                            helpText: basic.helpText,
                            required: true,
                            key: basic.key // for mapping to dashboard
                          });
                        }
                      } else {
                        // Remove the basic question
                        newSections[0].questions = newSections[0].questions.filter(q => q.key !== basic.key);
                      }
                      setTemplate({ ...template, sections: newSections });
                    }}
                  />
                  {basic.label}
                </label>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[#635BFF] mt-2">Including these basics ensures your client's dashboard is always up to date.</p>
      </div>

      <div className="space-y-6">
        {template.sections.map((section, index) => (
          <div
            key={section.id}
            className="p-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  const newSections = [...template.sections];
                  newSections[index].title = e.target.value;
                  setTemplate({ ...template, sections: newSections });
                }}
                className="text-xl font-semibold bg-transparent border-none focus:ring-0 p-0 text-[#1A1A1A]"
                placeholder="Section Title"
              />
              <button
                onClick={() => {
                  const newSections = template.sections.filter((_, i) => i !== index);
                  setTemplate({ ...template, sections: newSections });
                }}
                className="p-2 text-[#6B7280] hover:text-[#FF4D4F] transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {section.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-[#6B7280]" />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => {
                          const newSections = [...template.sections];
                          newSections[index].questions[qIndex].text = e.target.value;
                          setTemplate({ ...template, sections: newSections });
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#1A1A1A]"
                        placeholder="Question text"
                      />
                    </div>
                    <select
                      value={question.type}
                      onChange={(e) => {
                        const newSections = [...template.sections];
                        newSections[index].questions[qIndex].type = e.target.value;
                        setTemplate({ ...template, sections: newSections });
                      }}
                      className="px-3 py-1 rounded-md border border-[#E5E7EB] bg-white text-[#1A1A1A]"
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type.type} value={type.type}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const newSections = [...template.sections];
                        newSections[index].questions = newSections[index].questions.filter(
                          (_, i) => i !== qIndex
                        );
                        setTemplate({ ...template, sections: newSections });
                      }}
                      className="p-2 text-[#6B7280] hover:text-[#FF4D4F] transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const newSections = [...template.sections];
                  newSections[index].questions.push({
                    id: crypto.randomUUID(),
                    text: '',
                    type: 'text'
                  });
                  setTemplate({ ...template, sections: newSections });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#635BFF] hover:bg-[#635BFF]/5 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 text-muted-foreground hover:text-foreground border border-[#E5E7EB] rounded-lg bg-transparent"
        >
          Back
        </button>
        <button
          onClick={() => {
            // Save template logic here (for now, just alert or log)
            alert('Template saved successfully!');
          }}
          className="px-6 py-2 bg-[#00B87C] text-white rounded-lg hover:bg-[#00B87C]/90"
        >
          Save Template
        </button>
        <button
          onClick={() => setStep(4)}
          className="px-6 py-2 bg-[#635BFF] text-white rounded-lg hover:bg-[#635BFF]/90"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Step 4: Preview & Finalize
  const renderPreviewFinalize = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-[#1A1A1A]">Preview & Finalize</h2>
      <p className="text-[#6B7280] mt-2">Review your template and make any final adjustments before publishing.</p>

      {/* Preview Panel */}
      <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white max-w-xl">
        <h3 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Template Preview</h3>
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: (template.branding.primaryColor || defaultBranding.primaryColor) + '10',
            border: `2px solid ${template.branding.primaryColor || defaultBranding.primaryColor}`
          }}
        >
          <h4
            className="text-xl font-semibold mb-2"
            style={{ color: template.branding.primaryColor || defaultBranding.primaryColor, fontFamily: template.branding.fontFamily || defaultBranding.fontFamily }}
          >
            {template.title || 'Template Title'}
          </h4>
          <p className="text-[#6B7280] mb-4" style={{ fontFamily: template.branding.fontFamily || defaultBranding.fontFamily }}>
            {template.description || 'Template description...'}
          </p>
          {/* Render sections and questions */}
          <div className="space-y-6">
            {template.sections.map((section, idx) => (
              <div key={section.id || idx} className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                <h5 className="font-semibold text-[#1A1A1A] mb-2">{section.title}</h5>
                <ul className="space-y-2">
                  {section.questions.map((q, qIdx) => (
                    <li key={q.id || qIdx} className="flex items-center gap-2 p-2 rounded bg-[#F7F8FA] border border-[#E5E7EB]">
                      <span className="font-medium text-[#635BFF]">{q.text}</span>
                      <span className="ml-auto text-xs text-[#6B7280]">{QUESTION_TYPES.find(t => t.type === q.type)?.label || q.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {template.sections.length === 0 && (
              <div className="text-[#6B7280] italic">No sections or questions added yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Branding Section */}
      <div>
        <button
          className="text-[#635BFF] font-medium underline mb-2"
          onClick={() => setShowBrandingAdvanced(v => !v)}
        >
          {showBrandingAdvanced ? 'Hide' : 'Customize'} Branding (Advanced)
        </button>
        {showBrandingAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 border border-[#E5E7EB] rounded-xl bg-[#18181b] mt-2">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-white">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={template.branding.primaryColor || defaultBranding.primaryColor}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        branding: { ...template.branding, primaryColor: e.target.value }
                      })
                    }
                    className="w-12 h-12 rounded-lg border border-[#E5E7EB] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={template.branding.primaryColor || defaultBranding.primaryColor}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        branding: { ...template.branding, primaryColor: e.target.value }
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-lg border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 bg-[#18181b] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-white">Secondary Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={template.branding.secondaryColor || defaultBranding.secondaryColor}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        branding: { ...template.branding, secondaryColor: e.target.value }
                      })
                    }
                    className="w-12 h-12 rounded-lg border border-[#E5E7EB] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={template.branding.secondaryColor || defaultBranding.secondaryColor}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        branding: { ...template.branding, secondaryColor: e.target.value }
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-lg border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 bg-[#18181b] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-white">Font Family</label>
                <select
                  value={template.branding.fontFamily || defaultBranding.fontFamily}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      branding: { ...template.branding, fontFamily: e.target.value }
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 bg-[#18181b] text-white"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
            </div>
        </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 text-muted-foreground hover:text-foreground border border-[#E5E7EB] rounded-lg bg-transparent"
        >
          Back
        </button>
        <button
          onClick={() => {
            // Save as draft logic here (for now, just alert or log)
            alert('Template saved as draft!');
          }}
          className="px-6 py-2 bg-[#00B87C] text-white rounded-lg hover:bg-[#00B87C]/90"
        >
          Save as Draft
        </button>
        <button
          onClick={() => setShowAllocationSuccess(false) || setStep(5)}
          className="px-6 py-2 bg-[#635BFF] text-white rounded-lg hover:bg-[#635BFF]/90"
        >
          Publish / Finish
        </button>
        <button
          onClick={() => setStep(5)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-2"
        >
          Assign to Clients
        </button>
      </div>
    </div>
  );

  // Step 5: Allocation
  const renderAllocationStep = () => (
    <div>
      <TemplateAllocation
        defaultSettings={{
          frequency: template.frequency ? { type: template.frequency } : { type: 'weekly' },
          checkInWindow: 7
        }}
        onBack={() => setStep(4)}
        onSave={(allocations) => {
          setShowAllocationSuccess(true);
          // Here you would save allocations to the backend
        }}
      />
      {showAllocationSuccess && (
        <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-lg">
          Template successfully allocated to selected clients!
        </div>
      )}
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
            {step === 4 && renderPreviewFinalize()}
            {step === 5 && renderAllocationStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
} 