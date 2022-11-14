import { HardhatRuntimeEnvironment } from 'hardhat/types';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, run, neonscan} = hre;
  const { deploy } = deployments;

  const { deployer, admin } = await getNamedAccounts();

  const authorizer = await deploy('Authorizer', {
    from: deployer,
    args: [admin],
    log: true,
  });

  await neonscan.verifier.verify(
    'Authorizer',
    authorizer.address,
    [admin],
    authorizer.libraries
  )

}
