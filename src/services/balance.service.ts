import { Injectable } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class BalanceService {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getMaxBalanceChange(): Promise<{ address: string | null }> {
    const lastBlockNumber = await this.blockchainService.getLastBlockNumber();
    const balances: Record<string, bigint> = {};

    for (let i = lastBlockNumber; i > lastBlockNumber - 100; i--) {
      const transactions = await this.blockchainService.getBlockTransactions(i);

      transactions.forEach((tx) => {
        const value = BigInt(tx.value);
        balances[tx.from] = (balances[tx.from] || 0n) - value;
        balances[tx.to] = (balances[tx.to] || 0n) + value;
      });
    }

    let maxChangeAddress: string | null = null;
    let maxChange: bigint = 0n;

    for (const [address, balance] of Object.entries(balances)) {
      const absChange = balance < 0n ? -balance : balance;
      if (absChange > maxChange) {
        maxChange = absChange;
        maxChangeAddress = address;
      }
    }

    return { address: maxChangeAddress };
  }
}
