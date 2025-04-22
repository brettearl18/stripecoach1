'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProgressPhotoUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export default function ProgressPhotoUpload({ clientId, onUploadComplete }: ProgressPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    try {
      setUploading(true);
      setUploadProgress(0);

      const storage = getStorage();
      const storageRef = ref(storage, `progress-photos/${clientId}/${Date.now()}_${file.name}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload photo');
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save photo metadata to Firestore
            await addDoc(collection(db, 'progressPhotos'), {
              clientId,
              url: downloadURL,
              timestamp: serverTimestamp(),
              fileName: file.name,
              size: file.size,
              type: file.type
            });

            toast.success('Photo uploaded successfully');
            setPreview(null);
            onUploadComplete?.();
          } catch (error) {
            console.error('Error saving photo metadata:', error);
            toast.error('Failed to save photo details');
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setUploading(false);
    }
  }, [clientId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Progress value={uploadProgress} className="w-64" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the photo here' : 'Drag & drop a photo here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: JPEG, PNG (max 5MB)
            </p>
          </div>
        )}
      </div>
      
      {preview && !uploading && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreview(null)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onDrop([new File([preview], 'photo.jpg', { type: 'image/jpeg' })])}
            disabled={uploading}
          >
            Upload
          </Button>
        </div>
      )}
    </div>
  );
} 