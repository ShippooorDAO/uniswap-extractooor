import { Token } from "../Currency/Token";

export interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  feeTier: number;
  createdAtTimestamp: number;
}