import { BigNumber } from "ethers";
import { Token } from "../Currency/Token";
import { TokenResponse } from "./UniswapV3Subgraph.type";

/**
 * Converts Tokens batch query response to internal currency model Token.
 * @param response Subgraph response
 * @returns Array of currency Token
 */
export function processTokens(responses: TokenResponse[]): Token[] {
    return responses.map((entry) => ({
        ...entry,
        decimals: Number(entry.decimals),
        precision: BigNumber.from(10).pow(Number(entry.decimals)),
    }));
}
