import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// GET /api/messages
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    let messages;
    if (conversationId) {
      // Get messages from specific conversation
      const key = `conversation:${conversationId}`;
      const messageIds = await redis.zrevrange(key, 0, limit - 1);
      messages = await Promise.all(
        messageIds.map(async (id) => {
          const message = await redis.get(`message:${id}`);
          return message ? JSON.parse(message) : null;
        })
      );
    } else {
      // Get all messages for user
      const userKey = `user:${session.user.id}:messages`;
      const messageIds = await redis.zrevrange(userKey, 0, limit - 1);
      messages = await Promise.all(
        messageIds.map(async (id) => {
          const message = await redis.get(`message:${id}`);
          return message ? JSON.parse(message) : null;
        })
      );
    }

    // Filter out null messages and sort by timestamp
    messages = messages
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, recipientId, type, audioUrl } = body;

    // Validate request
    if (!recipientId || (!content && !audioUrl)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = {
      id: Date.now().toString(),
      senderId: session.user.id,
      recipientId,
      content,
      audioUrl,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Store message
    await redis.set(`message:${message.id}`, JSON.stringify(message));

    // Add to conversation timeline
    const conversationId = [session.user.id, recipientId].sort().join(':');
    await redis.zadd(`conversation:${conversationId}`, Date.now(), message.id);

    // Add to user timelines
    await redis.zadd(`user:${session.user.id}:messages`, Date.now(), message.id);
    await redis.zadd(`user:${recipientId}:messages`, Date.now(), message.id);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/:id
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = req.url.split('/').pop();
    const body = await req.json();
    const { status } = body;

    // Get existing message
    const messageStr = await redis.get(`message:${messageId}`);
    if (!messageStr) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const message = JSON.parse(messageStr);

    // Verify user has permission to update message
    if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update message
    message.status = status;
    await redis.set(`message:${messageId}`, JSON.stringify(message));

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/:id
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = req.url.split('/').pop();

    // Get message
    const messageStr = await redis.get(`message:${messageId}`);
    if (!messageStr) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const message = JSON.parse(messageStr);

    // Verify user has permission to delete message
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete message
    await redis.del(`message:${messageId}`);

    // Remove from conversation timeline
    const conversationId = [message.senderId, message.recipientId].sort().join(':');
    await redis.zrem(`conversation:${conversationId}`, messageId);

    // Remove from user timelines
    await redis.zrem(`user:${message.senderId}:messages`, messageId);
    await redis.zrem(`user:${message.recipientId}:messages`, messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 