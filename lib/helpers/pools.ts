import { ethers } from 'hardhat';
import { Contract, ContractReceipt } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { deploy } from './deploy';
import { ZERO_ADDRESS } from './constants';
// import { getContractFactory } from '@nomiclabs/hardhat-ethers/types';

import { contracts } from '../scripts/gas-measurement/contracts';

export const GeneralPool = 0;
export const MinimalSwapInfoPool = 1;
export const TwoTokenPool = 2;

export type PoolSpecializationSetting = typeof MinimalSwapInfoPool | typeof GeneralPool | typeof TwoTokenPool;
export type PoolName = 'WeightedPool' | 'StablePool';

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
    await factory.connect(args.from).create(name, symbol, ...args.parameters, owner, {
      gasLimit: 202183360

    })
  ).wait();

  const event = receipt.events?.find((e) => e.event == 'PoolCreated');
  if (event == undefined) {
    throw new Error('Could not find PoolCreated event');
  }

  return ethers.getContractAt(poolName, event.args?.pool);
}
