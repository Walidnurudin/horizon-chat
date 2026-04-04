import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ClientToServerEvents, ServerToClientEvents, Message } from '@messaging/types';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private connectedClients: Map<string, { lastHeartbeat: number; userId: string }> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {
    setInterval(() => {
      const now = Date.now();
      for (const [clientId, data] of this.connectedClients.entries()) {
        if (now - data.lastHeartbeat > 30000) {
          console.log(`Client ${clientId} timed out.`);
          this.server.sockets.sockets.get(clientId)?.disconnect();
          this.connectedClients.delete(clientId);
        }
      }
    }, 15000);
  }

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token;
      if (!token) throw new Error('No token');
      if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }
      const payload = await this.jwtService.verifyAsync(token, { secret: 'SUPER_SECRET_KEY' });
      const userId = payload.sub;
      client.data.userId = userId;
      client.join(`user_${userId}`);
      this.connectedClients.set(client.id, { lastHeartbeat: Date.now(), userId });
      console.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (err) {
      console.log('Unauthorized connection attempt');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket): void {
    const session = this.connectedClients.get(client.id);
    if (session) {
      session.lastHeartbeat = Date.now();
      this.connectedClients.set(client.id, session);
    }
    client.emit('heartbeatAck');
  }

  @SubscribeMessage('requestHistory')
  async handleRequestHistory(
    @MessageBody() payload: { receiverId?: string } = {},
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) {
       client.emit('error', { message: 'Unauthorized' });
       return;
    }
    const messages = await this.chatService.getMessages(userId, payload.receiverId);
    client.emit('messageHistory', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: Omit<Message, 'id' | 'timestamp' | 'status'>,
    @ConnectedSocket() client: Socket,
  ): Promise<{ status: string; message: Message }> {
    this.handleHeartbeat(client);

    try {
      const savedMessage = await this.chatService.saveMessage({
        ...payload,
        senderId: client.data.userId, // ensure secure sender
      });

      if (payload.receiverId) {
        // DM
        this.server.to(`user_${payload.receiverId}`).emit('receiveMessage', savedMessage);
      } else {
        // Global
        client.broadcast.emit('receiveMessage', savedMessage);
      }

      return { status: 'ok', message: savedMessage };
    } catch (error) {
       console.error(error);
       throw error;
    }
  }
}

