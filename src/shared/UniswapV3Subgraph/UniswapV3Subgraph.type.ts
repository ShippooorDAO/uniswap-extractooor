import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Token } from "../Currency/Token";
import { TokenService } from "../Currency/TokenService";
import { UniswapPoolService } from "../UniswapPool/UniswapPoolService";

export type GetTokenByIdFunc = (id: string) => Token;
export type GetTokenBySymbolFunc = (symbol: string) => Token;

export interface UniswapV3SubgraphProviderState {
  tokenService?: TokenService;
  uniswapPoolService?: UniswapPoolService;
  chain: Chain;
  setChain: (chain: Chain) => void;
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

export enum Chain {
  ETHEREUM = 'Ethereum',
  POLYGON = 'Polygon',
  ARBITRUM = 'Arbitrum',
  OPTIMISM = 'Optimism',
  CELO = 'Celo',
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
  decimals: number | string; // BigInt!
}

export interface PoolResponse {
  id: string;
  token0: TokenResponse;
  token1: TokenResponse;
  feeTier: number | string;
  createdAtTimestamp: number | string;
}

export type TokensQueryResponse = BatchQueryResponse<TokenResponse>;
