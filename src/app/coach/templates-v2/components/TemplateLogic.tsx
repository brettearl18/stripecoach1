import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  weight?: number;
  yesIsPositive?: boolean;
  dependsOn?: {
    questionId: string;
    answer: string | number;
  };
}

interface ScoringRule {
  id: string;
  name: string;
  color: 'green' | 'orange' | 'red';
  minScore: number;
  maxScore: number;
  feedback: string;
}

interface PresetRanking {
  name: string;
  rules: {
    green: { min: number; max: number };
    orange: { min: number; max: number };
    red: { min: number; max: number };
  };
}

interface ColorLevel {
  color: 'green' | 'orange' | 'red';
  defaultName: string;
  defaultFeedback: string;
}

interface TemplateLogicProps {
  initialData: {
    sections: Section[];
    scoringRules?: ScoringRule[];
  };
  onSave: (data: { sections: Section[]; scoringRules: ScoringRule[] }) => void;
}

const PRESET_RANKINGS: PresetRanking[] = [
  {
    name: 'Beginner',
    rules: {
      green: { min: 70, max: 100 },
      orange: { min: 40, max: 69 },
      red: { min: 0, max: 39 }
    }
  },
  {
    name: 'Intermediate',
    rules: {
      green: { min: 80, max: 100 },
      orange: { min: 50, max: 79 },
      red: { min: 0, max: 49 }
    }
  },
  {
    name: 'Advanced',
    rules: {
      green: { min: 85, max: 100 },
      orange: { min: 60, max: 84 },
      red: { min: 0, max: 59 }
    }
  },
  {
    name: 'Professional',
    rules: {
      green: { min: 90, max: 100 },
      orange: { min: 75, max: 89 },
      red: { min: 0, max: 74 }
    }
  }
];

const COLOR_LEVELS: ColorLevel[] = [
  {
    color: 'green',
    defaultName: 'Excellent',
    defaultFeedback: 'Outstanding performance!'
  },
  {
    color: 'orange',
    defaultName: 'Good',
    defaultFeedback: 'Good progress, keep working on improvements.'
  },
  {
    color: 'red',
    defaultName: 'Needs Improvement',
    defaultFeedback: 'Additional focus and effort required.'
  }
];

