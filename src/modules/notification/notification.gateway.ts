import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { UserRepository } from 'src/DB/repositories/user.repository';
import { TokenRepository } from 'src/DB/repositories/token.repository';

@WebSocketGateway({
  cors: {
    origin: true, //  يجعل السيرفر يصرح للدومين الطالب بشكل ديناميكي
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  // خريطة لتخزين المستخدمين المتصلين (userId -> Socket)
  connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly _JwtService: JwtService,
    private readonly _ConfigService: ConfigService,
    private readonly _UserRepository: UserRepository,
    private readonly _TokenRepository: TokenRepository,
  ) {}

  async handleConnection(client: Socket) {
    const authHeader =
      client.handshake.headers?.authorization ||
      client.handshake.auth?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      client.disconnect();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this._JwtService.verify(token, {
        secret: this._ConfigService.get('JWT_SECRET'),
      });

      const user = await this._UserRepository.findOne({
        filter: { _id: payload.id },
      });

      if (!user || !user.isActive)
        throw new UnauthorizedException('Invalid user');

      const tokenDoc = await this._TokenRepository.findOne({
        filter: { token, isValid: true, user: user._id as any },
      });

      if (!tokenDoc) throw new UnauthorizedException('Invalid token');

      // تخزين بيانات المستخدم في جلسة الـ Socket
      client.data.user = user;
      this.connectedUsers.set(user._id.toString(), client);

      console.log(`📡 User Connected: ${user.fullName} (${user._id})`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.connectedUsers.delete(client.data.user._id.toString());
      console.log(`🔌 User Disconnected: ${client.data.user.fullName}`);
    }
  }

  // 🚀 دالة إرسال الإشعار اللحظي لمستخدم معين
  sendNotificationToUser(userId: string, notification: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('new_notification', notification);
    }
  }
}
