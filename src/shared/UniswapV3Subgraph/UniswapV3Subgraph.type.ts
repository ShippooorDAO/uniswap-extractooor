import { Token } from "../Currency/Token";
import { TokenService } from "../Currency/TokenService";
import { UniswapPoolService } from "../UniswapPool/UniswapPoolService";

export type GetTokenByIdFunc = (id: string) => Token;
export type GetTokenBySymbolFunc = (symbol: string) => Token;

export interface UniswapV3SubgraphProviderState {
  tokenService?: TokenService;
  uniswapPoolService?: UniswapPoolService;
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
  name: string; // String!
  decimals: string; // BigInt!
}

export interface PoolResponse {
  id: string;
  token0: TokenResponse;
  token1: TokenResponse;
  feeTier: string;
  createdAtTimestamp: string;
}

export type TokensQueryResponse = BatchQueryResponse<TokenResponse>;
