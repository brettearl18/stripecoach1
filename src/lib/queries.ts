import { prisma } from './prisma';
import { MessageType, MessageStatus, UserType } from '@prisma/client';

export async function getClientsWithStats(coachId: string) {
  return prisma.client.findMany({
    where: {
      coachId,
    },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      sentMessages: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          type: true,
          status: true,
          createdAt: true,
        },
      },
      receivedMessages: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          type: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      lastLoginAt: 'desc',
    },
  });
}

export async function getClientMessages(clientId: string, limit = 50, cursor?: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: clientId },
        { receiverId: clientId },
      ],
    },
    include: {
      attachments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
  });
}

export async function getUnreadMessages(coachId: string) {
  return prisma.message.findMany({
    where: {
      receiverId: coachId,
      receiverType: UserType.COACH,
      status: MessageStatus.SENT,
    },
    include: {
      clientSender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attachments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getMessageStats(coachId: string) {
  const [totalMessages, unreadCount, urgentCount, checkInCount] = await Promise.all([
    prisma.message.count({
      where: {
        OR: [
          { receiverId: coachId, receiverType: UserType.COACH },
          { senderId: coachId, senderType: UserType.COACH },
        ],
      },
    }),
    prisma.message.count({
      where: {
        receiverId: coachId,
        receiverType: UserType.COACH,
        status: MessageStatus.SENT,
      },
    }),
    prisma.message.count({
      where: {
        receiverId: coachId,
        receiverType: UserType.COACH,
        type: MessageType.URGENT,
        status: MessageStatus.SENT,
      },
    }),
    prisma.message.count({
      where: {
        receiverId: coachId,
        receiverType: UserType.COACH,
        type: MessageType.CHECK_IN,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  return {
    totalMessages,
    unreadCount,
    urgentCount,
    checkInCount,
  };
} 