import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { BlockchainService } from './services/blockchain.service';
import { BalanceService } from './services/balance.service';
import { BlockCacheService } from './services/block-cache.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    BlockchainService,
    BalanceService,
    BlockCacheService,
    SchedulerService,
  ],
})
export class AppModule {}
