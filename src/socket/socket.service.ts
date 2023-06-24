import { Injectable } from '@nestjs/common';
@Injectable()
export class SocketService {
  public getHello(): string {
    return 'Hello World!';
  }
}
