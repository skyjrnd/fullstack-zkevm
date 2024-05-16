require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    zkEVM: {
      url: `https://polygon-amoy.g.alchemy.com/v2/KGz3a0WnAbxdQRNP6m5cdquEjge-nkvR`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
};
