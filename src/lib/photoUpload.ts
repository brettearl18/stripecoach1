import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UploadedPhoto {
  url: string;
  path: string;
}

export async function uploadPhoto(
  file: File,
  userId: string,
  type: 'front' | 'side' | 'back'
): Promise<UploadedPhoto> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${type}/${timestamp}-${file.name}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, filename);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: filename
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
} 