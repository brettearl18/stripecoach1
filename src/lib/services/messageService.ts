import { db } from '../firebase/config';
import { websocketService } from './websocketService';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'audio' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: string;
    mimeType?: string;
  };
  timestamp: Date;
  readBy: string[];
}

export interface Room {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class MessageService {
  private readonly MESSAGES_PER_PAGE = 50;

  public async createRoom(participants: string[], type: 'direct' | 'group', name?: string): Promise<string> {
    try {
      // For direct messages, check if room already exists
      if (type === 'direct') {
        const existingRoom = await this.findDirectMessageRoom(participants);
        if (existingRoom) {
          return existingRoom.id;
        }
      }

      const roomRef = await db.collection('rooms').add({
        type,
        name,
        participants,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return roomRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  private async findDirectMessageRoom(participants: string[]): Promise<Room | null> {
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(
        roomsRef,
        where('type', '==', 'direct'),
        where('participants', '==', participants.sort())
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Room;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding direct message room:', error);
      throw error;
    }
  }

  public async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomDoc = await db.collection('rooms').doc(roomId).get();
      if (!roomDoc.exists) {
        return null;
      }
      
      return {
        id: roomDoc.id,
        ...roomDoc.data()
      } as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  public async getUserRooms(userId: string): Promise<Room[]> {
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(
        roomsRef,
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error) {
      console.error('Error getting user rooms:', error);
      throw error;
    }
  }

  public async getMessages(roomId: string, lastMessageId?: string): Promise<Message[]> {
    try {
      let q = query(
        collection(db, 'messages'),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'desc'),
        limit(this.MESSAGES_PER_PAGE)
      );

      if (lastMessageId) {
        const lastMessageDoc = await db.collection('messages').doc(lastMessageId).get();
        q = query(q, startAfter(lastMessageDoc));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  public async sendMessage(roomId: string, senderId: string, content: string, type: 'text' | 'audio' | 'file', metadata?: any): Promise<string> {
    try {
      // Send via WebSocket
      const response = await websocketService.sendMessage(roomId, {
        content,
        type,
        metadata
      });

      return response.messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async markAsRead(roomId: string, userId: string, messageIds: string[]): Promise<void> {
    try {
      await websocketService.markAsRead(roomId, messageIds);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  public sendTypingStatus(roomId: string, isTyping: boolean): void {
    websocketService.sendTypingStatus(roomId, isTyping);
  }

  public async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService(); 