export default function TemplateLogic({ initialData, onSave }: TemplateLogicProps) {
  const [sections, setSections] = useState<Section[]>(initialData.sections);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [customRules, setCustomRules] = useState<ScoringRule[]>([
    {
      id: '1',
      name: 'Excellent',
      color: 'green',
      minScore: 85,
      maxScore: 100,
      feedback: 'Outstanding performance!'
    },
    {
      id: '2',
      name: 'Good',
      color: 'orange',
      minScore: 50,
      maxScore: 84,
      feedback: 'Good progress, keep working on improvements.'
    },
    {
      id: '3',
      name: 'Needs Improvement',
      color: 'red',
      minScore: 0,
      maxScore: 49,
      feedback: 'Additional focus and effort required.'
    }
  ]);
  
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(
    initialData.scoringRules || customRules
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Simple scoring weight for questions
  const handleWeightChange = (questionId: string, weight: number) => {
    setSections(sections.map(section => ({
      ...section,
      questions: section.questions.map(q =>
        q.id === questionId ? { ...q, weight } : q
      )
    })));
  };

  // For Yes/No questions - determine if "Yes" is a positive or negative response
  const handleYesIsPositiveChange = (questionId: string, isPositive: boolean) => {
    setSections(sections.map(section => ({
      ...section,
      questions: section.questions.map(q =>
        q.id === questionId ? { ...q, yesIsPositive: isPositive } : q
      )
    })));
  };

  const handlePresetChange = (presetName: string) => {
    if (presetName === 'custom') {
      setScoringRules(customRules);
      setSelectedPreset('custom');
      return;
    }

    const preset = PRESET_RANKINGS.find(p => p.name === presetName);
    if (!preset) return;

    // Save current rules if we're switching from custom
    if (selectedPreset === 'custom') {
      setCustomRules(scoringRules);
    }

    const newRules: ScoringRule[] = [
      {
        id: crypto.randomUUID(),
        name: 'Excellent',
        color: 'green',
        minScore: preset.rules.green.min,
        maxScore: preset.rules.green.max,
        feedback: 'Outstanding performance!'
      },
      {
        id: crypto.randomUUID(),
        name: 'Good',
        color: 'orange',
        minScore: preset.rules.orange.min,
        maxScore: preset.rules.orange.max,
        feedback: 'Good progress, keep working on improvements.'
      },
      {
        id: crypto.randomUUID(),
        name: 'Needs Improvement',
        color: 'red',
        minScore: preset.rules.red.min,
        maxScore: preset.rules.red.max,
        feedback: 'Additional focus and effort required.'
      }
    ];

    setScoringRules(newRules);
    setSelectedPreset(presetName);
  };

  const handleUpdateScoringRule = (ruleId: string, updates: Partial<ScoringRule>) => {
    const newRules = scoringRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    setScoringRules(newRules);
    
    // If we're in custom mode, update custom rules too
    if (selectedPreset === 'custom') {
      setCustomRules(newRules);
    }
  };

  // Make a question dependent on another question's answer
  const handleSetDependency = (questionId: string, dependsOn: Question['dependsOn']) => {
    setSections(sections.map(section => ({
      ...section,
      questions: section.questions.map(q =>
        q.id === questionId ? { ...q, dependsOn } : q
      )
    })));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Template Logic</h2>
        <p className="text-gray-400">
          Set up scoring and dependencies for your check-in questions.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Questions List */}
        <div className="col-span-8 space-y-6">
          {sections.map(section => (
            <div key={section.id} className="bg-[#1C1C1F] rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.questions.map(question => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg ${
                      selectedQuestionId === question.id
                        ? 'bg-indigo-900/20 border border-indigo-500/50'
                        : 'bg-[#2C2C30] hover:bg-[#3C3C40] cursor-pointer'
                    }`}
                    onClick={() => setSelectedQuestionId(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-medium">{question.text}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          <span className="inline-block px-2 py-1 bg-gray-700 rounded text-xs mr-2">
                            {question.type}
                          </span>
                          {question.weight && 
                            <span className="inline-block px-2 py-1 bg-blue-900/30 rounded text-xs mr-2">
                              Weight: {question.weight}
                            </span>
                          }
                          {question.type === 'yesNo' && question.yesIsPositive !== undefined &&
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              question.yesIsPositive ? 'bg-green-900/30' : 'bg-red-900/30'
                            }`}>
                              Yes is {question.yesIsPositive ? 'Positive' : 'Negative'}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Question Settings */}
        <div className="col-span-4">
          <div className="bg-[#1C1C1F] rounded-lg p-4 space-y-6">
            {selectedQuestionId ? (
              <>
                <h3 className="text-lg font-medium text-white">Question Settings</h3>
                {sections.map(section =>
                  section.questions
                    .filter(q => q.id === selectedQuestionId)
                    .map(question => (
                      <div key={question.id} className="space-y-6">
                        {/* Scoring Weight */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Scoring Weight
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={question.weight || 1}
                              onChange={e => handleWeightChange(question.id, Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-white font-medium w-8 text-center">
                              {question.weight || 1}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Higher weight means this question has more impact on the overall score
                          </p>
                        </div>

                        {/* Yes/No Settings */}
                        {question.type === 'yesNo' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Yes Answer Means
                            </label>
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleYesIsPositiveChange(question.id, true)}
                                className={`flex-1 py-2 px-4 rounded-lg ${
                                  question.yesIsPositive
                                    ? 'bg-green-600 text-white'
                                    : 'bg-[#2C2C30] text-gray-400'
                                }`}
                              >
                                Good
                              </button>
                              <button
                                onClick={() => handleYesIsPositiveChange(question.id, false)}
                                className={`flex-1 py-2 px-4 rounded-lg ${
                                  question.yesIsPositive === false
                                    ? 'bg-red-600 text-white'
                                    : 'bg-[#2C2C30] text-gray-400'
                                }`}
                              >
                                Bad
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                              This affects how the answer impacts the overall score
                            </p>
                          </div>
                        )}

                        {/* Question Dependencies */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Show this question only if
                          </label>
                          <select
                            value={question.dependsOn?.questionId || ''}
                            onChange={e => {
                              if (!e.target.value) {
                                handleSetDependency(question.id, undefined);
                              } else {
                                handleSetDependency(question.id, {
                                  questionId: e.target.value,
                                  answer: ''
                                });
                              }
                            }}
                            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white mb-2"
                          >
                            <option value="">Always show this question</option>
                            {sections.map(s =>
                              s.questions
                                .filter(q => q.id !== question.id)
                                .map(q => (
                                  <option key={q.id} value={q.id}>
                                    {q.text}
                                  </option>
                                ))
                            )}
                          </select>
                          {question.dependsOn?.questionId && (
                            <input
                              type="text"
                              value={question.dependsOn.answer || ''}
                              onChange={e => 
                                handleSetDependency(question.id, {
                                  ...question.dependsOn!,
                                  answer: e.target.value
                                })
                              }
                              placeholder="Enter the required answer"
                              className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                          )}
                        </div>
                      </div>
                    ))
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a question to configure its settings
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="bg-[#1C1C1F] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Performance Ranking</h3>
            <p className="text-sm text-gray-400">Set score ranges and feedback for different performance levels</p>
          </div>
        </div>

        {/* Preset Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ranking Preset
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="custom">Custom</option>
            {PRESET_RANKINGS.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Score Ranges */}
        <div className="space-y-4">
          {COLOR_LEVELS.map(level => {
            const rule = scoringRules.find(r => r.color === level.color) || {
              id: crypto.randomUUID(),
              name: level.defaultName,
              color: level.color,
              minScore: 0,
              maxScore: 100,
              feedback: level.defaultFeedback
            };
            
            return (
              <div 
                key={level.color} 
                className={`bg-[#2C2C30] rounded-lg p-4 border-l-4 ${
                  level.color === 'green' 
                    ? 'border-green-500' 
                    : level.color === 'orange'
                    ? 'border-orange-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    level.color === 'green' 
                      ? 'bg-green-500' 
                      : level.color === 'orange'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`} />
                  <input
                    type="text"
                    value={rule.name}
                    onChange={e => 
                      handleUpdateScoringRule(rule.id, { name: e.target.value })
                    }
                    className="bg-transparent text-white font-medium flex-1 focus:outline-none"
                    placeholder={`Name for ${level.color} level`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Score (%)
                    </label>
                    <input
                      type="number"
                      value={rule.minScore}
                      onChange={e =>
                        handleUpdateScoringRule(rule.id, {
                          minScore: Math.min(Math.max(0, Number(e.target.value)), rule.maxScore)
                        })
                      }
                      className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      min="0"
                      max={rule.maxScore}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Score (%)
                    </label>
                    <input
                      type="number"
                      value={rule.maxScore}
                      onChange={e =>
                        handleUpdateScoringRule(rule.id, {
                          maxScore: Math.min(100, Math.max(rule.minScore, Number(e.target.value)))
                        })
                      }
                      className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      min={rule.minScore}
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Feedback Message
                  </label>
                  <textarea
                    value={rule.feedback}
                    onChange={e =>
                      handleUpdateScoringRule(rule.id, {
                        feedback: e.target.value
                      })
                    }
                    className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder={`Enter feedback for ${level.color} performance level...`}
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => onSave({ sections, scoringRules })}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Continue to Preview
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 