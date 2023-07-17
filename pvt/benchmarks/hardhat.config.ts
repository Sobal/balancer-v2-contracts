import "dotenv/config"
import '@nomiclabs/hardhat-ethers';

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
const CREATOR_PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY || '';
const TRADER_PRIVATE_KEY = process.env.TRADER_PRIVATE_KEY || '';

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    neonlabs: {
      chainId: 245022934,
      url: 'https://shadow-mainnet.neonevm.org/',
      accounts: [DEPLOYER_PRIVATE_KEY, ADMIN_PRIVATE_KEY],
      saveDeployments: true,
    },
    devnet: {
      chainId: 245022926,
      url: 'https://devnet.neonevm.org/',
      accounts: [
        DEPLOYER_PRIVATE_KEY,
        ADMIN_PRIVATE_KEY,
        CREATOR_PRIVATE_KEY,
        TRADER_PRIVATE_KEY
      ],
      saveDeployments: true,
    },
  },
  solidity: {
    compilers: hardhatBaseConfig.compilers,
    overrides: { ...hardhatBaseConfig.overrides(name) },
  },
};
