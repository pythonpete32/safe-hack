require("dotenv").config();
import { HardhatRuntimeEnvironment } from "hardhat/types";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import Safe, { SafeFactory, EthSignSignature } from '@gnosis.pm/safe-core-sdk'
import { deployAndSetUpModule } from '../zodiac/factory/factory'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../zodiac/factory/constants'
import { task, types } from "hardhat/config";


import hre, { ethers } from 'hardhat'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {

  // admin
  const admin: SignerWithAddress = (await ethers.getSigners())[0]
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider)
  const provider = ethers.provider
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
  const ethAdapter = new EthersAdapter({ ethers, signer: admin })
  const safeFactory = await SafeFactory.create({ ethAdapter })
  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig: { owners: [adminAddress], threshold: 1 } })
  const safeAddress = safeSdk.getAddress()
  console.log(`Safe deployed to: ${safeAddress}}`)

  // deploy module
  const types: { types: string[], values: string[] } = {
    types: ['address', 'address', 'address', 'address', 'address'],
    values: [adminAddress, safeAddress, safeAddress, tokenAddress, supplyTokenAddress]
  }

  enum KnownContracts { EXIT_ERC20 = "exit" }

  const tx = deployAndSetUpModule(KnownContracts.EXIT_ERC20, types, provider, 5, String(Date.now()))
  console.log("Safe Tx: ", tx)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
