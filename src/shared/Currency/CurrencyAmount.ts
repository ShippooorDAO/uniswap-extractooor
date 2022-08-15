import { BigNumber } from 'ethers';

export interface CurrencyAmount {
  /**
   * Symbol of currency.
   */
  readonly symbol: string;

  /**
   * Amount of currency, using full-precision BigNumber structure.
   */
  readonly n: BigNumber;

  /**
   * Get full precision decimal string representation of token amount.
   * @returns
   */
  toExactString(): string;

  /**
   * Get Javascript number representation of token amount.
   * May cause loss of precision.
   * @returns number
   */
  toNumber(): number;

  /**
   * Get display-friendly representation of token amount, with currency.
   *
   * Optional display parameters can be specified:
   * - abbreviate (defaults to false)
   *    - i.e new TokenAmount(3000000, ethSymbol).toDisplayString({abbreviate: true})
   *         -> 300k ETH
   * - decimal (defaults to 2)
   *    - i.e new TokenAmount(12.4565225, ethSymbol).toDisplayString({decimals: 5})
   *         -> 12.4565 ETH
   *
   * @param params Optional display parameters:
   *   - abbreviate: Display number in short format
   *   - decimals: Number of decimals to display.
   * @returns string
   */
  toDisplayString(params?: { abbreviate?: boolean; decimals?: number }): string;
}
