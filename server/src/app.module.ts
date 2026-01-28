import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { LobbyModule } from './lobby/lobby.module';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [GameModule, LobbyModule, RatingModule],
})
export class AppModule {}
