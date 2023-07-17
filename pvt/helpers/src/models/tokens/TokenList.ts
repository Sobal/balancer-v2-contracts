import { BigNumber } from 'ethers';

import Token from './Token';
import TokensDeployer from './TokensDeployer';
import TypesConverter from '../types/TypesConverter';

import { Account } from '../types/types';
import { ZERO_ADDRESS } from '../../constants';
import {
  RawTokenApproval,
  RawTokenMint,
  RawTokensDeployment,
  TokenApproval,
  TokenMint,
  TokensDeploymentOptions,
} from './types';

export const ETH_TOKEN_ADDRESS = ZERO_ADDRESS;

const DEFAULT_TOKENS: string[] = [
  "0x0430a65fBaaa2407C70B9F2c0EDC7739ed43B9F2", //Token 0
  "0xB00E8F53bdc61F085f69BA2b71d5FeAdA677c1A3", //Token 1
  "0x58750802DCaB27CBEf705c4a5FF76B46269104a0", //Token 2
  "0x83Fb82F34b1aE10C0f0001f1848B49aA23C010f5", //Token 3
  "0xb9Aa1f10193A46e20Fd8487782622A91717DFD12", //Token 4
  "0x5Dd8121df4694E16e2193Bbc345291dFC7C2e83c", //Token 5
  "0xa19Ced8840AaCe3a3fCA562dE5A69a816123eF5e", //Token 6
  "0xc0111dAd3F16FFF35fA0998c0541A198A9c5fd82", //Token 7
]


export default class TokenList {
  tokens: Token[];

  static async create(params: RawTokensDeployment, options: TokensDeploymentOptions = {}): Promise<TokenList> {
    if (DEFAULT_TOKENS.length == 0) {
      return TokensDeployer.deploy(params, options);
    }
    const list = []
    for (let i = 0; i < DEFAULT_TOKENS.length; i++) {
      const token = await Token.from(DEFAULT_TOKENS[i])
      list.push(token)
    }

    if (options.sorted) {
      const sortedTokens = [...list].sort((a, b) => a.compare(b));
      return new TokenList(sortedTokens)
    }
    return new TokenList(list)
  }

  constructor(tokens: Token[] = []) {
    this.tokens = tokens;
  }

  get length(): number {
    return this.tokens.length;
  }

  get addresses(): string[] {
    return this.tokens.map((token) => token.address);
  }

  get first(): Token {
    return this.get(0);
  }

  get second(): Token {
    return this.get(1);
  }

  get WETH(): Token {
    return this.findBySymbol('WETH');
  }

  get DAI(): Token {
    return this.findBySymbol('DAI');
  }

  get CDAI(): Token {
    return this.findBySymbol('CDAI');
  }

  get MKR(): Token {
    return this.findBySymbol('MKR');
  }

  get SNX(): Token {
    return this.findBySymbol('SNX');
  }

  get BAT(): Token {
    return this.findBySymbol('BAT');
  }

  get GRT(): Token {
    return this.findBySymbol('GRT');
  }

  get(index: number | Token): Token {
    if (typeof index !== 'number') return index;
    if (index >= this.length) throw Error('Accessing invalid token list index');
    return this.tokens[index];
  }

  indexOf(token: number | Token): number {
    return typeof token === 'number' ? token : this.tokens.indexOf(token);
  }

  indicesOf(tokens: (number | Token)[]): number[] {
    return tokens.map((token) => this.indexOf(token));
  }

  indicesOfTwoTokens(token: number | Token, anotherToken: number | Token): number[] {
    return [this.indexOf(token), this.indexOf(anotherToken)];
  }

  subset(length: number, offset = 0): TokenList {
    return new TokenList(this.tokens.slice(offset, offset + length));
  }

  async mint(rawParams: RawTokenMint): Promise<void> {
    const params: TokenMint[] = TypesConverter.toTokenMints(rawParams);
    for (let i = 0; i < params.length; i++) {
      const { to, amount, from } = params[i]
      await this.tokens[i].mint(to, amount, { from })
    }
  }

  // Assumes the amount is an unscaled (non-FP) number, and will scale it by the decimals of the token
  // So passing in 100 to mint DAI, WBTC and USDC would result in fp(100), bn(100e8), bn(100e6): 100 tokens of each
  async mintScaled(rawParams: RawTokenMint): Promise<void> {
    const params: TokenMint[] = TypesConverter.toTokenMints(rawParams);
    for (let i = 0; i < params.length; i++) {
      const { to, amount, from } = params[i]
      const token = this.tokens[i]
      await token.mint(to, amount ? (Number(amount) * 10 ** token.decimals).toString() : 0, { from })
    }
  }

  async approve(rawParams: RawTokenApproval): Promise<void> {
    const params: TokenApproval[] = TypesConverter.toTokenApprovals(rawParams);
    for (let i = 0; i < params.length; i++) {
      const { to, amount, from } = params[i]
      await this.tokens[i].approve(to, amount, { from })
    }
  }

  async balanceOf(account: Account): Promise<BigNumber[]> {
    const balances = []
    for (let i = 0; i < this.tokens.length; i++) {
      balances.push(await this.tokens[i].balanceOf(account))
    }
    return balances
  }

  each(fn: (value: Token, i: number, array: Token[]) => void, thisArg?: unknown): void {
    this.tokens.forEach(fn, thisArg);
  }

  async asyncEach(fn: (value: Token, i: number, array: Token[]) => Promise<void>, thisArg?: unknown): Promise<void> {
    await this.asyncMap(fn, thisArg);
  }

  map<T>(fn: (value: Token, i: number, array: Token[]) => T, thisArg?: unknown): T[] {
    return this.tokens.map(fn, thisArg);
  }

  async asyncMap<T>(fn: (value: Token, i: number, array: Token[]) => Promise<T>, thisArg?: unknown): Promise<T[]> {
    const promises = this.tokens.map(fn, thisArg);
    return Promise.all(promises);
  }

  reduce<T>(fn: (previousValue: T, currentValue: Token, i: number, array: Token[]) => T, initialValue: T): T {
    return this.tokens.reduce(fn, initialValue);
  }

  findBySymbol(symbol: string): Token {
    const token = this.tokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase());
    if (!token) throw Error(`Could not find token with symbol ${symbol}`);
    return token;
  }

  findIndexBySymbol(symbol: string): number {
    const index = this.tokens.findIndex((token) => token.symbol.toLowerCase() === symbol.toLowerCase());
    if (index == -1) throw Error(`Could not find token with symbol ${symbol}`);
    return index;
  }

  sort(): TokenList {
    return new TokenList(
      this.tokens.sort((tokenA, tokenB) => (tokenA.address.toLowerCase() > tokenB.address.toLowerCase() ? 1 : -1))
    );
  }

  scaledBalances(rawBalance: () => number): BigNumber[] {
    return this.tokens.map((t) => BigNumber.from((rawBalance() * 10 ** t.decimals).toString()));
  }
}
