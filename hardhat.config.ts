import 'dotenv/config';
import 'solidity-coverage';
import '@tenderly/hardhat-tenderly';
import 'hardhat-deploy';
import 'hardhat-local-networks-config-plugin';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';

import { extendEnvironment, task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from './lib/scripts/plugins/overrideQueryFunctions';

import {TASK_COMPILE_SOLIDITY_COMPILE_SOLC} from "hardhat/builtin-tasks/task-names"
import Verifier from './lib/scripts/plugins/verifier';

task(TASK_COMPILE).setAction(overrideQueryFunctions);

task('seed', 'Add seed data').setAction(async (args, hre) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const action = require('./lib/scripts/seeding/seedPools');
  await action(args, hre);
});

const CHAIN_IDS = {
  hardhat: 31337,
  kovan: 42,
  goerli: 5,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  dockerParity: 17,
  neonlabs: 245022926,
};

const INFURA_KEY = process.env.INFURA_KEY || '';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

const CONTROLLER_PRIVATE_KEY = process.env.CONTROLLER_PRIVATE_KEY || '';
const ADMIN_PRIVATE_KEY = process.env.CONTROLLER_PRIVATE_KEY || '';
const CREATOR_PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY || '';
const TRADER_PRIVATE_KEY = process.env.CONTROLLER_PRIVATE_KEY || '';
const OTHER_PRIVATE_KEY = process.env.OTHER_PRIVATE_KEY || '';


declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    neonscan: {
      verifier: Verifier;
    }
  }
}

extendEnvironment((hre) => {
  hre.neonscan = {
    verifier: new Verifier(hre.network, 'no-api-key')
  }
})

export default {
  networks: {
    hardhat: {
      chainId: CHAIN_IDS.hardhat,
      saveDeployments: true,
    },
    dockerParity: {
      gas: 10000000,
      live: false,
      chainId: CHAIN_IDS.dockerParity,
      url: 'http://localhost:8545',
      saveDeployments: true,
    },
    localhost: {
      saveDeployments: true,
    },
    mainnet: {
      chainId: CHAIN_IDS.mainnet,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`, `${CONTROLLER_PRIVATE_KEY}`], // Using private key instead of mnemonic for vanity deploy
      saveDeployments: true,
    },
    ropsten: {
      chainId: CHAIN_IDS.ropsten,
      url: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`, `${CONTROLLER_PRIVATE_KEY}`], // Using private key instead of mnemonic for vanity deploy
      saveDeployments: true,
    },
    kovan: {
      chainId: CHAIN_IDS.kovan,
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`, `${CONTROLLER_PRIVATE_KEY}`], // Using private key instead of mnemonic for vanity deploy
      saveDeployments: true,
    },
    rinkeby: {
      chainId: CHAIN_IDS.rinkeby,
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`, `${CONTROLLER_PRIVATE_KEY}`], // Using private key instead of mnemonic for vanity deploy
      saveDeployments: true,
    },
    goerli: {
      chainId: CHAIN_IDS.goerli,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      accounts: [
        DEPLOYER_PRIVATE_KEY, // deployer
        ADMIN_PRIVATE_KEY, // admin
        CREATOR_PRIVATE_KEY, // creator
        TRADER_PRIVATE_KEY, // trader
        OTHER_PRIVATE_KEY, // other
      ],
      saveDeployments: true,
    },
    neonlabs: {
      chainId: 245022926,
      // url: 'https://proxy.devnet.neonlabs.org/solana',
      url: 'https://devnet.neonevm.org',
      accounts: [
        DEPLOYER_PRIVATE_KEY, // deployer
        ADMIN_PRIVATE_KEY, // admin
        CREATOR_PRIVATE_KEY, // creator
        TRADER_PRIVATE_KEY, // trader
        OTHER_PRIVATE_KEY, // other
      ],
      verify: {
        etherscan: {
          apiUrl: 'https://devnet-api.neonscan.org/hardhat/verify'
        }
      },
      saveDeployments: true
    },
    neonlabs2: {
      chainId: 111,
      url: 'https://proxy-test.neontest.xyz/solana',
      accounts: [
        DEPLOYER_PRIVATE_KEY, // deployer
        ADMIN_PRIVATE_KEY, // admin
        CREATOR_PRIVATE_KEY, // creator
        TRADER_PRIVATE_KEY, // trader
        OTHER_PRIVATE_KEY, // other
      ],
      saveDeployments: true
    },
    localneon: {
      chainId: 111,
      url: 'http://127.0.0.1:9090',
      accounts: [
        DEPLOYER_PRIVATE_KEY, // deployer
        ADMIN_PRIVATE_KEY, // admin
        CREATOR_PRIVATE_KEY, // creator
        TRADER_PRIVATE_KEY, // trader
        OTHER_PRIVATE_KEY, // other
      ],
      saveDeployments: true
    },
    graphneon: {
      // chainId: 111,
      chainId: 245022926,
      // url: 'https://proxy.devnet.neonlabs.org/solana',
      url: 'https://graph.neontest.xyz/neon-rpc',
      accounts: [
        DEPLOYER_PRIVATE_KEY, // deployer
        ADMIN_PRIVATE_KEY, // admin
        CREATOR_PRIVATE_KEY, // creator
        TRADER_PRIVATE_KEY, // trader
        OTHER_PRIVATE_KEY, // other
      ],
      saveDeployments: true
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      [CHAIN_IDS.mainnet]: 0,
      [CHAIN_IDS.kovan]: 0,
      [CHAIN_IDS.ropsten]: 0,
      [CHAIN_IDS.goerli]: 0,
      [CHAIN_IDS.rinkeby]: 0,
      [CHAIN_IDS.dockerParity]: 0,
      [CHAIN_IDS.neonlabs]: 0

    },
    admin: {
      default: 1, // here this will by default take the first account as deployer
      // We use explicit chain IDs so that export-all works correctly: https://github.com/wighawag/hardhat-deploy#options-2
      [CHAIN_IDS.mainnet]: '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f',
      [CHAIN_IDS.kovan]: 1,
      [CHAIN_IDS.ropsten]: 1,
      [CHAIN_IDS.goerli]: 1,
      [CHAIN_IDS.rinkeby]: '0x44DDF1D6292F36B25230a72aBdc7159D37d317Cf',
      [CHAIN_IDS.dockerParity]: 1,
      [CHAIN_IDS.neonlabs]: 1
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.7.1',
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
    ],
    overrides: {
      'contracts/vault/Vault.sol': {
        version: '0.7.1',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1500,
          },
        },
      },
      'contracts/pools/weighted/WeightedPoolFactory.sol': {
        version: '0.7.1',
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
    },
  },
  tenderly: {
    username: 'budibudi',
    project: 'v2',
  },
  paths: {
    deploy: 'deployments/migrations',
    deployments: 'deployments/artifacts',
  },
    etherscan: {
       apiKey: {
          neonlabs: 'A'
        },
      //  customChains: [
      //     {
      //       network: "neonlabs",
     //       chainId: 245022926,
      //      urls: {
      //         apiURL: 'https://beta-devnet-api.neonscan.org/contract/verify',
      //         browserURL: 'https://neonscan.org'
      //       }
      //     }
      //   ]
      
      customChains: [
        {
          network: "neonlabs",
          chainId: 245022926,
          urls: {
            apiURL: "https://devnet-api.neonscan.org/hardhat/verify",
            browserURL: "https://devnet.neonscan.org"
          }
        }
      ]
      }
    
};
