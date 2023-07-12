import '@nomiclabs/hardhat-ethers';
import 'hardhat-local-networks-config-plugin';
import '@nomiclabs/hardhat-etherscan';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import Task from './src/task';
import { Logger } from './src/logger';

import 'dotenv/config';

task('deploy', 'Run deployment task')
  .addParam('id', 'Deployment task ID')
  .addOptionalParam('force', 'Ignore previous deployments')
  .setAction(async (args: { id: string; force?: boolean; verbose?: boolean }, hre: HardhatRuntimeEnvironment) => {
    Logger.setDefaults(false, args.verbose || false);
    await new Task(args.id, hre.network.name).run(args.force);
  });

export default {
  networks: {
    neonlabs: {
      chainId: 245022934,
      url: 'https://shadow-mainnet.neonevm.org/',
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.CONTROLLER_PRIVATE_KEY,
        process.env.ADMIN_PRIVATE_KEY,
        process.env.CREATOR_PRIVATE_KEY,
        process.env.TRADER_PRIVATE_KEY,
        process.env.OTHER_PRIVATE_KEY,
      ],
      saveDeployments: true,
    },
    devnet: {
      chainId: 245022926,
      url: 'https://devnet.neonevm.org',
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.CONTROLLER_PRIVATE_KEY,
        process.env.ADMIN_PRIVATE_KEY,
        process.env.CREATOR_PRIVATE_KEY,
        process.env.TRADER_PRIVATE_KEY,
        process.env.OTHER_PRIVATE_KEY,
      ],
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
      neonlabs: 'A',
    },
    customChains: [
      {
        network: 'neonlabs',
        chainId: 245022926,
        urls: {
          apiURL: 'https://beta-devnet-api.neonscan.org/contract/verify',
          browserURL: 'https://neonscan.org',
        },
      },
    ],
  },
};
