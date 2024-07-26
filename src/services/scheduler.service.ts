import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainService } from './blockchain.service';
import { BlockCacheService } from './block-cache.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly maxRequestsPerSecond = 5;
  private readonly requestInterval = 1000 / this.maxRequestsPerSecond;

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly cacheService: BlockCacheService,
  ) {}

  onModuleInit() {
    this.updateBlocks();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateBlocks() {
    if (!this.cacheService.shouldUpdateCache()) {
      return;
    }

    const lastBlockNumber = await this.blockchainService.getLastBlockNumber();
    this.cacheService.setLastBlockNumber(lastBlockNumber);

    for (let i = lastBlockNumber; i > lastBlockNumber - 100; i--) {
      if (!this.cacheService.getBlock(i)) {
        await this.blockchainService.getBlockTransactions(i);
        await this.delayRequest();
      }
    }

    this.cacheService.updateLastUpdateTime();
  }

  private delayRequest() {
    return new Promise((resolve) => setTimeout(resolve, this.requestInterval));
  }
}
