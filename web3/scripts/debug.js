const hre = require('hardhat');

async function main() {
  const contract = await hre.ethers.getContractAt(
    'DescrowContract',
    '0xd3549d47D09b485d3921E5169596deB47158b490'
  );
  
  const state = await contract.getState();
  const buyer = await contract.buyer();
  const seller = await contract.seller();
  const price = await contract.price();
  
  console.log('Contract State:', state.toString()); // 0=Created, 1=Funded, 2=InTransit, 3=Delivered, 4=Completed, 5=Disputed
  console.log('Current Buyer:', buyer);
  console.log('Seller:', seller);
  console.log('Price:', hre.ethers.formatEther(price), 'DEV');
}

main().catch(console.error);