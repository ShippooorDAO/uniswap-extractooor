import { Pool } from './Pool';
import { Token } from '../Currency/Token';
import { TokenService } from '../Currency/TokenService';

export class UniswapPoolService {
  private readonly mapById = new Map<string, Pool>();
  private readonly mapByToken = new Map<string, Pool[]>();
  private readonly mapByTokenPair = new Map<string, Pool[]>();

  constructor(
    private readonly pools: Pool[],
    private readonly tokenService: TokenService
  ) {
    for (const token of this.tokenService.getAll()) {
      this.mapByToken.set(token.id, []);
    }

    for (const pool of this.pools) {
      this.mapById.set(pool.id, pool);
      this.mapByToken.get(pool.token0.id)?.push(pool);
      this.mapByToken.get(pool.token1.id)?.push(pool);

      const tokenPairHash = this.getTokenPairHash(pool.token0, pool.token1);
      const poolsPerTokenPair = this.mapByTokenPair.get(tokenPairHash) || [];
      poolsPerTokenPair.push(pool);
      this.mapByTokenPair.set(tokenPairHash, poolsPerTokenPair);
    }
  }

  private getTokenPairHash(token0: Token, token1: Token) {
    return [token0.id, token1.id].sort().join('-');
  }

  getAll() {
    return this.pools;
  }

  getPoolsForToken(token: Token): Pool[] | undefined {
    return this.mapByToken.get(token.id);
  }

  getPoolsForTokens(tokens: Token[]): Pool[] | undefined {
    const poolsMap = new Map<string, Pool>();
    for (const token of tokens) {
       const pools = this.mapByToken.get(token.id) || [];
       for (const pool of pools) {
          poolsMap.set(pool.id, pool);
       }
    }

    return Array.from(poolsMap.values());
  }

  getPoolsForTokenPair(token0: Token, token1: Token) {
    const tokenPairHash = this.getTokenPairHash(token0, token1);
    return this.mapByTokenPair.get(tokenPairHash);
  }
}
