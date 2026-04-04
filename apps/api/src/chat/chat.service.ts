import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@messaging/types';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(msg: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
    const saved = await this.prisma.message.create({
      data: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId || null,
        timestamp: Date.now(),
        status: 'sent',
      },
    });
    return saved as Message;
  }

  async getMessages(userId: string, receiverId?: string): Promise<Message[]> {
    if (receiverId) {
      const msgs = await this.prisma.message.findMany({
        where: {
          OR: [
             { senderId: userId, receiverId: receiverId },
             { senderId: receiverId, receiverId: userId },
          ]
        },
        orderBy: { timestamp: 'asc' },
      });
      return msgs as Message[];
    } else {
      const msgs = await this.prisma.message.findMany({
        where: { receiverId: null },
        orderBy: { timestamp: 'asc' },
      });
      return msgs as Message[];
    }
  }
}

