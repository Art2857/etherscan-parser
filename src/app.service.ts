import { Injectable } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class AppService {
  private readonly apiKey = process.env.API_KEY;
  private readonly baseUrl = process.env.BASE_URL;
  private readonly delay = 200;

  async getLastBlockNumber(): Promise<number> {
    const url = `${this.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`;
    const response = await this.httpGet(url);
    return parseInt(response.result, 16);
  }

  async getBlockTransactions(blockNumber: number) {
    const url = `${this.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=${'0x' + blockNumber.toString(16)}&boolean=true&apikey=${this.apiKey}`;
    await this.sleep(this.delay);
    const response = await this.httpGet(url);
    return response.result.transactions;
  }

  private httpGet(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
