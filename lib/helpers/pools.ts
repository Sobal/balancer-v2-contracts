import { ethers } from 'hardhat';
import { Contract, ContractReceipt } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { deploy } from './deploy';
import { ZERO_ADDRESS } from './constants';
// import { getContractFactory } from '@nomiclabs/hardhat-ethers/types';

export const GeneralPool = 0;
export const MinimalSwapInfoPool = 1;
export const TwoTokenPool = 2;

export type PoolSpecializationSetting = typeof MinimalSwapInfoPool | typeof GeneralPool | typeof TwoTokenPool;
export type PoolName = 'WeightedPool' | 'StablePool';

const contracts = {
  authorizer: '0x00FB9D7A643B16BC1fAF1fFF394ec19B9f6DA1B8',
  vault: '0xDE45364D568CD5C8229e6e16A850e8861046D6Dd',
  weightedPoolFactory: '0xD0eD525cBAb7734C7901788d547e0196711d5660',
  stablePoolFactory: '0xEfC650c01B91753640C50A80f4bA3134FbD5e7a2',
  balancerHelpers: '0xE773F4db703aA5c4E4bF9ACd2ADE3383051EBA97'
}

export async function deployPoolFromFactory(
  vault: Contract,
  poolName: PoolName,
  args: { from: SignerWithAddress; parameters: Array<unknown> }
): Promise<Contract> {
  // const factory = await deploy(`${poolName}Factory`, { args: [vault.address] });
  const factory = (poolName == 'StablePool') 
  ? (await ethers.getContractFactory(`StablePoolFactory`)).attach(contracts.stablePoolFactory)
  : (await ethers.getContractFactory(`WeightedPoolFactory`)).attach(contracts.weightedPoolFactory)
    

  // We could reuse this factory if we saved it across pool deployments

  const name = 'Balancer Pool Token';
  const symbol = 'BPT';
  const owner = ZERO_ADDRESS;

  const receipt: ContractReceipt = await (
    await factory.connect(args.from).create(name, symbol, ...args.parameters, owner)
  ).wait();

  const event = receipt.events?.find((e) => e.event == 'PoolCreated');
  if (event == undefined) {
    throw new Error('Could not find PoolCreated event');
  }

  return ethers.getContractAt(poolName, event.args?.pool);
}
