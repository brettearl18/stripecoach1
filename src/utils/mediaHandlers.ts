import { AudioMessage, FileAttachment } from '@/types/coach';

export const startAudioRecording = async (): Promise<MediaRecorder> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return new MediaRecorder(stream);
};

export const stopAudioRecording = (mediaRecorder: MediaRecorder): void => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    const tracks = mediaRecorder.stream.getTracks();
    tracks.forEach(track => track.stop());
  }
};

export const calculateAudioDuration = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    });
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const validateFile = (file: File): boolean => {
  // Add your file validation logic here
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  return true;
};

export const createFileAttachment = (file: File): FileAttachment => {
  return {
    id: Date.now(),
    name: file.name,
    type: file.type,
    size: formatFileSize(file.size),
    url: URL.createObjectURL(file)
  };
};

export const createAudioMessage = (blob: Blob, duration: string): AudioMessage => {
  return {
    id: Date.now(),
    url: URL.createObjectURL(blob),
    duration,
    timestamp: new Date().toISOString()
  };
}; 