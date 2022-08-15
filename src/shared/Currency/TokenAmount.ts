import { BigNumber, ethers } from 'ethers';
import { format } from '@/shared/Utils/Format';
import { CurrencyAmount } from './CurrencyAmount';
import { UsdAmount } from './UsdAmount';
import { SECONDS_IN_HOUR } from '../Constants';
import { Token } from './Token';
import { parseBigDecimalTokenAmount } from '../Utils/Subgraph';

export class TokenAmount implements CurrencyAmount {
  readonly n: BigNumber;
  readonly precision = this.token.precision;
  readonly symbol = this.token.symbol;

  constructor(
    readonly value: number | string | BigNumber,
    readonly token: Token
  ) {
    if (typeof value === 'string') {
      this.n = BigNumber.from(value);
    } else if (typeof value === 'number') {
      this.n = ethers.utils.parseUnits(value.toString(), token.decimals);
    } else {
      this.n = value;
    }
  }

  toExactString(): string {
    return ethers.utils.formatUnits(this.n, this.token.decimals);
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
    decimals = decimals || 2;
    const num = this.toNumber();
    if (num < 1 / 10 ** decimals) {
      decimals = decimals * 2;
    }
    return format(num, {
      symbol: this.symbol,
      decimals,
      abbreviate,
    });
  }

  /**
   * Converts token amount to USD amount.
   *
   * @param timestamp Timestamp at which exchange rate is determined, present rate is used if not specified.
   * @returns Converted token amount.
   */
  toUsd(timestamp?: number): UsdAmount | null {
    if (!this.token.historicalExchangeRates) {
      return this.toUsdInternal();
    }
    const nowTimestamp = Math.floor(Date.now() / 1000);
    if (!timestamp || timestamp > nowTimestamp) {
      timestamp = nowTimestamp;
    }

    if (timestamp === nowTimestamp) {
      return this.toUsdInternal();
    }

    const hourlyTimestamp =
      Math.floor(timestamp / SECONDS_IN_HOUR) * SECONDS_IN_HOUR;
    const exchangeRate =
      this.token.historicalExchangeRates?.get(hourlyTimestamp);
    if (!exchangeRate) {
      return new UsdAmount(0);
    }

    return this.toUsdInternal(exchangeRate);
  }

  /**
   * Converts a given USD amount to a given token currency.
   *
   * @param tokenAmount Token to be converted
   * @param token Token currency to convert to
   * @param timestamp Timestamp at which exchange rate is determined, present rate is used if not specified.
   * @returns Converted token amount.
   */
  static fromUsd(
    usdAmount: UsdAmount,
    token: Token,
    timestamp?: number
  ): TokenAmount | null {
    if (!timestamp) {
      return TokenAmount.fromUsdInternal_(usdAmount, token);
    }

    const nowTimestamp = Math.floor(Date.now() / 1000);
    if (!timestamp || timestamp > nowTimestamp) {
      timestamp = nowTimestamp;
    }

    if (timestamp === nowTimestamp) {
      return TokenAmount.fromUsdInternal_(usdAmount, token);
    }

    const hourlyTimestamp = timestamp - (timestamp % SECONDS_IN_HOUR);
    const exchangeRate = token.historicalExchangeRates?.get(hourlyTimestamp);
    if (!exchangeRate) {
      return TokenAmount.fromUsdInternal_(usdAmount, token); // TODO: maybe do something better?
    }

    return TokenAmount.fromUsdInternal_(usdAmount, token, exchangeRate);
  }

  /**
   * Converts a given token amount to another token currency, using USD exchange rates
   * of both currencies as a bridge.
   *
   * @param tokenAmount Token to be converted
   * @param token Token currency to convert to
   * @param timestamp Timestamp at which exchange rate is determined, present rate is used if not specified.
   * @returns Converted token amount.
   */
  static fromToken(
    tokenAmount: TokenAmount,
    token: Token,
    timestamp?: number
  ): TokenAmount | null {
    if (tokenAmount.token.symbol === token.symbol) {
      return tokenAmount;
    }

    const usdAmount = tokenAmount.toUsd(timestamp);
    return usdAmount ? TokenAmount.fromUsd(usdAmount, token, timestamp) : null;
  }

  /**
   * Converts token amount to another token currency, using USD exchange rates
   * of both currencies as a bridge.
   *
   * @param token Token currency to convert to
   * @param timestamp Timestamp at which exchange rate is determined, present rate is used if not specified.
   * @returns Converted token amount.
   */
  toToken(token: Token, timestamp?: number): TokenAmount | null {
    return TokenAmount.fromToken(this, token, timestamp);
  }

  static fromUsdInternal_(
    usdAmount: UsdAmount,
    token: Token,
    exchangeRate?: UsdAmount
  ) {
    exchangeRate = exchangeRate || token.priceUsd;

    if (!exchangeRate) {
      return null;
    }
    return new TokenAmount(
      usdAmount.n
        .mul(exchangeRate.precision)
        .div(exchangeRate.n)
        .mul(token.precision)
        .div(usdAmount.precision),
      token
    );
  }

  private toUsdInternal(exchangeRate?: UsdAmount) {
    exchangeRate = exchangeRate || this.token.priceUsd;

    if (!exchangeRate) {
      return null;
    }
    return new UsdAmount(
      this.n
        .mul(exchangeRate.n)
        .div(exchangeRate.precision)
        .mul(exchangeRate.precision)
        .div(this.precision)
    );
  }

  static fromBigDecimal(value: string, token: Token): TokenAmount | null {
    return parseBigDecimalTokenAmount(value, token);
  }
}
