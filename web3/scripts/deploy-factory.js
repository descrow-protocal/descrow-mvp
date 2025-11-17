const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying factory with account:', deployer.address);

  const DescrowFactory = await hre.ethers.getContractFactory('DescrowFactory');
  const factory = await DescrowFactory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log('DescrowFactory deployed to:', address);
  console.log('Update VITE_FACTORY_ADDRESS in your .env file');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});