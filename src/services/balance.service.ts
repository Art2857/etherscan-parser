import { Injectable } from '@nestjs/common';
import { EtherScanService } from './etherscan.service';

@Injectable()
export class BalanceService {
  constructor(private readonly etherscanService: EtherScanService) {}

  async getMaxBalanceChange(): Promise<{ address: string | null }> {
    const lastBlockNumber = await this.etherscanService.getLastBlockNumber();
    const balances = new Map<string, bigint>();

    for (let i = lastBlockNumber; i > lastBlockNumber - 100; i--) {
      const transactions = await this.etherscanService.getBlockTransactions(i);

      for (const tx of transactions) {
        const value = BigInt(tx.value);
        const fromBalance = balances.get(tx.from) ?? 0n;
        balances.set(tx.from, fromBalance - value);
        const toBalance = balances.get(tx.to) ?? 0n;
        balances.set(tx.to, toBalance + value);
      }
    }

    let maxChangeAddress: string | null = null;
    let maxChange: bigint = 0n;

    for (const [address, balance] of balances.entries()) {
      const absChange = balance < 0n ? -balance : balance;
      if (absChange > maxChange) {
        maxChange = absChange;
        maxChangeAddress = address;
      }
    }

    return { address: maxChangeAddress };
  }
}
