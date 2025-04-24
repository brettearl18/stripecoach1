'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  PlusIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface TabContentProps {
  client: any;
}

interface PhotoGroup {
  date: string;
  photos: {
    id: string;
    url: string;
    type: 'front' | 'side' | 'back';
    notes?: string;
  }[];
}

export default function PhotosTab({ client }: TabContentProps) {
  const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Mock data - replace with actual data from client prop
  const photoGroups: PhotoGroup[] = [
    {
      date: '2024-03-15',
      photos: [
        { id: '1', url: '/mock/progress-front.jpg', type: 'front' },
        { id: '2', url: '/mock/progress-side.jpg', type: 'side' },
        { id: '3', url: '/mock/progress-back.jpg', type: 'back' },
      ],
    },
    // Add more photo groups here
  ];

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload logic
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Progress Photos</h2>
          <button
            onClick={handlePhotoUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload New Photos
          </button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photoGroups.map((group) => (
            <button
              key={group.date}
              onClick={() => setSelectedGroup(group)}
              className="group relative aspect-square bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
            >
              {group.photos[0] && (
                <Image
                  src={group.photos[0].url}
                  alt={`Progress photos from ${new Date(group.date).toLocaleDateString()}`}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                <div className="flex items-center text-sm text-white">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  {new Date(group.date).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-auto p-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Photo Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedPhotoIndex((prev) => Math.max(0, prev - 1))}
                className="text-white hover:text-gray-300 disabled:opacity-50"
                disabled={selectedPhotoIndex === 0}
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>

              <div className="relative aspect-[3/4] w-full max-w-3xl mx-8">
                <Image
                  src={selectedGroup.photos[selectedPhotoIndex].url}
                  alt={`Progress photo ${selectedPhotoIndex + 1} of ${selectedGroup.photos.length}`}
                  fill
                  className="object-contain"
                />
              </div>

              <button
                onClick={() => setSelectedPhotoIndex((prev) => Math.min(selectedGroup.photos.length - 1, prev + 1))}
                className="text-white hover:text-gray-300 disabled:opacity-50"
                disabled={selectedPhotoIndex === selectedGroup.photos.length - 1}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </div>

            {/* Photo Info */}
            <div className="text-center text-white">
              <p className="text-sm font-medium">
                {selectedGroup.photos[selectedPhotoIndex].type.charAt(0).toUpperCase() +
                  selectedGroup.photos[selectedPhotoIndex].type.slice(1)} View
              </p>
              <p className="text-sm text-gray-400">
                {new Date(selectedGroup.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 