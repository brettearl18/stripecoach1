import { useState } from 'react';
import type { CheckInForm as CheckInFormType } from '@/types/checkIn';
import { CompletionScreen } from './CompletionScreen';

interface CheckInFormProps {
  form: CheckInFormType;
  onSubmit: (answers: CheckInFormType['answers']) => void;
}

export function CheckInForm({ form, onSubmit }: CheckInFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAnswers = form.questions.map(question => ({
      questionId: question.id,
      value: answers[question.id] || null
    }));
    
    try {
      await onSubmit(formattedAnswers);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error here
    }
  };

  const currentQuestion = form.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100;

  const goToNextQuestion = () => {
    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderInput = (question: CheckInFormType['questions'][0]) => {
    switch (question.type) {
      case 'number':
        return (
          <input
            type="number"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, parseFloat(e.target.value))}
            className="w-full px-4 py-3 text-lg bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            placeholder="Enter a number"
            min={0}
            required={question.required}
          />
        );
      case 'rating_scale':
        return (
          <div className="flex justify-center space-x-4 py-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleInputChange(question.id, rating)}
                className={`w-12 h-12 rounded-full text-lg font-semibold transition-all duration-200 ${
                  answers[question.id] === rating
                    ? 'bg-blue-500 text-white transform scale-110'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (isCompleted) {
    return <CompletionScreen formTitle={form.title} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-500 bg-blue-900/30">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-500">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-800/50">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-gray-800/30 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">
              Question {currentQuestionIndex + 1} of {form.questions.length}
            </span>
            {currentQuestion.required && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-900/30 text-red-400">
                Required
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-medium text-white">
            {currentQuestion.text}
          </h3>

          <div className="pt-4">
            {renderInput(currentQuestion)}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6">
        <button
          type="button"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentQuestionIndex === 0
              ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
              : 'bg-gray-800/50 text-white hover:bg-gray-700/50'
          }`}
        >
          Previous
        </button>

        {currentQuestionIndex === form.questions.length - 1 ? (
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
          >
            Submit Check-in
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextQuestion}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
          >
            Next Question
          </button>
        )}
      </div>
    </form>
  );
} 