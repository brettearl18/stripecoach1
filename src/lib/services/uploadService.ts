import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AudioMessage, FileAttachment } from '@/types/feedback';
import { app } from '../firebase/config';

const storage = getStorage(app);

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_DURATION = 5 * 60; // 5 minutes
const ALLOWED_FILE_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export const validateFile = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new UploadError('File type not supported');
  }
};

export const uploadAudio = async (
  feedbackId: string,
  audioBlob: Blob,
  duration: number
): Promise<AudioMessage> => {
  try {
    if (duration > MAX_AUDIO_DURATION) {
      throw new UploadError(`Audio duration must be less than ${MAX_AUDIO_DURATION / 60} minutes`);
    }

    const fileName = `audio/${feedbackId}/${Date.now()}.webm`;
    const audioRef = ref(storage, fileName);
    
    // Upload the audio file
    const uploadTask = await uploadBytesResumable(audioRef, audioBlob);
    const url = await getDownloadURL(uploadTask.ref);

    const audioMessage: AudioMessage = {
      id: fileName,
      url,
      duration,
      createdAt: new Date().toISOString()
    };

    return audioMessage;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw new UploadError('Failed to upload audio file');
  }
};

export const uploadFile = async (
  feedbackId: string,
  file: File
): Promise<FileAttachment> => {
  try {
    validateFile(file);

    const fileName = `attachments/${feedbackId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, fileName);
    
    // Upload the file
    const uploadTask = await uploadBytesResumable(fileRef, file);
    const url = await getDownloadURL(uploadTask.ref);

    const attachment: FileAttachment = {
      id: fileName,
      name: file.name,
      url,
      type: file.type,
      size: file.size,
      createdAt: new Date().toISOString()
    };

    return attachment;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('Failed to upload file');
  }
};

export const uploadFiles = async (
  feedbackId: string,
  files: File[]
): Promise<FileAttachment[]> => {
  const uploads = files.map(file => uploadFile(feedbackId, file));
  return Promise.all(uploads);
}; 