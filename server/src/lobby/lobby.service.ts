import { Injectable } from '@nestjs/common';
import { GameService } from '../game/game.service';

@Injectable()
export class LobbyService {
  constructor(private readonly gameService: GameService) {}

  getAvailableRooms() {
    return this.gameService.getAllRooms().filter(room => room.phase === 'WAITING');
  }
}
