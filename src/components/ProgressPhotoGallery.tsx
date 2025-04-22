'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Photo {
  id: string;
  url: string;
  timestamp: any;
  fileName: string;
}

interface ProgressPhotoGalleryProps {
  clientId: string;
}

export default function ProgressPhotoGallery({ clientId }: ProgressPhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'progressPhotos'),
      where('clientId', '==', clientId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  if (loading) {
    return <div className="text-center py-8">Loading photos...</div>;
  }

  if (photos.length === 0) {
    return <div className="text-center py-8 text-gray-500">No photos uploaded yet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.url}
              alt="Progress photo"
              fill
              className="object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoto?.timestamp?.toDate().toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="relative aspect-square">
              <Image
                src={selectedPhoto.url}
                alt="Progress photo"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 