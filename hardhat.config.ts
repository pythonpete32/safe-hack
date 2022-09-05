import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

require('./tasks/index');
const { GOERLI_RPC_URL, PRIVATE_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.15",
  networks: {
    local: {
      url: "127.0.0.1:8545"
    },
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/<key>",
      }
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      forking: {
        url: GOERLI_RPC_URL,
      }
    },

  }
};

export default config;
