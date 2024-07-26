import { Injectable } from '@nestjs/common';
import * as https from 'https';
import { BlockCacheService } from './block-cache.service';

@Injectable()
export class BlockchainService {
  private readonly apiKey = process.env.API_KEY;
  private readonly baseUrl = process.env.BASE_URL;
  private readonly delay = 200;

  constructor(private readonly cacheService: BlockCacheService) {}

  async getLastBlockNumber(): Promise<number> {
    const cachedLastBlock = this.cacheService.getLastBlockNumber();
    if (cachedLastBlock !== null && !this.cacheService.shouldUpdateCache()) {
      return cachedLastBlock;
    }

    try {
      const url = `${this.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`;
      const response = await this.httpGet(url);
      const blockNumber = parseInt(response.result, 16);
      this.cacheService.setLastBlockNumber(blockNumber);
      this.cacheService.updateLastUpdateTime();
      return blockNumber;
    } catch (error) {
      throw new Error(`Failed to fetch last block number: ${error.message}`);
    }
  }

  async getBlockTransactions(blockNumber: number): Promise<any[]> {
    const cachedBlock = this.cacheService.getBlock(blockNumber);
    if (cachedBlock) {
      return cachedBlock.transactions;
    }

    try {
      const url = `${this.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=${'0x' + blockNumber.toString(16)}&boolean=true&apikey=${this.apiKey}`;
      await this.sleep(this.delay);
      const response = await this.httpGet(url);
      const transactions = response.result.transactions;
      await this.cacheService.addBlock({ number: blockNumber, transactions });
      return transactions;
    } catch (error) {
      throw new Error(`Failed to fetch block transactions: ${error.message}`);
    }
  }

  private httpGet(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve(JSON.parse(data)));
        })
        .on('error', (err) => reject(err));
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
