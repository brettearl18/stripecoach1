import { Server } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest } from 'next';
import { Redis } from 'ioredis';

// Redis client for message caching and persistence
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

interface CustomSocket extends Socket {
  userId?: string;
  userType?: 'coach' | 'client';
}

class ChatServer {
  private io: Server;
  private activeConnections: Map<string, Set<string>> = new Map();

  constructor(server: ReturnType<typeof createServer>) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: CustomSocket) => {
      console.log('New client connected');

      // Authenticate user
      socket.on('authenticate', async (token: string) => {
        try {
          const userData = await this.verifyToken(token);
          socket.userId = userData.id;
          socket.userType = userData.type;

          // Add to active connections
          this.addActiveConnection(userData.id, socket.id);

          // Join user-specific room
          socket.join(`user:${userData.id}`);

          // If coach, join their coach room
          if (userData.type === 'coach') {
            socket.join(`coach:${userData.id}`);
          }

          socket.emit('authenticated');
        } catch (error) {
          socket.emit('auth_error', 'Invalid token');
          socket.disconnect();
        }
      });

      // Handle new messages
      socket.on('message', async (message) => {
        try {
          if (!socket.userId) {
            throw new Error('User not authenticated');
          }

          // Validate message
          this.validateMessage(message);

          // Store message in Redis
          await this.storeMessage(message);

          // Determine recipients and emit message
          await this.broadcastMessage(message);

          socket.emit('message_sent', { id: message.id });
        } catch (error) {
          socket.emit('message_error', {
            id: message.id,
            error: error.message,
          });
        }
      });

      // Handle read receipts
      socket.on('read_receipt', async (data) => {
        try {
          if (!socket.userId) {
            throw new Error('User not authenticated');
          }

          await this.markMessageAsRead(data.messageId, socket.userId);
          
          // Notify relevant users about read receipt
          this.broadcastReadReceipt(data.messageId, socket.userId);
        } catch (error) {
          socket.emit('read_receipt_error', {
            messageId: data.messageId,
            error: error.message,
          });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        if (!socket.userId) return;

        this.io.to(`user:${data.recipientId}`).emit('typing', {
          userId: socket.userId,
          conversationId: data.conversationId,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.removeActiveConnection(socket.userId, socket.id);
        }
        console.log('Client disconnected');
      });
    });
  }

  private async verifyToken(token: string) {
    // Implement token verification logic
    // This should validate the JWT token and return user data
    return { id: '123', type: 'coach' }; // Placeholder
  }

  private validateMessage(message: any) {
    // Implement message validation
    if (!message.content && !message.audioUrl) {
      throw new Error('Message must have content or audio');
    }
  }

  private async storeMessage(message: any) {
    // Store message in Redis
    const key = `message:${message.id}`;
    await redis.set(key, JSON.stringify(message));
    
    // Add to conversation timeline
    const conversationKey = `conversation:${message.conversationId}`;
    await redis.zadd(conversationKey, Date.now(), message.id);
  }

  private async broadcastMessage(message: any) {
    // Emit to recipient
    this.io.to(`user:${message.recipientId}`).emit('message', message);
    
    // If recipient is offline, store for delivery
    if (!this.isUserOnline(message.recipientId)) {
      await this.storeUndeliveredMessage(message);
    }
  }

  private async markMessageAsRead(messageId: string, userId: string) {
    const key = `message:${messageId}`;
    const message = await redis.get(key);
    
    if (message) {
      const parsedMessage = JSON.parse(message);
      parsedMessage.readBy = parsedMessage.readBy || [];
      parsedMessage.readBy.push(userId);
      await redis.set(key, JSON.stringify(parsedMessage));
    }
  }

  private broadcastReadReceipt(messageId: string, userId: string) {
    this.io.to(`message:${messageId}`).emit('read_receipt', {
      messageId,
      userId,
      timestamp: Date.now(),
    });
  }

  private addActiveConnection(userId: string, socketId: string) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set());
    }
    this.activeConnections.get(userId)!.add(socketId);
  }

  private removeActiveConnection(userId: string, socketId: string) {
    const userConnections = this.activeConnections.get(userId);
    if (userConnections) {
      userConnections.delete(socketId);
      if (userConnections.size === 0) {
        this.activeConnections.delete(userId);
      }
    }
  }

  private isUserOnline(userId: string): boolean {
    return this.activeConnections.has(userId);
  }

  private async storeUndeliveredMessage(message: any) {
    const key = `undelivered:${message.recipientId}`;
    await redis.lpush(key, JSON.stringify(message));
  }

  // Method to deliver pending messages when user comes online
  private async deliverPendingMessages(userId: string) {
    const key = `undelivered:${userId}`;
    const messages = await redis.lrange(key, 0, -1);
    
    for (const messageStr of messages) {
      const message = JSON.parse(messageStr);
      this.io.to(`user:${userId}`).emit('message', message);
    }
    
    // Clear delivered messages
    await redis.del(key);
  }
}

export default ChatServer; 