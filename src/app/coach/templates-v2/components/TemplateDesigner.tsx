import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  PlusIcon,
  Bars3Icon,
  TrashIcon,
  DocumentDuplicateIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import QuestionEditor from './QuestionEditor';

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  weight?: number;
  yesIsPositive?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
  };
}

interface TemplateDesignerProps {
  initialData: {
    sections: Section[];
  };
  onSave: (data: { sections: Section[] }) => void;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Response' },
  { value: 'yesNo', label: 'Yes/No' },
  { value: 'multipleChoice', label: 'Multiple Choice' },
  { value: 'radio', label: 'Single Choice' },
  { value: 'scale', label: 'Scale' }
];

export default function TemplateDesigner({ initialData, onSave }: TemplateDesignerProps) {
  const [sections, setSections] = useState<Section[]>(initialData.sections);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionId: string;
    question: Question;
  } | null>(null);

  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: []
    };
    setSections([...sections, newSection]);
    setEditingSection(newSection);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleDuplicateSection = (section: Section) => {
    const newSection: Section = {
      ...section,
      id: crypto.randomUUID(),
      title: `${section.title} (Copy)`,
      questions: section.questions.map(q => ({ ...q, id: crypto.randomUUID() }))
    };
    setSections([...sections, newSection]);
  };

  const handleAddQuestion = (sectionId: string) => {
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
    
    setEditingQuestion({ sectionId, question: newQuestion });
  };

  const handleQuestionSave = (updatedQuestion: Question) => {
    if (!editingQuestion) return;
    
    setSections(sections.map(section =>
      section.id === editingQuestion.sectionId
        ? {
            ...section,
            questions: section.questions.map(q =>
              q.id === updatedQuestion.id ? updatedQuestion : q
            )
          }
        : section
    ));
    setEditingQuestion(null);
  };

  const handleQuestionDelete = (sectionId: string, questionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.filter(q => q.id !== questionId)
          }
        : section
    ));
    if (editingQuestion?.question.id === questionId) {
      setEditingQuestion(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Design Your Template</h2>
        <p className="text-gray-400">
          Build your template structure by adding sections and questions.
        </p>
      </div>

      {/* Template Structure */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sections List */}
        <div className="col-span-8 space-y-4">
          <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
            {sections.map((section) => (
              <Reorder.Item
                key={section.id}
                value={section}
                className="bg-[#1C1C1F] rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                      className="bg-transparent text-lg font-medium text-white w-full focus:outline-none"
                      placeholder="Section Title"
                    />
                    <textarea
                      value={section.description || ''}
                      onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                      className="mt-2 bg-transparent text-sm text-gray-400 w-full focus:outline-none resize-none"
                      placeholder="Add a description..."
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDuplicateSection(section)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 cursor-move">
                      <Bars3Icon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Questions */}
                <Reorder.Group
                  axis="y"
                  values={section.questions}
                  onReorder={(questions) => handleUpdateSection(section.id, { questions })}
                  className="space-y-2"
                >
                  {section.questions.map((question) => (
                    <Reorder.Item
                      key={question.id}
                      value={question}
                      className="bg-[#2C2C30] rounded-lg p-3 flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="text-white font-medium">{question.text || 'Untitled Question'}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                          {question.type === 'yesNo' && (
                            <>
                              {question.weight && (
                                <span className="text-indigo-400">• Weight: {question.weight}</span>
                              )}
                              <span className={question.yesIsPositive ? 'text-green-400' : 'text-red-400'}>
                                • Yes is {question.yesIsPositive ? 'positive' : 'negative'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingQuestion({ sectionId: section.id, question })}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuestionDelete(section.id, question.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 cursor-move">
                          <Bars3Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <button
                  onClick={() => handleAddQuestion(section.id)}
                  className="w-full mt-4 py-2 px-4 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Question
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <button
            onClick={handleAddSection}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Section
          </button>
        </div>

        {/* Question Editor */}
        <div className="col-span-4 bg-[#1C1C1F] rounded-lg p-4">
          {editingQuestion ? (
            <QuestionEditor
              question={editingQuestion.question}
              onSave={handleQuestionSave}
              onClose={() => setEditingQuestion(null)}
            />
          ) : (
            <div className="text-center text-gray-400 py-8">
              Select a question to edit its properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 