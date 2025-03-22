import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';

interface MessagePayload {
  content: string;
  type: 'text' | 'audio' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: string;
    mimeType?: string;
  };
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const auth = getAuth();
    const token = auth.currentUser?.getIdToken();

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.fallbackToPolling();
      }
    });

    // Message events
    this.socket.on('message', (data) => {
      this.notifyListeners('message', data);
    });

    this.socket.on('typing', (data) => {
      this.notifyListeners('typing', data);
    });

    this.socket.on('read', (data) => {
      this.notifyListeners('read', data);
    });
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  private fallbackToPolling() {
    // Implement long-polling fallback
    console.log('Falling back to long-polling');
    // TODO: Implement polling mechanism
  }

  public addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public removeEventListener(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  public sendMessage(roomId: string, payload: MessagePayload) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, using fallback');
      return this.sendMessageFallback(roomId, payload);
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('message', { roomId, ...payload }, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  private async sendMessageFallback(roomId: string, payload: MessagePayload) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, ...payload }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message via fallback:', error);
      throw error;
    }
  }

  public sendTypingStatus(roomId: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, isTyping });
  }

  public markAsRead(roomId: string, messageIds: string[]) {
    this.socket?.emit('read', { roomId, messageIds });
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const websocketService = new WebSocketService(); 