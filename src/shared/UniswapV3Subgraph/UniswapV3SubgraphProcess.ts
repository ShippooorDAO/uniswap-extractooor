import { BigNumber } from "ethers";
import { Token } from "../Currency/Token";
import { Pool } from "../UniswapPool/Pool";
import { Chain, PoolResponse, TokenResponse } from "./UniswapV3Subgraph.type";
import ethereumCache from "./Cache/ethereum.json";
import arbitrumCache from "./Cache/arbitrum.json";
import celoCache from "./Cache/celo.json";
import polygonCache from './Cache/polygon.json';
import optimismCache from './Cache/optimism.json';

export function processToken(response: TokenResponse): Token {
    return {
      ...response,
      decimals: Number(response.decimals) || 18,
      precision: BigNumber.from(10).pow(Number(response.decimals)),
    };
}

/**
 * Converts Pools batch query responses to internal pool model Pool.
 * @param responses Subgraph responses
 * @param tokenService Token service
 * @returns Array of all Uniswap pools
 */
export function processPools(responses: PoolResponse[]): {pools: Pool[], tokens: Token[]} {
    const tokensMap = new Map<string, Token>();

    const pools = responses.map((response) => {
        const token0 =
          tokensMap.get(response.token0.id) || processToken(response.token0);
        tokensMap.set(token0.id, token0);

        const token1 =
          tokensMap.get(response.token1.id) || processToken(response.token1);
        tokensMap.set(token1.id, token1);
        
        return {
          ...response,
          createdAtTimestamp: Number(response.createdAtTimestamp),
          token0,
          token1,
          feeTier: Number(response.feeTier) / 1000000,
        };
    });

    const tokens = Array.from(tokensMap.values());

    return {pools, tokens};
}

export function getSubgraphUrl(chain: Chain): string {
  switch(chain) {
    case Chain.POLYGON:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon';
    case Chain.OPTIMISM:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis';
    case Chain.ARBITRUM:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev';
    case Chain.CELO:
      return 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo';
    case Chain.ETHEREUM:
    default:
      return 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
  }
}

export function getCache(chain: Chain): PoolResponse[] {
    switch (chain) {
      case Chain.POLYGON:
        // @ts-ignore: File is too big to infer type
        return polygonCache;
      case Chain.OPTIMISM:
        return optimismCache;
      case Chain.ARBITRUM:
        return arbitrumCache;
      case Chain.CELO:
        return celoCache;
      case Chain.ETHEREUM:
      default:
        // @ts-ignore: File is too big to infer type
        return ethereumCache;
    }
}