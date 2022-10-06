import { BigNumber } from "ethers";
import { Token } from "../Currency/Token";
import { Pool } from "../UniswapPool/Pool";
import { PoolResponse, TokenResponse } from "./UniswapV3Subgraph.type";

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