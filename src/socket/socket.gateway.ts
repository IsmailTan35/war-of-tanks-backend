import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;
  pingInterval: any;
  handleConnection(client: Socket) {
    client.broadcast.emit('joined-user', {
      id: client.id,
    });
  }
  handleDisconnect(client: Socket) {
    client.broadcast.emit('left-user', {
      id: client.id,
    });
    clearInterval(this.pingInterval);
  }
  @SubscribeMessage('startPing')
  startPing(client: Socket, payload: string): void {
    console.log('Ping started');
    this.pingInterval = setInterval(() => {
      const startTime = new Date().getTime();
      client.emit('ping', startTime);
    }, 1000);
  }
  @SubscribeMessage('pong')
  pong(client: Socket, startTime: any): void {
    const endTime = new Date().getTime();
    const pingTime = endTime - startTime;
    client.emit('pingResult', pingTime);
  }
  @SubscribeMessage('stopPing')
  stopPing(client: Socket, payload: string): void {
    console.log('Ping stopped');
    clearInterval(this.pingInterval);
  }

  @SubscribeMessage('get-users')
  handleMessage(client: Socket, payload: string): void {
    const userObjects = Array.from(this.server.sockets.sockets.keys())
      .filter((clientId) => clientId !== client.id)
      .map((clientId) => {
        return { id: clientId };
      });
    client.emit('users', userObjects);
  }
  @SubscribeMessage('position')
  handlePosition(client: Socket, payload: any): void {
    client.broadcast.emit('position', {
      id: client.id,
      position: payload,
    });
  }

  @SubscribeMessage('quaternion')
  handleQuaternion(client: Socket, payload: any): void {
    client.broadcast.emit('quaternion', {
      id: client.id,
      position: payload,
    });
  }
  @SubscribeMessage('turret-rotation')
  handleTurretRotation(client: Socket, payload: any): void {
    client.broadcast.emit('remote-turret-rotation', {
      id: client.id,
      rotation: payload,
    });
  }
  @SubscribeMessage('triggerFiring')
  handleTriggerFiring(client: Socket, payload: any): void {
    console.log(213);
    client.broadcast.emit('remote-open-fire', {
      id: client.id,
    });
  }
}
