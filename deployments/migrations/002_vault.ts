import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { MONTH } from '../../lib/helpers/time';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, getChainId, neonscan } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const authorizer = await deployments.get('Authorizer');

  const THREE_MONTHS = MONTH * 3;
  let WETH;

  console.log(chainId)
  if (chainId == '1') {
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  // } else if (chainId == '245022926') {
  //   WETH = '0x65976a250187cb1D21b7e3693aCF102d61c86177'
  } else {
    WETH = await (await deployments.get('WETH')).address;
  }

  const vault = await deploy('Vault', {
    from: deployer,
    args: [authorizer.address, WETH, THREE_MONTHS, MONTH],
    log: true,
  });

  // This fails because of bytecode mismatch.
  // await neonscan.verifier.verify(
  //   'Vault',
  //   vault.address,
  //   [authorizer.address, WETH, THREE_MONTHS, MONTH],
  //   vault.libraries
  // )

}
