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
import { BigNumber } from '@ethersproject/bignumber'
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

  interface SafeTransaction {
    data: string;
    to: string;
    value: BigNumber
  }

  interface ModuleType {
    transaction: SafeTransaction;
    expectedModuleAddress: string;
  }


  enum KnownContracts { EXIT_ERC20 = "exit" }

  const { transaction, expectedModuleAddress }: ModuleType = deployAndSetUpModule(KnownContracts.EXIT_ERC20, types, provider, 5, String(Date.now()))
  console.log(`
    transaction: ${JSON.stringify(transaction, null, 2)}
    expectedModuleAddress: ${expectedModuleAddress}
  `)

  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: { ...transaction, value: "0" } })
  console.log(`safeTransaction: ${JSON.stringify(safeTransaction, null, 2)}`)
  const safeTransactionHash = await safeSdk.getTransactionHash(safeTransaction)

  // propose transaction to relayer
  const senderSignature = await safeSdk.signTransactionHash(safeTransactionHash)
  const safeService = new SafeServiceClient({ txServiceUrl: 'https://safe-transaction.goerli.gnosis.io/', ethAdapter })
  await safeService.proposeTransaction({
    safeAddress: safeSdk.getAddress(),
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: adminAddress,
    senderSignature: senderSignature.data,
  })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
