import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  async getMaxBalanceChange() {
    const lastBlockNumber = await this.appService.getLastBlockNumber();
    const balances: { [key: string]: bigint } = {};

    await Promise.all(
      Array.from({ length: 100 }, (_, index) => lastBlockNumber - index).map(
        async (blockNumber) => {
          const transactions =
            await this.appService.getBlockTransactions(blockNumber);

          transactions.forEach((tx) => {
            const value = BigInt(tx.value);
            if (!balances[tx.from]) balances[tx.from] = BigInt(0);
            if (!balances[tx.to]) balances[tx.to] = BigInt(0);
            balances[tx.from] -= value;
            balances[tx.to] += value;
          });
        },
      ),
    );

    let maxChangeAddress = null;
    let maxChange: bigint = 0n;

    for (const address in balances) {
      const absChange =
        balances[address] < BigInt(0) ? -balances[address] : balances[address];
      if (absChange > maxChange) {
        maxChange = absChange;
        maxChangeAddress = address;
      }
    }

    return { address: maxChangeAddress };
  }
}
