import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ServicesService } from 'src/services/services.service';
import { ServicesModule } from 'src/services/services.module';

@Module({
  providers: [TelegramService],
  imports:[ServicesModule]
})
export class TelegramModule {}
