import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  options?: string[];
  weight?: number;
  yesIsPositive?: boolean;
  dependsOn?: {
    questionId: string;
    answer: string | number;
  };
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface TemplateDesignProps {
  initialData: {
    sections: Section[];
  };
  onSave: (data: { sections: Section[] }) => void;
}

export default function TemplateDesign({ initialData, onSave }: TemplateDesignProps) {
  const [sections, setSections] = useState<Section[]>(initialData.sections);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: []
    };
    setSections([...sections, newSection]);
    setEditingSection(newSection.id);
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      type: 'text',
      required: false
    };
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, questions: [...section.questions, newQuestion] }
        : section
    ));
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.map(q =>
              q.id === questionId ? { ...q, ...updates } : q
            )
          }
        : section
    ));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.filter(q => q.id !== questionId)
          }
        : section
    ));
    setEditingQuestion(null);
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'text': return 'Text Response';
      case 'yesNo': return 'Yes/No';
      case 'multipleChoice': return 'Multiple Choice';
      case 'scale': return 'Scale';
      case 'radio': return 'Single Choice';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Template Design</h2>
        <p className="text-gray-400">
          Build your template structure and configure question settings
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="bg-[#1C1C1F] rounded-lg p-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              {editingSection === section.id ? (
                <input
                  type="text"
                  value={section.title}
                  onChange={e => 
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ))
                  }
                  onBlur={() => setEditingSection(null)}
                  className="bg-[#2C2C30] text-white text-lg font-medium px-4 py-2 rounded-lg w-full"
                  autoFocus
                />
              ) : (
                <h3 
                  className="text-lg font-medium text-white cursor-pointer hover:text-indigo-400"
                  onClick={() => setEditingSection(section.id)}
                >
                  {section.title}
                </h3>
              )}
              <button
                onClick={() => addQuestion(section.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <PlusIcon className="w-5 h-5" />
                Add Question
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {section.questions.map(question => (
                <div 
                  key={question.id}
                  className={`bg-[#2C2C30] rounded-lg p-4 ${
                    editingQuestion === question.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingQuestion === question.id ? (
                        <div className="space-y-4">
                          {/* Question Text */}
                          <input
                            type="text"
                            value={question.text}
                            onChange={e => 
                              updateQuestion(section.id, question.id, { text: e.target.value })
                            }
                            className="w-full bg-[#1C1C1F] text-white px-4 py-2 rounded-lg"
                            placeholder="Enter question text..."
                          />

                          {/* Question Type */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Question Type
                              </label>
                              <select
                                value={question.type}
                                onChange={e => 
                                  updateQuestion(section.id, question.id, { type: e.target.value as Question['type'] })
                                }
                                className="w-full bg-[#1C1C1F] text-white px-4 py-2 rounded-lg"
                              >
                                <option value="text">Text Response</option>
                                <option value="yesNo">Yes/No</option>
                                <option value="multipleChoice">Multiple Choice</option>
                                <option value="scale">Scale</option>
                                <option value="radio">Single Choice</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Required
                              </label>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => 
                                    updateQuestion(section.id, question.id, { required: true })
                                  }
                                  className={`flex-1 py-2 px-4 rounded-lg ${
                                    question.required
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-[#1C1C1F] text-gray-400'
                                  }`}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => 
                                    updateQuestion(section.id, question.id, { required: false })
                                  }
                                  className={`flex-1 py-2 px-4 rounded-lg ${
                                    !question.required
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-[#1C1C1F] text-gray-400'
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Options for Multiple Choice or Radio */}
                          {(question.type === 'multipleChoice' || question.type === 'radio') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Options
                              </label>
                              <div className="space-y-2">
                                {(question.options || []).map((option, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={e => {
                                        const newOptions = [...(question.options || [])];
                                        newOptions[index] = e.target.value;
                                        updateQuestion(section.id, question.id, { options: newOptions });
                                      }}
                                      className="flex-1 bg-[#1C1C1F] text-white px-4 py-2 rounded-lg"
                                      placeholder={`Option ${index + 1}`}
                                    />
                                    <button
                                      onClick={() => {
                                        const newOptions = question.options?.filter((_, i) => i !== index);
                                        updateQuestion(section.id, question.id, { options: newOptions });
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newOptions = [...(question.options || []), ''];
                                    updateQuestion(section.id, question.id, { options: newOptions });
                                  }}
                                  className="w-full py-2 px-4 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500"
                                >
                                  Add Option
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Logic Settings Summary */}
                          <div className="bg-[#1C1C1F] rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Logic Settings</h4>
                            <div className="space-y-3">
                              {/* Weight */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Weight:</span>
                                <span className="text-sm text-white">{question.weight || 1}</span>
                              </div>

                              {/* Yes/No Impact */}
                              {question.type === 'yesNo' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">Yes means:</span>
                                  <span className={`text-sm ${
                                    question.yesIsPositive ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {question.yesIsPositive ? 'Good' : 'Bad'}
                                  </span>
                                </div>
                              )}

                              {/* Dependencies */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Show if:</span>
                                <span className="text-sm text-white">
                                  {question.dependsOn 
                                    ? `Question ${question.dependsOn.questionId} = ${question.dependsOn.answer}`
                                    : 'Always'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingQuestion(null)}
                              className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => deleteQuestion(section.id, question.id)}
                              className="px-4 py-2 text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="text-white font-medium">{question.text || 'Untitled Question'}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                <span className="inline-block px-2 py-1 bg-gray-700 rounded text-xs mr-2">
                                  {getQuestionTypeLabel(question.type)}
                                </span>
                                {question.required && (
                                  <span className="inline-block px-2 py-1 bg-indigo-900/30 rounded text-xs mr-2">
                                    Required
                                  </span>
                                )}
                                {question.weight && (
                                  <span className="inline-block px-2 py-1 bg-blue-900/30 rounded text-xs mr-2">
                                    Weight: {question.weight}
                                  </span>
                                )}
                                {question.type === 'yesNo' && question.yesIsPositive !== undefined && (
                                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                                    question.yesIsPositive ? 'bg-green-900/30' : 'bg-red-900/30'
                                  }`}>
                                    Yes is {question.yesIsPositive ? 'Good' : 'Bad'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingQuestion(question.id)}
                              className="p-2 text-gray-400 hover:text-indigo-400"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Options Preview */}
                          {(question.type === 'multipleChoice' || question.type === 'radio') && 
                           question.options && question.options.length > 0 && (
                            <div className="pl-4 text-sm text-gray-400">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="w-full py-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          <PlusIcon className="w-6 h-6 mx-auto" />
          <span className="mt-1 block">Add Section</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => onSave({ sections })}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Continue to Logic
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 