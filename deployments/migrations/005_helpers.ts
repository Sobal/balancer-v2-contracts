import { HardhatRuntimeEnvironment } from 'hardhat/types';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, neonscan } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const vault = await deployments.get('Vault');

  const helpers = await deploy('BalancerHelpers', {
    from: deployer,
    args: [vault.address],
    log: true,
  });

  await neonscan.verifier.verify(
    'BalancerHelpers',
    helpers.address,
    [vault.address],
    helpers.libraries
  )
}
