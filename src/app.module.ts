import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { PrismaModule } from './prisma/prisma.module';
import { MasterModule } from './master/master.module';

@Module({
  imports: [TelegramModule, ConfigModule.forRoot({
    isGlobal: true,
  }), ServicesModule, PrismaModule, MasterModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
