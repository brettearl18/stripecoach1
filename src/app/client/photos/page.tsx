'use client';

import { useState } from 'react';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowsPointingOutIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  TagIcon,
  PencilIcon,
  ShareIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { uploadPhoto } from '@/lib/photoUpload';
import { useAuth } from '@/hooks/useAuth';

// Types for our photos
type ProgressPhoto = {
  id: string;
  url: string;
  date: string;
  type: 'front' | 'side' | 'back';
  notes?: string;
  tags: string[];
};

// Sample data - would come from backend
const samplePhotos: ProgressPhoto[] = [
  {
    id: '1',
    url: '/images/progress-1.jpg',
    date: '2024-03-15',
    type: 'front',
    notes: 'Week 1 progress',
    tags: ['before', 'after']
  },
  {
    id: '2',
    url: '/images/progress-2.jpg',
    date: '2024-03-15',
    type: 'side',
    notes: 'Week 1 progress',
    tags: ['before', 'after']
  },
  {
    id: '3',
    url: '/images/progress-3.jpg',
    date: '2024-03-15',
    type: 'back',
    notes: 'Week 1 progress',
    tags: ['before', 'after']
  }
];

// Add new types
type PhotoTag = 'before' | 'after' | 'milestone' | 'weekly' | 'monthly';

interface PhotoUploadState {
  file: File | null;
  preview: string | null;
  type: 'front' | 'side' | 'back';
  notes: string;
  tags: PhotoTag[];
  isSaving: boolean;
}

// Mock photo history data
const mockPhotoHistory = [
  {
    id: 1,
    date: '2024-03-15',
    week: 1,
    photos: {
      front: '/mock/front-1.jpg',
      side: '/mock/side-1.jpg',
      back: '/mock/back-1.jpg',
    },
    analysis: {
      bodyFat: '22%',
      muscleGain: '+1.2 lbs',
      visualProgress: 'Noticeable definition in shoulders and arms',
      aiSuggestions: [
        'Keep up the protein intake for muscle preservation',
        'Consider adding more compound exercises',
        'Good progress on reducing waist circumference'
      ]
    }
  },
  // Add more historical entries as needed
];

export default function PhotosPage() {
  const [activeView, setActiveView] = useState('upload'); // 'upload' or 'history'
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photos, setPhotos] = useState<ProgressPhoto[]>(samplePhotos);
  const [selectedType, setSelectedType] = useState<'front' | 'side' | 'back'>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadState, setUploadState] = useState<PhotoUploadState>({
    file: null,
    preview: null,
    type: 'front',
    notes: '',
    tags: [],
    isSaving: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState(prev => ({
      ...prev,
      file,
      preview: URL.createObjectURL(file),
      type: selectedType
    }));
    setShowPreview(true);
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleSavePhoto = async () => {
    if (!uploadState.file || !user) return;
    
    setUploadState(prev => ({ ...prev, isSaving: true }));
    try {
      // Upload to Firebase Storage
      const uploadedPhoto = await uploadPhoto(
        uploadState.file,
        user.uid,
        uploadState.type
      );

      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        url: uploadedPhoto.url,
        date: new Date().toISOString().split('T')[0],
        type: uploadState.type,
        notes: uploadState.notes || `New upload - ${uploadState.type} view`,
        tags: uploadState.tags
      };

      setPhotos(prev => [newPhoto, ...prev]);
      setSaveSuccess(true);
      
      // Reset upload state after successful save
      setUploadState({
        file: null,
        preview: null,
        type: 'front',
        notes: '',
        tags: [],
        isSaving: false
      });
      setShowPreview(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving photo:', error);
      // You might want to show an error message to the user here
    } finally {
      setUploadState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleFullScreenView = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeFullScreenView = () => {
    setSelectedPhoto(null);
  };

  const toggleTag = (tag: PhotoTag) => {
    setUploadState(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const analyzePhotos = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Progress Photos</h1>
            <p className="text-gray-400 mt-1">Track your transformation journey with weekly progress photos</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveView('upload')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeView === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              Upload New
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeView === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
              History
            </button>
          </div>
        </div>

        {activeView === 'upload' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Upload New Photos</h2>
              <p className="text-gray-400 text-sm">Select photo type and upload your progress photos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Front View Upload */}
              <div className="relative group">
                <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors bg-gray-700/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <PhotoIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="mt-2 text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">Front View</span>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={() => setSelectedType('front')}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Side View Upload */}
              <div className="relative group">
                <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors bg-gray-700/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <PhotoIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="mt-2 text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">Side View</span>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={() => setSelectedType('side')}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Back View Upload */}
              <div className="relative group">
                <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors bg-gray-700/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <PhotoIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="mt-2 text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">Back View</span>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={() => setSelectedType('back')}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* AI Analysis Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={analyzePhotos}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>

            {/* AI Analysis Results */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChartBarIcon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-medium">Body Composition</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Estimated Body Fat: 18-20%</p>
                  <p className="text-sm text-gray-300">Muscle Mass Index: Medium</p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowsPointingOutIcon className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-medium">Changes Detected</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Shoulder Definition: +8%</p>
                  <p className="text-sm text-gray-300">Waist Reduction: -2cm</p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-medium">AI Suggestions</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5" />
                    Focus on upper body definition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5" />
                    Maintain current nutrition plan
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="space-y-8">
            {mockPhotoHistory.map((entry) => (
              <div key={entry.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Week {entry.week} Progress</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors">
                    Compare
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {Object.entries(entry.photos).map(([view, url]) => (
                    <div key={view} className="aspect-[3/4] relative group">
                      <div className="absolute inset-0 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 capitalize">{view} View</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Measurements</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>Body Fat: {entry.analysis.bodyFat}</p>
                      <p>Muscle Gain: {entry.analysis.muscleGain}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4 md:col-span-2">
                    <h4 className="text-white font-medium mb-2">AI Analysis</h4>
                    <p className="text-gray-300 text-sm mb-3">{entry.analysis.visualProgress}</p>
                    <ul className="space-y-2">
                      {entry.analysis.aiSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 