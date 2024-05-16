// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require('hardhat');
const fs = require("fs");
const path = require("path");

async function main() {
  const CounterContractFactory = await ethers.getContractFactory("Counter");
  const counterContract = await CounterContractFactory.deploy();
  await counterContract.deployed();

  const hardhatTokenFactory = await ethers.getContractFactory("Token");
  const hardhatTokenContract = await hardhatTokenFactory.deploy();
  await hardhatTokenContract.deployed();


  console.log(`counterContract deployed to address ${counterContract.address}`);
  console.log(`hardhatTokenContract deployed to address ${hardhatTokenContract.address}`);

const networkId = await ethers.provider.getNetwork().then(network => network.chainId);
console.log('networkId',networkId);
const { chainId } = await ethers.provider.getNetwork();
console.log('chainId',chainId);
const artifactPath = path.resolve(__dirname, "../src/Counter.json");
const artifact = require(artifactPath);
artifact.networks = artifact.networks || {};
artifact.networks[chainId.toString()] = { address: counterContract.address };
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
