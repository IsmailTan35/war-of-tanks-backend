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
  seed: number;
  setInterval: any;
  generateTenDigitNumber() {
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  constructor() {
    this.seed = this.generateTenDigitNumber();
    setInterval(() => {
      this.seed = this.generateTenDigitNumber();
    }, 10 * 60 * 1000);
  }
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
    clearInterval(this.pingInterval);
  }

  @SubscribeMessage('get-users')
  handleMessage(client: Socket, payload: string): void {
    const userObjects = Array.from(this.server.sockets.sockets.keys())
      .filter((clientId) => clientId !== client.id)
      .map((clientId) => {
        return {
          id: clientId,
          name: this.server.sockets.sockets.get(clientId).handshake.query.name,
        };
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
  @SubscribeMessage('hand-break')
  handleHandBreak(client: Socket, payload: any): void {
    client.broadcast.emit('remote-hand-break', {
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
  triggerMachineGun;
  @SubscribeMessage('triggerFiring')
  handleTriggerFiring(client: Socket, payload: any): void {
    client.broadcast.emit('remote-open-fire', {
      id: client.id,
    });
  }
  @SubscribeMessage('triggerMachineGun')
  handleTriggerMachineGun(client: Socket, payload: any): void {
    client.broadcast.emit('remote-open-fire-machine-gun', {
      id: client.id,
    });
  }
  @SubscribeMessage('set-name')
  handleSet(client: Socket, payload: any): void {
    client.handshake.query.name = payload;
    client.emit('set-name', payload);
    client.broadcast.emit('remote-set-name', {
      id: client.id,
      name: payload,
    });
  }
  @SubscribeMessage('hit')
  handlePlayerHit(client: Socket, payload: any): void {
    client.emit('blowup-player');
    client.broadcast.emit('remote-hit', {
      id: client.id,
      position: payload,
    });
  }
  @SubscribeMessage('send-seed')
  handleGetSeed(client: Socket, payload: any): void {
    console.log(this.seed);
    client.emit('get-seed', this.seed);
  }
  @SubscribeMessage('dead')
  handleDead(client: Socket, payload: any): void {
    client.broadcast.emit('remote-dead', {
      killerId: payload.killerId,
      victimId: client.id,
    });
  }
}
