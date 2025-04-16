import { useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, XMarkIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface TemplateDetailsProps {
  initialData: {
    name: string;
    description: string;
    categories: string[];
    tags: string[];
  };
  onSave: (data: any) => void;
}

export default function TemplateDetails({ initialData, onSave }: TemplateDetailsProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    categories: initialData.categories || [],
    tags: initialData.tags || [],
  });
  const [newTag, setNewTag] = useState('');

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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const categories = [
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Template Details</h2>
        <p className="text-gray-400">
          Set the basic information for your template
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Template Title
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter template title..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter template description..."
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categories (Select multiple)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {categories.map(category => (
              <div
                key={category.name}
                className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                  formData.categories.includes(category.name)
                    ? 'bg-indigo-600/20 border-2 border-indigo-500'
                    : 'bg-[#2C2C30] border-2 border-transparent hover:border-indigo-500/50'
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add tags..."
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#2C2C30] text-gray-300 rounded-full text-sm"
                >
                  <TagIcon className="w-4 h-4" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
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