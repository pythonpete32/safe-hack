import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import Safe, { SafeFactory, EthSignSignature } from '@gnosis.pm/safe-core-sdk'

task("transactSafe", "calls a function on a gnosis safe")
  .setAction(async (_, hre: HardhatRuntimeEnvironment) => {
    const admin = (await hre.ethers.getSigners())[0]
    const adminAddress = await admin.getAddress()
    console.log("admin address:", adminAddress)

    const safeSdk = await hre.tasks.deploySafe.action({ owners: [adminAddress], threshold: 1 }, hre, _)
    console.log(`
      Safe deployed at ${safeSdk.getAddress()}  
    `)


  });

