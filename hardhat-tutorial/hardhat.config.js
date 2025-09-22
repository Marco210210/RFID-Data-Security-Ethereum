require("@nomicfoundation/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  networks: {
    myLocalNetwork: {
      url: "HTTP://127.0.0.1:7545",
      chainId: 1337,
    },
  },
};