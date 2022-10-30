import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { MONTH } from '../../lib/helpers/time';

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts, getChainId, tenderly } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // const authorizer = await deployments.get('Authorizer');
  const authorizer = {
    address: '0xA9C0d1D7b57d65D97ea18f6F44a18017b8a7f22a'
  }
  const THREE_MONTHS = MONTH * 3;
  let WETH;

  // if (chainId == '1') {
  //   WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  // } else {
  //   WETH = await (await deployments.get('WETH')).address;
  // }
  // WETH = '0x65976a250187cb1D21b7e3693aCF102d61c86177'
  // WETH = await deployments.get('WETH')
  WETH =  {
    address: '0x65976a250187cb1D21b7e3693aCF102d61c86177'
  }
  const vault = await deploy('Vault', {
    from: deployer,
    args: [authorizer.address, WETH.address, THREE_MONTHS, MONTH],
    log: true,
  });

  if (hre.network.live && vault.newlyDeployed) {
    // await tenderly.push({
    //   name: 'Vault',
    //   address: vault.address,
    // });
  }
}
