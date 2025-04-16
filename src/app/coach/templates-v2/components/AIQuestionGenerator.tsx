import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Question {
  text: string;
  type: 'text' | 'scale' | 'multipleChoice' | 'yesNo';
  options?: string[];
}

interface AIQuestionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  sectionTitle: string;
}

export default function AIQuestionGenerator({
  isOpen,
  onClose,
  onQuestionsGenerated,
  sectionTitle
}: AIQuestionGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, sectionTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      onQuestionsGenerated(data.questions);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generate Questions</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Describe what kind of questions you'd like to generate for this section.
              Be specific about the information you want to gather from clients.
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Generate questions about client's fitness goals and current exercise routine..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-2 px-4 rounded-md text-white ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </button>
        </form>
      </div>
    </div>
  );
} 