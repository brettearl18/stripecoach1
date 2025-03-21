'use client';

import { useState } from 'react';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  ArrowsPointingOutIcon,
  TrashIcon,
  CheckCircleIcon,
  BellIcon,
  XMarkIcon,
  TagIcon,
  PencilIcon,
  ShareIcon,
  ArrowRightIcon
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

export default function PhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(samplePhotos);
  const [selectedType, setSelectedType] = useState<'front' | 'side' | 'back'>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Progress Photos</h1>
              <nav className="hidden md:flex space-x-1">
                <a 
                  href="/client/dashboard" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Dashboard
                </a>
                <a 
                  href="/client/check-ins" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Check-ins
                </a>
                <a 
                  href="/client/photos" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                >
                  Photos
                </a>
                <a 
                  href="/client/measurements" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Measurements
                </a>
                <a 
                  href="/client/subscription" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Subscription
                </a>
                <a 
                  href="/client/messages" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative"
                >
                  Messages
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">3</span>
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <CalendarIcon className="h-5 w-5" />
              </button>
              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <BellIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Photos</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track your transformation journey with weekly progress photos
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Photos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select photo type and upload your progress photo</p>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Photo saved successfully!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(['front', 'side', 'back'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedType === type
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <PhotoIcon className={`h-8 w-8 mx-auto mb-2 ${
                    selectedType === type ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium capitalize ${
                    selectedType === type ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {type} View
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <label className={`relative cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              uploadState.isSaving
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            } transition-colors`}>
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {uploadState.isSaving ? 'Saving...' : 'Select Photo'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={uploadState.isSaving}
              />
            </label>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && uploadState.preview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Photo Preview */}
                <div className="relative aspect-square">
                  <img
                    src={uploadState.preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain rounded-lg"
                  />
                </div>

                {/* Photo Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Photo Details
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{uploadState.type} View</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(['before', 'after', 'milestone', 'weekly', 'monthly'] as PhotoTag[]).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            uploadState.tags.includes(tag)
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                      <PencilIcon className="h-4 w-4" />
                      Notes
                    </h4>
                    <textarea
                      value={uploadState.notes}
                      onChange={(e) => setUploadState(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about this photo..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none h-24"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleSavePhoto}
                      disabled={uploadState.isSaving}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                        uploadState.isSaving
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                      } transition-colors`}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {uploadState.isSaving ? 'Saving...' : 'Save Photo'}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Photo History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt={`Progress photo - ${photo.type} view`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleFullScreenView(photo)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mx-2"
                    >
                      <ArrowsPointingOutIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mx-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                      {photo.type} View
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{new Date(photo.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {photo.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{photo.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeFullScreenView}
                className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="relative aspect-square">
              <img
                src={selectedPhoto.url}
                alt={`Progress photo - ${selectedPhoto.type} view`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedPhoto.type} View
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{new Date(selectedPhoto.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleSavePhoto}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isSaving
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                  } transition-colors`}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {isSaving ? 'Saving...' : 'Save Photo'}
                  </span>
                </button>
              </div>
              {selectedPhoto.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPhoto.notes}</p>
              )}
              {saveSuccess && (
                <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full w-fit">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Photo saved successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 