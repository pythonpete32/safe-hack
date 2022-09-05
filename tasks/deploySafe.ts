import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { SafeFactory } from '@gnosis.pm/safe-core-sdk'

task("deploySafe", "deploys a gnosis safe")
  .addParam("owners", "The owners of the safe, comma separated strings without spaces")
  .addParam("threshold", "The signing threshold of the safe")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre
    let { owners, threshold } = taskArgs;
    owners = owners.split(',') // hack to create an array
    const signer = (await ethers.getSigners())[0]

    const ethAdapter = new EthersAdapter({ ethers, signer })
    const safeFactory = await SafeFactory.create({ ethAdapter })
    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig: { owners, threshold } })
    console.log("new Gnosis Safe:", safeSdk.getAddress())
    return safeSdk
  });

