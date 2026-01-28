import { Module, Global } from '@nestjs/common';
import { RatingService } from './rating.service';

@Global()
@Module({
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
