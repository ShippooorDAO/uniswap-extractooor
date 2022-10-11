import { Token } from "./Token";

export class TokenService {
  private readonly mapById = new Map<string, Token>();
  private readonly mapBySymbol = new Map<string, Token>();

  constructor(private readonly tokens: Token[]) {
    for (const token of tokens) {
      this.mapById.set(token.id, token);
      this.mapBySymbol.set(token.symbol, token);
    }

    // Add special token for ETH. This is mainly for display purpose.
    const wethToken = this.mapBySymbol.get("WETH")!
    const ethToken = {...wethToken};
    ethToken.symbol = 'ETH';
    ethToken.id = 'ETH';
    this.mapById.set(ethToken.id, ethToken);
    this.mapBySymbol.set(ethToken.symbol, ethToken);
  }

  getAll() {
    return this.tokens;
  }

  getById(id: string): Token | undefined {
    return this.mapById.get(id);
  }

  getBySymbol(symbol: string): Token | undefined {
    return this.mapBySymbol.get(symbol);
  }
}