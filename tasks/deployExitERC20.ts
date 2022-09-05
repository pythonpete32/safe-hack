import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MockToken } from "../typechain-types";

task("deployExitERC20", "deploys and setup exit ERC20 module")
  .addParam("name", "The name of the token")
  .addParam("symbol", "The symbol of the token")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { name, symbol } = taskArgs;
    const Token = await hre.ethers.getContractFactory("MockToken");
    const token: MockToken = await Token.deploy(name, symbol);
    await token.deployed();
    console.log("Token deployed to:", token.address);
    return token
  });
