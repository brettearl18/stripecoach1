import { useState } from 'react';
import Link from 'next/link';
import { 
  CameraIcon, 
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';

// Sample data - would come from your backend
const samplePhotos = [
  {
    id: 1,
    date: '2024-03-20',
    type: 'Front',
    url: '/images/progress-1.jpg',
  },
  {
    id: 2,
    date: '2024-02-20',
    type: 'Side',
    url: '/images/progress-2.jpg',
  },
  {
    id: 3,
    date: '2024-01-20',
    type: 'Back',
    url: '/images/progress-3.jpg',
  },
  {
    id: 4,
    date: '2023-12-20',
    type: 'Front',
    url: '/images/progress-4.jpg',
  }
];

export default function ProgressGallery() {
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  
  // Calculate next photo due date (example: monthly photos)
  const lastPhotoDate = new Date(samplePhotos[0].date);
  const nextDueDate = new Date(lastPhotoDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  
  const daysUntilNext = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-[#1F2937] rounded-xl p-6 shadow-lg border border-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Progress Gallery</h2>
          <span className="text-xs text-gray-400">
            ({samplePhotos.length} photos)
          </span>
        </div>
        <Link
          href="/client/photos"
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {samplePhotos.slice(0, 4).map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-[#374151] group"
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
          >
            <img
              src={photo.url}
              alt={`Progress photo from ${photo.date}`}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-200 ${
              hoveredPhoto === photo.id ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">
                    {format(new Date(photo.date), 'MMM d, yyyy')}
                  </span>
                  <span className="text-xs text-gray-300 px-2 py-1 bg-black/30 rounded-full">
                    {photo.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Status */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>Last upload: {formatDistanceToNow(lastPhotoDate, { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4 text-green-400" />
            <span className="text-gray-400">
              Next due: {daysUntilNext} days
            </span>
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex items-center gap-1 justify-center">
          {[0, 1, 2, 3, 4, 5].map((month) => (
            <div
              key={month}
              className={`h-1.5 w-1.5 rounded-full ${
                month < 4 ? 'bg-indigo-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Upload Button */}
      <Link
        href="/client/photos/upload"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        <CameraIcon className="h-5 w-5" />
        <span>Upload New Photo</span>
      </Link>
    </div>
  );
} 