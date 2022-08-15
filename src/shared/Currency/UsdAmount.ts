import { BigNumber, ethers } from 'ethers';
import { format } from '@/shared/Utils/Format';
import { CurrencyAmount } from './CurrencyAmount';
import { USD_INTERNAL_DECIMALS } from '../Constants';
import { parseBigDecimalUsdAmount } from '../Utils/Subgraph';

export class UsdAmount implements CurrencyAmount {
  readonly symbol = 'USD';
  readonly n: BigNumber;
  readonly decimals = USD_INTERNAL_DECIMALS;
  readonly precision = BigNumber.from(10).pow(this.decimals);

  constructor(value: number | string | BigNumber) {
    if (typeof value === 'string') {
      this.n = BigNumber.from(value);
    } else if (typeof value === 'number') {
      this.n = ethers.utils.parseUnits(value.toString());
    } else {
      this.n = value;
    }
  }

  toExactString(): string {
    return ethers.utils.formatUnits(this.n, this.decimals);
  }

  toNumber(): number {
    return Number(this.toExactString());
  }

  toDisplayString(
    { abbreviate, decimals }: { abbreviate?: boolean; decimals?: number } = {
      decimals: 2,
      abbreviate: false,
    }
  ): string {
    return format(this.toNumber(), {
      symbol: 'USD',
      decimals,
      abbreviate,
    });
  }

  static fromBigDecimal(value: string): UsdAmount | null {
    return parseBigDecimalUsdAmount(value);
  }
}

