import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
  private client;
  private readonly cacheSize = 100;
  private lastUpdateTime: number = Date.now();
  private blockKeys: string[] = [];

  async onModuleInit() {
    this.client = createClient();
    await this.client.connect();
  }

  async setLastBlockNumber(number: number): Promise<void> {
    await this.client.set('lastBlockNumber', number.toString());
  }

  async getLastBlockNumber(): Promise<number | null> {
    const blockNumber = await this.client.get('lastBlockNumber');
    return blockNumber ? parseInt(blockNumber, 10) : null;
  }

  async addBlock(block: {
    number: number;
    transactions: any[];
  }): Promise<void> {
    const blockKey = `block:${block.number}`;
    const transactions = JSON.stringify(block.transactions);

    await this.client.set(blockKey, transactions);
    this.blockKeys.push(blockKey);

    if (this.blockKeys.length > this.cacheSize) {
      const oldestBlockKey = this.blockKeys.shift();
      if (oldestBlockKey) {
        await this.client.del(oldestBlockKey);
      }
    }
  }

  async getBlock(
    number: number,
  ): Promise<{ number: number; transactions: any[] } | undefined> {
    const blockKey = `block:${number}`;
    const transactions = await this.client.get(blockKey);
    return transactions
      ? { number, transactions: JSON.parse(transactions) }
      : undefined;
  }

  shouldUpdateCache(): boolean {
    return Date.now() - this.lastUpdateTime > 10000;
  }

  updateLastUpdateTime(): void {
    this.lastUpdateTime = Date.now();
  }
}
