import { HardhatRuntimeEnvironment } from 'hardhat/types';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, neonscan } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const vault = await deployments.get('Vault');

  const weightedFactory = await deploy('WeightedPoolFactory', {
    from: deployer,
    args: [vault.address],
    log: true,
  });

  await neonscan.verifier.verify(
    'WeightedPoolFactory',
    weightedFactory.address,
    [vault.address],
    weightedFactory.libraries
  )

}
