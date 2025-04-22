'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckIcon, 
  PhotoIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { FormTemplate, Question, Category } from '@/lib/types/forms';
import { getTemplateById } from '@/lib/data/form-templates';
import { toast } from 'sonner';

// Add ProgressPhoto type
type ProgressPhoto = {
  id: string;
  url: string;
  date: string;
  type: 'front' | 'side' | 'back';
  notes?: string;
};

export default function CheckInForm() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const template = getTemplateById(formId);
    if (template) {
      setForm(template);
      // Initialize responses
      const initialResponses = template.questions.reduce((acc, question) => {
        acc[question.id] = question.type === 'checkbox' ? [] : '';
        return acc;
      }, {} as Record<string, any>);
      setResponses(initialResponses);
    }

    // Fetch progress photos
    // This would normally come from your backend
    // For now, we'll use sample data
    setPhotos([
      {
        id: '1',
        url: '/images/progress-1.jpg',
        date: new Date().toISOString().split('T')[0],
        type: 'front',
        notes: 'Today\'s progress'
      },
      {
        id: '2',
        url: '/images/progress-2.jpg',
        date: new Date().toISOString().split('T')[0],
        type: 'side',
        notes: 'Today\'s progress'
      },
      {
        id: '3',
        url: '/images/progress-3.jpg',
        date: new Date().toISOString().split('T')[0],
        type: 'back',
        notes: 'Today\'s progress'
      }
    ]);
  }, [formId]);

  if (!form) {
    return <div>Loading...</div>;
  }

  const questionsByCategory = form.questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<Category, Question[]>);

  const categories = Object.keys(questionsByCategory) as Category[];
  const currentCategory = categories[currentStep];
  const currentQuestions = questionsByCategory[currentCategory] || [];

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePhotoUpload = async (questionId: string, input: string | File) => {
    if (typeof input === 'string') {
      // If input is a URL (existing photo)
      setResponses(prev => ({
        ...prev,
        [questionId]: input
      }));
    } else {
      // If input is a File (new upload)
      try {
        // Here you would normally upload to your backend/storage
        // For now, we'll create a local URL
        const url = URL.createObjectURL(input);
        setResponses(prev => ({
          ...prev,
          [questionId]: url
        }));
      } catch (error) {
        console.error('Error handling photo upload:', error);
        toast.error('Failed to upload photo. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('formId', formId);
      
      // Create a copy of responses to handle photo URLs
      const responsesForSubmission = { ...responses };
      
      // Handle photo responses
      Object.entries(responses).forEach(([questionId, response]) => {
        if (typeof response === 'string' && response.startsWith('blob:')) {
          // For new photo uploads, we need to get the file
          const photoFile = photos.find(p => p.url === response);
          if (photoFile) {
            formData.append(`photo_${questionId}`, photoFile.url);
            responsesForSubmission[questionId] = `photo_${questionId}`; // Replace blob URL with reference
          }
        }
      });

      formData.append('responses', JSON.stringify(responsesForSubmission));

      const response = await fetch('/api/check-in/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit check-in');
      }

      toast.success('Check-in submitted successfully!');
      router.push('/client/check-in');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = () => {
    const requiredQuestions = currentQuestions.filter(q => q.required);
    return requiredQuestions.every(q => {
      if (q.type === 'photo') {
        return photos.some(photo => photo.url === responses[q.id]);
      }
      const response = responses[q.id];
      return response !== undefined && response !== '' && response.length !== 0;
    });
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your response..."
          />
        );

      case 'rating_scale':
        return (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Low</span>
              <span className="text-sm text-gray-500">High</span>
            </div>
            <div className="flex justify-between gap-2">
              {Array.from({ length: (question.maxValue || 10) - (question.minValue || 1) + 1 }).map((_, idx) => {
                const value = (question.minValue || 1) + idx;
                return (
                  <button
                    key={value}
                    onClick={() => handleResponse(question.id, value)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      responses[question.id] === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  checked={responses[question.id] === option}
                  onChange={() => handleResponse(question.id, option)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleResponse(question.id, newValues);
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <div className="mt-2">
            <input
              type="number"
              value={responses[question.id] || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              min={question.minValue}
              max={question.maxValue}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {question.unit && (
              <span className="mt-1 text-sm text-gray-500">{question.unit}</span>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="mt-2">
            <div className="flex flex-col gap-4">
              {/* Existing Photos Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Select from Progress Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => handlePhotoUpload(question.id, photo.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                        responses[question.id] === photo.url ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Progress photo - ${photo.type} view`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        responses[question.id] === photo.url
                          ? 'bg-black/30'
                          : 'bg-black/0 group-hover:bg-black/20'
                      } transition-all`}>
                        {responses[question.id] === photo.url && (
                          <CheckIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {photo.type} View
                      </div>
                    </div>
                  ))}
                </div>
                {photos.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No progress photos uploaded today.{' '}
                    <Link href="/client/photos" className="text-indigo-600 hover:text-indigo-500">
                      Upload photos
                    </Link>
                  </p>
                )}
              </div>

              {/* Upload New Photo Section */}
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a new photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(question.id, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            {responses[question.id] && (
              <p className="mt-2 text-sm text-gray-500">
                Selected photo: {typeof responses[question.id] === 'string' 
                  ? responses[question.id].split('/').pop() 
                  : responses[question.id].name}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/check-in"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Check-ins
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{form.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-indigo-600">
              {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
            </span>
            <span className="text-gray-500">
              Step {currentStep + 1} of {categories.length}
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-indigo-600 rounded-full"
              style={{ width: `${((currentStep + 1) / categories.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {currentQuestions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-gray-700">
                  {question.text}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 ${
              currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>
          {currentStep === categories.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete() || isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Submit Check-in
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isStepComplete()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 