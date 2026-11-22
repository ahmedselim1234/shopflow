import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PerformanceService } from '../monitoring/performance.service.js';


@WebSocketGateway({
  cors: {
    origin: '*', 
  },
  transports: ['websocket'],
})


export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly performanceService: PerformanceService) {}

  handleConnection(client: Socket) {
    this.performanceService.connectionOpened();

    console.log('Connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    this.performanceService.connectionClosed();

    console.log('Disconnected:', client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.performanceService.messageReceived();

    client.emit('pong', {
      message: 'Hello from NestJS',
      receivedData: data,
      timestamp: Date.now(),
    });
  }

  broadcastMessage(data: any) {
    this.server.emit('notification', data);
  }
}
