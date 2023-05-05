import { pick } from 'lodash';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { fp } from '../../helpers/numbers';
import { deploy } from '../../helpers/deploy';
import { toNormalizedWeights } from '../../helpers/weights';
import { MAX_UINT256 } from '../../helpers/constants';
import { encodeJoinStablePool } from '../../helpers/stablePoolEncoding';
import { encodeJoinWeightedPool } from '../../helpers/weightedPoolEncoding';
import { bn } from '../../helpers/numbers';
import { deployPoolFromFactory, PoolName } from '../../helpers/pools';
import { deploySortedTokens, mintTokens, TokenList } from '../../helpers/tokens';
// import { getContractFactory } from '@nomiclabs/hardhat-ethers/types';

export const tokenSymbols = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH'];
// export const tokenSymbols = ['AAA', 'BBB'] 

import {contracts } from "./contracts";

export async function setupEnvironment(): Promise<any> {
  const { deployer, admin, creator, trader } = await getSigners();

  console.log('deployer', deployer.address)
  console.log('admin', admin.address)
  console.log('creator', creator.address)
  console.log('trader', trader.address)

  const authorizer = (await ethers.getContractFactory('Authorizer', admin)).attach(contracts.authorizer)
  const weth =  (await ethers.getContractFactory('WETH', admin)).attach(contracts.weth)
  const vault = (await ethers.getContractFactory('Vault', admin)).attach(contracts.vault)

  console.log('Vault', vault.address)

  // const authorizer = await deploy('Authorizer', { args: [admin.address] });
  
  // const vault = await deploy('Vault', { args: [authorizer.address, weth.address, 0, 0] });
    
  console.log('deploy tokens')
  const tokens = await deploySortedTokens(tokenSymbols, Array(tokenSymbols.length).fill(18));
 
  const symbols = Object.keys(tokens);
  const tokenAddresses = symbols.map((symbol) => tokens[symbol].address);

  
  for (const symbol in tokens) {
    console.log('creator approve, mint tokens to trader, trader approve, token:', symbol)
    // console.log('creator approving vault', tokens[symbol].address)
    // creator tokens are used to initialize pools, but tokens are only minted when required
    await tokens[symbol].connect(creator).approve(vault.address, MAX_UINT256);
    
    // console.log('minting', tokens[symbol].address)
    // trader tokens are used to trade and not have non-zero balances
    await mintTokens(tokens, symbol, trader, 200e18);

    // console.log('trader approving vault')
    await tokens[symbol].connect(trader).approve(vault.address, MAX_UINT256);
  }

  // deposit internal balance for trader to make it non-zero
  const transfers = [];

  for (let idx = 0; idx < tokenAddresses.length; ++idx) {
    transfers.push({
      kind: 0, // deposit
      asset: tokenAddresses[idx],
      amount: bn(100e18),
      sender: trader.address,
      recipient: trader.address,
    });
  }
  console.log('Transfer tokens to trader (?)')
  await vault.connect(trader).manageUserBalance(transfers);

  return { vault, tokens, trader };
}

export async function deployPool(vault: Contract, tokens: TokenList, poolName: PoolName): Promise<string> {
  const { creator } = await getSigners();

  const symbols = Object.keys(tokens);
  console.log(symbols)
  const initialPoolBalance = bn(100e18);
  for (const symbol of symbols) {
    await mintTokens(tokens, symbol, creator, initialPoolBalance);
  }

  const tokenAddresses = symbols.map((symbol) => tokens[symbol].address);
  const swapFeePercentage = fp(0.02); // 2%

  let pool: Contract;
  let joinUserData: string;


  console.log('get the pool')

  if (poolName == 'WeightedPool') {
    const weights = toNormalizedWeights(symbols.map(() => fp(1))); // Equal weights for all tokens
    console.log('weights', weights)
    console.log('creator', creator.address)
    console.log([tokenAddresses, weights, swapFeePercentage])
    pool = await deployPoolFromFactory(vault, 'WeightedPool', {
      from: creator,
      parameters: [tokenAddresses, weights, swapFeePercentage],
    });
    console.log('New pool deployed', pool.address)
    joinUserData = encodeJoinWeightedPool({ kind: 'Init', amountsIn: tokenAddresses.map(() => initialPoolBalance) });
    // console.log(joinUserData)
  } else if (poolName == 'StablePool') {
    const amplificationParameter = bn(50e18);

    pool = await deployPoolFromFactory(vault, 'StablePool', {
      from: creator,
      parameters: [tokenAddresses, amplificationParameter, swapFeePercentage],
    });

    joinUserData = encodeJoinStablePool({ kind: 'Init', amountsIn: tokenAddresses.map(() => initialPoolBalance) });
  } else {
    throw new Error(`Unhandled pool: ${poolName}`);
  }

  const poolId = await pool.getPoolId();
  console.log('Joining to pool', poolId)
  await vault.connect(creator).joinPool(poolId, creator.address, creator.address, {
    assets: tokenAddresses,
    maxAmountsIn: tokenAddresses.map(() => initialPoolBalance), // These end up being the actual join amounts
    fromInternalBalance: false,
    userData: joinUserData,
  });
  console.log('Joined')
  return poolId;
}

export async function getWeightedPool(
  vault: Contract,
  tokens: TokenList,
  size: number,
  offset?: number
): Promise<string> {
  console.log('getWeightedPool', size, offset)
  const pool = await deployPool(vault, pickTokens(tokens, size, offset), 'WeightedPool');
  console.log(pool)
  return pool
}

export async function getStablePool(
  vault: Contract,
  tokens: TokenList,
  size: number,
  offset?: number
): Promise<string> {
  return deployPool(vault, pickTokens(tokens, size, offset), 'StablePool');
}

function pickTokens(tokens: TokenList, size: number, offset?: number): TokenList {
  return pick(tokens, tokenSymbols.slice(offset ?? 0, size + (offset ?? 0)));
}

export function pickTokenAddresses(tokens: TokenList, size: number, offset?: number): string[] {
  return tokenSymbols.slice(offset ?? 0, size + (offset ?? 0)).map((symbol) => tokens[symbol].address);
}

export async function getSigners(): Promise<{
  deployer: SignerWithAddress;
  admin: SignerWithAddress;
  creator: SignerWithAddress;
  trader: SignerWithAddress;
}> {
  const [ deployer, admin, creator, trader] = await ethers.getSigners();

  return { deployer, admin, creator, trader };
}

export function printGas(gas: number | BigNumber): string {
  if (typeof gas !== 'number') {
    gas = gas.toNumber();
  }

  return `${(gas / 1000).toFixed(1)}k`;
}
