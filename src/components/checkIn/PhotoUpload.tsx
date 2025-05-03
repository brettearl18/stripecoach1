import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { compressImage } from '@/lib/utils/imageCompression';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export const PhotoUpload = ({
  onPhotosChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate number of files
      if (acceptedFiles.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} photos allowed`);
      }

      // Validate file types and sizes
      const invalidFiles = acceptedFiles.filter(
        file => !acceptedTypes.includes(file.type) || file.size > maxSize
      );

      if (invalidFiles.length > 0) {
        throw new Error(
          `Invalid files detected. Please ensure files are ${acceptedTypes.join(', ')} and under ${maxSize / 1024 / 1024}MB`
        );
      }

      // Compress images for mobile
      const compressedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const compressed = await compressImage(file, {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.8
            });
            return compressed;
          } catch (error) {
            console.error('Error compressing image:', error);
            return file; // Fallback to original if compression fails
          }
        })
      );

      onPhotosChange(compressedFiles);
      toast.success('Photos uploaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [maxFiles, maxSize, acceptedTypes, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: true
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        <div className="text-center">
          <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            {isDragActive ? (
              <p className="text-sm text-gray-600">Drop the photos here...</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Drag and drop photos here, or click to select files
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: {acceptedTypes.join(', ')}
                  <br />
                  Max file size: {maxSize / 1024 / 1024}MB
                  <br />
                  Max files: {maxFiles}
                </p>
              </div>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 