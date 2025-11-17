const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const DescrowContract = await hre.ethers.getContractFactory('DescrowContract');
  
  const sellerAddress = process.env.SELLER_ADDRESS || deployer.address;
  const price = hre.ethers.parseEther('0.1');
  const disputeWindow = 7 * 24 * 60 * 60;

  const contract = await DescrowContract.deploy(sellerAddress, price, disputeWindow);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('DescrowContract deployed to:', address);
  console.log('Seller:', sellerAddress);
  console.log('Price:', hre.ethers.formatEther(price), 'DEV');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
