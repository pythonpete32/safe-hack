require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { GOERLI_RPC_URL, PRIVATE_KEY } = process.env

require('./tasks/index.ts');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  networks: {
    local: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      forking: {
        url: GOERLI_RPC_URL,
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
