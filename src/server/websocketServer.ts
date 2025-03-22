import { Server } from 'socket.io';
import { createServer } from 'http';
import { auth } from 'firebase-admin';
import { db } from '../lib/firebase/config';

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

interface User {
  id: string;
  rooms: string[];
}

class WebSocketServer {
  private io: Server;
  private connectedUsers: Map<string, User> = new Map();

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decodedToken = await auth().verifyIdToken(token);
        socket.data.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
        };
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user.id;
      
      // Add user to connected users
      this.connectedUsers.set(userId, {
        id: userId,
        rooms: [],
      });

      // Join user's rooms
      this.joinUserRooms(socket, userId);

      socket.on('message', async (data, callback) => {
        try {
          const { roomId, content, type, metadata } = data;
          
          // Validate room access
          if (!this.connectedUsers.get(userId)?.rooms.includes(roomId)) {
            throw new Error('Unauthorized access to room');
          }

          // Store message in Firebase
          const messageRef = await db.collection('messages').add({
            roomId,
            senderId: userId,
            content,
            type,
            metadata,
            timestamp: new Date(),
            readBy: [],
          });

          // Broadcast to room
          socket.to(roomId).emit('message', {
            id: messageRef.id,
            roomId,
            senderId: userId,
            content,
            type,
            metadata,
            timestamp: new Date(),
          });

          callback({ success: true, messageId: messageRef.id });
        } catch (error) {
          console.error('Error handling message:', error);
          callback({ error: 'Failed to send message' });
        }
      });

      socket.on('typing', (data) => {
        const { roomId, isTyping } = data;
        socket.to(roomId).emit('typing', {
          userId,
          roomId,
          isTyping,
        });
      });

      socket.on('read', async (data) => {
        try {
          const { roomId, messageIds } = data;
          
          // Update messages as read
          const batch = db.batch();
          messageIds.forEach((messageId: string) => {
            const messageRef = db.collection('messages').doc(messageId);
            batch.update(messageRef, {
              readBy: auth.FieldValue.arrayUnion(userId),
            });
          });
          await batch.commit();

          // Broadcast read status
          socket.to(roomId).emit('read', {
            userId,
            roomId,
            messageIds,
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(userId);
      });
    });
  }

  private async joinUserRooms(socket: any, userId: string) {
    try {
      // Get user's rooms from Firebase
      const roomsSnapshot = await db
        .collection('rooms')
        .where('participants', 'array-contains', userId)
        .get();

      const rooms = roomsSnapshot.docs.map(doc => doc.id);
      
      // Join each room
      rooms.forEach(roomId => {
        socket.join(roomId);
      });

      // Update connected user's rooms
      const user = this.connectedUsers.get(userId);
      if (user) {
        user.rooms = rooms;
        this.connectedUsers.set(userId, user);
      }
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }
}

// Create and export server instance
const httpServer = createServer();
export const websocketServer = new WebSocketServer(httpServer);

// Start server
const PORT = process.env.WEBSOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
}); 