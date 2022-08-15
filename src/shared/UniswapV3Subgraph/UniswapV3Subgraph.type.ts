import { Token } from "../Currency/Token";
import { TokenService } from "../Currency/TokenService";

export type GetTokenByIdFunc = (id: string) => Token;
export type GetTokenBySymbolFunc = (symbol: string) => Token;

export interface UniswapV3SubgraphProviderState {
  tokenService?: TokenService;
}

/**
 * Query reponse types
 */
export interface BaseEntity {
  id: string;
}

export interface BatchQueryResponse<TData> {
  batch: TData[];
}

export interface TokenResponse {
  id: string; // ID!
  symbol: string; // String!
  name: symbol; // String!
  decimals: string; // BigInt!
  totalSupply: string; // BigInt!
  volume: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  untrackedVolumeUSD: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
  txCount: string; // BigInt!
  poolCount: string; // BigInt!
  totalValueLocked: string; // BigDecimal!
  totalValueLockedUSD: string; // BigDecimal!
  totalValueLockedUSDUntracked: string; // BigDecimal!
  derivedETH: string; // BigDecimal!

  /**
   * Ignored fields
   * whitelistPools: [Pool!]!
   * tokenDayData: [TokenDayData!]!
   */
}

export type TokensQueryResponse = BatchQueryResponse<TokenResponse>;
