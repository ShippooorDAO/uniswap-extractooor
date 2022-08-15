import { Token } from "./Token";

export class TokenService {
  private readonly mapById = new Map<string, Token>();
  private readonly mapBySymbol = new Map<string, Token>();

  constructor(private readonly tokens: Token[]) {
    for (const token of tokens) {
      this.mapById.set(token.id, token);
      this.mapBySymbol.set(token.symbol, token);
    }
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