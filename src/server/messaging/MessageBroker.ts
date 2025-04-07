import { Kafka, Producer, Consumer } from 'kafkajs';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

interface MessageBrokerConfig {
  kafka: {
    brokers: string[];
    clientId: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export class MessageBroker {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private redis: Redis;
  private subscriberRedis: Redis;
  private readonly BATCH_SIZE = 100;
  private readonly MESSAGE_RETENTION = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(config: MessageBrokerConfig) {
    // Initialize Kafka
    this.kafka = new Kafka({
      brokers: config.kafka.brokers,
      clientId: config.kafka.clientId,
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 100,
      idempotent: true,
      transactionalId: `producer-${uuidv4()}`,
    });

    // Initialize Redis for message storage and pub/sub
    this.redis = new Redis(config.redis);
    this.subscriberRedis = new Redis(config.redis);
  }

  async initialize() {
    await this.producer.connect();
    await this.setupConsumers();
  }

  private async setupConsumers() {
    // Create consumers for different message types
    const messageTypes = ['direct', 'broadcast', 'notification'];
    
    for (const type of messageTypes) {
      const consumer = this.kafka.consumer({ 
        groupId: `${type}-group-${uuidv4()}`,
        maxInFlightRequests: 100,
        sessionTimeout: 30000,
      });

      await consumer.connect();
      await consumer.subscribe({ 
        topic: `messages-${type}`,
        fromBeginning: false 
      });

      await consumer.run({
        partitionsConsumedConcurrently: 3,
        eachBatchAutoResolve: true,
        autoCommitInterval: 5000,
        eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
          const messages = batch.messages.map(m => JSON.parse(m.value!.toString()));
          
          for (const message of messages) {
            try {
              await this.processMessage(message, type);
              await resolveOffset(message.offset);
              await heartbeat();
            } catch (error) {
              console.error(`Error processing message: ${error}`);
            }
          }
        },
      });

      this.consumers.set(type, consumer);
    }
  }

  private async processMessage(message: any, type: string) {
    const { tenantId, senderId, recipientId } = message;

    // Store message in Redis with tenant-specific prefix
    const messageKey = `tenant:${tenantId}:message:${message.id}`;
    await this.redis.setex(messageKey, this.MESSAGE_RETENTION, JSON.stringify(message));

    // Add to conversation timeline
    const conversationKey = `tenant:${tenantId}:conversation:${senderId}:${recipientId}`;
    await this.redis.zadd(conversationKey, message.timestamp, message.id);

    // Publish to Redis channels for real-time delivery
    const channels = [
      `tenant:${tenantId}:user:${recipientId}`,
      `tenant:${tenantId}:conversation:${senderId}:${recipientId}`
    ];

    for (const channel of channels) {
      await this.redis.publish(channel, JSON.stringify(message));
    }
  }

  async sendMessage(message: any) {
    const { type = 'direct', tenantId } = message;

    try {
      // Send to Kafka
      await this.producer.send({
        topic: `messages-${type}`,
        messages: [{
          key: `${tenantId}-${message.id}`,
          value: JSON.stringify(message),
          partition: this.getPartition(tenantId)
        }],
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private getPartition(tenantId: string): number {
    // Implement consistent hashing for tenant-based partitioning
    const hash = Array.from(tenantId).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return Math.abs(hash) % 10; // Assuming 10 partitions
  }

  async subscribeToMessages(tenantId: string, userId: string, callback: (message: any) => void) {
    const channels = [
      `tenant:${tenantId}:user:${userId}`,
      `tenant:${tenantId}:broadcast`
    ];

    for (const channel of channels) {
      await this.subscriberRedis.subscribe(channel);
    }

    this.subscriberRedis.on('message', (channel, message) => {
      if (channels.includes(channel)) {
        callback(JSON.parse(message));
      }
    });
  }

  async getConversationHistory(tenantId: string, userId1: string, userId2: string, options: {
    limit?: number;
    before?: number;
  } = {}) {
    const { limit = 50, before = Date.now() } = options;
    const conversationKey = `tenant:${tenantId}:conversation:${userId1}:${userId2}`;

    // Get message IDs from conversation timeline
    const messageIds = await this.redis.zrevrangebyscore(
      conversationKey,
      before,
      '-inf',
      'LIMIT',
      0,
      limit
    );

    // Get message contents
    const messages = await Promise.all(
      messageIds.map(async (id) => {
        const message = await this.redis.get(`tenant:${tenantId}:message:${id}`);
        return message ? JSON.parse(message) : null;
      })
    );

    return messages.filter(Boolean);
  }

  async cleanup() {
    await Promise.all([
      this.producer.disconnect(),
      ...Array.from(this.consumers.values()).map(consumer => consumer.disconnect()),
      this.redis.quit(),
      this.subscriberRedis.quit()
    ]);
  }
} 