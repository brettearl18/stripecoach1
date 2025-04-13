import { useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, XMarkIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface TemplateDetailsProps {
  initialData: {
    title: string;
    description: string;
    categories: string[];
    isTemplate: boolean;
  };
  onSave: (data: {
    title: string;
    description: string;
    categories: string[];
    isTemplate: boolean;
  }) => void;
}

const CATEGORIES = [
  {
    name: 'Wellness',
    subcategories: ['Mental Health', 'Stress Management', 'Work-Life Balance', 'Mindfulness']
  },
  {
    name: 'Fitness',
    subcategories: ['Strength Training', 'Cardio', 'Flexibility', 'Sports Performance']
  },
  {
    name: 'Nutrition',
    subcategories: ['Meal Planning', 'Weight Management', 'Special Diets', 'Supplements']
  },
  {
    name: 'Mental Health',
    subcategories: ['Anxiety', 'Depression', 'Stress', 'Personal Growth']
  },
  {
    name: 'Business',
    subcategories: ['Leadership', 'Productivity', 'Team Management', 'Strategy']
  },
  {
    name: 'Career',
    subcategories: ['Professional Development', 'Job Search', 'Skills Development', 'Career Transition']
  },
  {
    name: 'Life',
    subcategories: ['Personal Goals', 'Habits', 'Time Management', 'Personal Finance']
  },
  {
    name: 'Relationship',
    subcategories: ['Communication', 'Dating', 'Marriage', 'Family']
  },
  {
    name: 'Other',
    subcategories: ['Custom']
  }
];

export default function TemplateDetails({ initialData, onSave }: TemplateDetailsProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    categories: initialData.categories || [],
    isTemplate: initialData.isTemplate
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onSave(formData);
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Template Details</h2>
        <p className="text-gray-400">
          Start by providing basic information about your template
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2.5 text-white"
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2.5 text-white"
            placeholder="Describe what this template is for"
            rows={4}
            required
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categories (Select multiple)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map(category => (
              <div
                key={category.name}
                className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                  formData.categories.includes(category.name)
                    ? 'bg-indigo-600/20 border-2 border-indigo-500'
                    : 'bg-[#1C1C1F] border-2 border-transparent hover:border-indigo-500/50'
                }`}
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {category.subcategories.slice(0, 2).join(', ')}
                      {category.subcategories.length > 2 && '...'}
                    </p>
                  </div>
                  {formData.categories.includes(category.name) && (
                    <CheckCircleIcon className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                {formData.categories.includes(category.name) && (
                  <div className="mt-3 pt-3 border-t border-indigo-500/30">
                    <p className="text-xs text-indigo-400">
                      {category.subcategories.length} subcategories included
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Selected categories will be available as sections in the Design step
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            Continue to Design
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
} 