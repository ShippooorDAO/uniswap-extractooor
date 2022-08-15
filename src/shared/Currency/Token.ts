import { BigNumber } from "ethers";
import { UsdAmount } from "./UsdAmount";

/**
 * key: unix timestamp
 * value: Asset -> USDC exchange rate, in decimal representation
 */
export type HistoricalExchangeRates = Map<number, UsdAmount>;

export interface Token {
  id: string;
  symbol: string;
  priceUsd?: UsdAmount;
  historicalExchangeRates?: HistoricalExchangeRates;
  decimals: number;
  precision: BigNumber;
}
