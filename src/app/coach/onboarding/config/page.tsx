'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { onboardingConfigService } from '@/lib/services/onboardingConfigService';
import {
  OnboardingConfig,
  OnboardingSection,
  OnboardingQuestion,
  QuestionType
} from '@/lib/types/onboarding';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export default function OnboardingConfigPage() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<OnboardingConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<OnboardingConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadConfigs();
    }
  }, [user]);

  const loadConfigs = async () => {
    if (!user?.uid) return;
    const userConfigs = await onboardingConfigService.getCoachConfigs(user.uid);
    setConfigs(userConfigs);
    
    const active = await onboardingConfigService.getActiveConfig(user.uid);
    setActiveConfig(active);
  };

  const createNewConfig = async () => {
    if (!user?.uid) return;

    const defaultConfig: Omit<OnboardingConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      coachId: user.uid,
      title: 'New Onboarding Flow',
      description: 'Customize this onboarding flow for your clients',
      sections: [
        {
          id: 'physical-stats',
          title: 'Physical Stats',
          description: 'Basic physical measurements',
          icon: 'ChartBarIcon',
          order: 0,
          questions: [],
        },
      ],
      isActive: false,
    };

    const configId = await onboardingConfigService.createConfig(user.uid, defaultConfig);
    await loadConfigs();
    setIsEditing(true);
  };

  const addQuestion = (sectionId: string) => {
    if (!activeConfig) return;

    const section = activeConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newQuestion: OnboardingQuestion = {
      id: `question-${Date.now()}`,
      sectionId,
      type: 'text',
      title: 'New Question',
      description: '',
      required: true,
      order: section.questions.length,
    };

    const updatedSections = activeConfig.sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: [...s.questions, newQuestion],
        };
      }
      return s;
    });

    setActiveConfig({
      ...activeConfig,
      sections: updatedSections,
    });
  };

  const addSection = () => {
    if (!activeConfig) return;

    const newSection: OnboardingSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Section description',
      icon: 'DocumentIcon',
      order: activeConfig.sections.length,
      questions: [],
    };

    setActiveConfig({
      ...activeConfig,
      sections: [...activeConfig.sections, newSection],
    });
  };

  const saveConfig = async () => {
    if (!activeConfig) return;
    await onboardingConfigService.updateConfig(activeConfig.id, activeConfig);
    setIsEditing(false);
    await loadConfigs();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Onboarding Configuration</h1>
          <button
            onClick={createNewConfig}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create New Config</span>
          </button>
        </div>

        {configs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">No configurations found. Create your first onboarding flow!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {configs.map(config => (
              <div
                key={config.id}
                className={`bg-gray-800/50 rounded-lg p-6 ${
                  config.isActive ? 'border-2 border-green-500/50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{config.title}</h2>
                    <p className="text-gray-400">{config.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setActiveConfig(config);
                        setIsEditing(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    {!config.isActive && (
                      <button
                        onClick={async () => {
                          await onboardingConfigService.updateConfig(config.id, {
                            isActive: true,
                          });
                          await loadConfigs();
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.sections.map(section => (
                    <div
                      key={section.id}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <h3 className="font-medium mb-2">{section.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">{section.description}</p>
                      <div className="text-sm text-gray-400">
                        {section.questions.length} questions
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && activeConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Edit Configuration</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={activeConfig.title}
                    onChange={(e) =>
                      setActiveConfig({ ...activeConfig, title: e.target.value })
                    }
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Configuration Title"
                  />
                  <textarea
                    value={activeConfig.description}
                    onChange={(e) =>
                      setActiveConfig({ ...activeConfig, description: e.target.value })
                    }
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Configuration Description"
                    rows={3}
                  />
                </div>

                <div className="space-y-6">
                  {activeConfig.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="bg-gray-700/50 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const updatedSections = [...activeConfig.sections];
                            updatedSections[index] = {
                              ...section,
                              title: e.target.value,
                            };
                            setActiveConfig({
                              ...activeConfig,
                              sections: updatedSections,
                            });
                          }}
                          className="bg-gray-600/50 border border-gray-500 rounded px-3 py-1 text-white"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => addQuestion(section.id)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const updatedSections = activeConfig.sections.filter(
                                (s) => s.id !== section.id
                              );
                              setActiveConfig({
                                ...activeConfig,
                                sections: updatedSections,
                              });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {section.questions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="bg-gray-600/50 rounded p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <input
                                type="text"
                                value={question.title}
                                onChange={(e) => {
                                  const updatedSections = [...activeConfig.sections];
                                  updatedSections[index].questions[qIndex] = {
                                    ...question,
                                    title: e.target.value,
                                  };
                                  setActiveConfig({
                                    ...activeConfig,
                                    sections: updatedSections,
                                  });
                                }}
                                className="bg-gray-500/50 border border-gray-500 rounded px-3 py-1 text-white"
                              />
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const updatedSections = [...activeConfig.sections];
                                  updatedSections[index].questions[qIndex] = {
                                    ...question,
                                    type: e.target.value as QuestionType,
                                  };
                                  setActiveConfig({
                                    ...activeConfig,
                                    sections: updatedSections,
                                  });
                                }}
                                className="bg-gray-500/50 border border-gray-500 rounded px-3 py-1 text-white ml-2"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="select">Select</option>
                                <option value="multiselect">Multi-Select</option>
                                <option value="range">Range</option>
                                <option value="boolean">Yes/No</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addSection}
                  className="w-full bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg py-4 text-gray-400 hover:text-gray-300 hover:border-gray-500"
                >
                  Add Section
                </button>
              </div>

              <div className="p-6 border-t border-gray-700">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveConfig}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 