export type PhotoCategory = 'progress' | 'form' | 'before' | 'after';

export interface PhotoAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface PhotoComment {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  replies?: PhotoComment[];
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  url: string;
  thumbnailUrl: string;
  category: PhotoCategory;
  description?: string;
  annotations: PhotoAnnotation[];
  comments: PhotoComment[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
} 