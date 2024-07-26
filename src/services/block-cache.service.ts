import { Injectable } from '@nestjs/common';

interface Block {
  number: number;
  transactions: any[];
}

@Injectable()
export class BlockCacheService {
  private readonly cacheSize = 100;
  private blocks: Map<number, Block> = new Map();
  private lastBlockNumber: number | null = null;
  private lastUpdateTime: number = Date.now();

  setLastBlockNumber(number: number) {
    this.lastBlockNumber = number;
  }

  getLastBlockNumber(): number | null {
    return this.lastBlockNumber;
  }

  async addBlock(block: Block) {
    if (this.blocks.size >= this.cacheSize) {
      this.removeOldestBlock();
    }
    this.blocks.set(block.number, block);
  }

  getBlock(number: number): Block | undefined {
    return this.blocks.get(number);
  }

  shouldUpdateCache(): boolean {
    return Date.now() - this.lastUpdateTime > 10000;
  }

  updateLastUpdateTime() {
    this.lastUpdateTime = Date.now();
  }

  private removeOldestBlock() {
    const oldestBlockNumber = Math.min(...this.blocks.keys());
    this.blocks.delete(oldestBlockNumber);
  }
}
