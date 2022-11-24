import { HardhatRuntimeEnvironment } from 'hardhat/types';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, neonscan } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // Deploy on mainnet to keep nonces synced
  const tokenFactory = await deploy('TokenFactory', {
    from: deployer,
    log: true,
  });

  await neonscan.verifier.verify(
    'TokenFactory',
    tokenFactory.address,
    [],
    tokenFactory.libraries
  )

  const weth = await deploy('WETH', {
    from: deployer,
    args: [deployer],
    log: true,
  });
  await neonscan.verifier.verify(
    'WETH',
    weth.address,
    [deployer],
    weth.libraries
  )  

  const multicall = await deploy('Multicall', {
    from: deployer,
    log: true,
  });

  await neonscan.verifier.verify(
    'Multicall',
    multicall.address,
    [],
    multicall.libraries
  )  
}
