import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LobbyService } from './lobby.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class LobbyGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  @SubscribeMessage('get_available_rooms')
  handleGetAvailableRooms() {
    return { rooms: this.lobbyService.getAvailableRooms() };
  }
}
