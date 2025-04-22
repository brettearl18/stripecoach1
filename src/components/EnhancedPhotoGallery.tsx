'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProgressPhoto, PhotoCategory, PhotoAnnotation, PhotoComment } from '@/types/photo';
import { format } from 'date-fns';
import { Share2, MessageSquare, Tag, Eye } from 'lucide-react';

interface EnhancedPhotoGalleryProps {
  clientId: string;
}

export default function EnhancedPhotoGallery({ clientId }: EnhancedPhotoGalleryProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('progress');
  const [newAnnotation, setNewAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'progressPhotos'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgressPhoto[];
      setPhotos(photoData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPhoto || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNewAnnotation({ x, y });
  };

  const handleAddAnnotation = async (text: string) => {
    if (!selectedPhoto || !newAnnotation) return;

    const annotation: PhotoAnnotation = {
      id: Date.now().toString(),
      ...newAnnotation,
      text,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id' // Replace with actual user ID
    };

    await updateDoc(doc(db, 'progressPhotos', selectedPhoto.id), {
      annotations: [...selectedPhoto.annotations, annotation]
    });

    setNewAnnotation(null);
  };

  const handleAddComment = async () => {
    if (!selectedPhoto || !newComment.trim()) return;

    const comment: PhotoComment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id' // Replace with actual user ID
    };

    await updateDoc(doc(db, 'progressPhotos', selectedPhoto.id), {
      comments: [...selectedPhoto.comments, comment]
    });

    setNewComment('');
  };

  const generateShareLink = async (photo: ProgressPhoto) => {
    if (!photo.shareToken) {
      const shareToken = Math.random().toString(36).substring(2);
      await updateDoc(doc(db, 'progressPhotos', photo.id), {
        shareToken,
        isPublic: true
      });
    }
    return `${window.location.origin}/shared-photo/${photo.shareToken}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading photos...</div>;
  }

  const filteredPhotos = photos.filter(photo => photo.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PhotoCategory)}>
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="form">Form Check</TabsTrigger>
          <TabsTrigger value="before">Before</TabsTrigger>
          <TabsTrigger value="after">After</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.thumbnailUrl}
              alt="Progress photo"
              fill
              className="object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
              <p className="text-white text-sm">{format(new Date(photo.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{format(new Date(selectedPhoto?.createdAt || ''), 'MMMM d, yyyy')}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedPhoto && generateShareLink(selectedPhoto)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                ref={imageRef}
                className="relative aspect-square cursor-crosshair"
                onClick={handleImageClick}
              >
                <Image
                  src={selectedPhoto.url}
                  alt="Progress photo"
                  fill
                  className="object-contain rounded-lg"
                />
                {selectedPhoto.annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="bg-white/90 rounded-lg p-2 shadow-lg">
                      <p className="text-sm">{annotation.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedPhoto.description || 'No description'}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Comments</h3>
                  <div className="space-y-4">
                    {selectedPhoto.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button onClick={handleAddComment}>Post</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {newAnnotation && (
        <Dialog open={!!newAnnotation} onOpenChange={() => setNewAnnotation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Annotation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter annotation text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddAnnotation(e.currentTarget.value);
                  }
                }}
              />
              <Button onClick={() => handleAddAnnotation('')}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 