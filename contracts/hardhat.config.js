require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("solidity-coverage");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    paseo: {
      url: "https://eth-rpc-testnet.polkadot.io",
      chainId: 420420417
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    noColors: true,
    currency: "USD",
    gasPrice: 1
  }
};

module.exports = config;
