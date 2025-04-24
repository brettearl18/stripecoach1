import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UploadedPhoto {
  url: string;
  path: string;
}

export async function uploadPhoto(
  file: File,
  userId: string,
  type: string
): Promise<UploadedPhoto> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `progress-photos/${userId}/${Date.now()}_${type}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
} 