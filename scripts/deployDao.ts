import { HardhatRuntimeEnvironment } from "hardhat/types";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import Safe, { SafeFactory, EthSignSignature } from '@gnosis.pm/safe-core-sdk'
import { deployAndSetUpModule } from '../zodiac/factory/factory'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../zodiac/factory/constants'

import hre, { ethers } from 'hardhat'

enum KnownContracts {
  META_GUARD = "metaGuard",
  OPTIMISTIC_GOVERNOR = 'optimisticGovernor',
  TELLOR = "tellor",
  REALITY_ETH = "realityETH",
  REALITY_ERC20 = "realityERC20",
  BRIDGE = "bridge",
  DELAY = "delay",
  EXIT_ERC20 = "exit",
  EXIT_ERC721 = "exitERC721",
  CIRCULATING_SUPPLY_ERC20 = "circulatingSupplyERC20",
  CIRCULATING_SUPPLY_ERC721 = "circulatingSupplyERC721",
  SCOPE_GUARD = "scopeGuard",
  FACTORY = "factory",
  ROLES = "roles",
}
async function main() {

  // admin
  const admin = (await ethers.getSigners())[0]
  const provider = ethers.provider
  // const admin = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
  const adminAddress: string = await admin.getAddress()
  console.log("admin address:", adminAddress)

  // depoloy mock token
  const Token = await ethers.getContractFactory("MockToken");
  const token = await Token.deploy("Mock Token", "TT");
  await token.deployed();
  const tokenAddress: string = token.address
  console.log("Token deployed to:", token.address);

  // deploy mock supply token
  const SupplyFactory = await ethers.getContractFactory('CirculatingSupplyERC20')
  const supplyToken = await SupplyFactory.deploy(admin.address, tokenAddress, [])
  await supplyToken.deployed()
  const supplyTokenAddress: string = supplyToken.address
  console.log("SupplyToken deployed to:", supplyTokenAddress)

  // deploy Safe
  const safeSdk = await hre.tasks.deploySafe.action({ owners: adminAddress, threshold: 1 }, hre)
  const safeAddress: string = safeSdk.getAddress()
  console.log(`Safe deployed tp: ${safeAddress}}`)

  // deploy module
  const types: { types: string[], values: string[] } = {
    types: ['address', 'address', 'address', 'address', 'address'],
    values: [adminAddress, safeAddress, safeAddress, tokenAddress, supplyTokenAddress]
  }

  const tx = deployAndSetUpModule(KnownContracts.EXIT_ERC20, types, provider, 5, String(Date.now()))
  console.log("Safe Tx: ", tx)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
