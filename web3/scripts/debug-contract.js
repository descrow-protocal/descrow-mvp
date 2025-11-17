const hre = require('hardhat');

async function checkContractState() {
  const provider = hre.ethers.provider;
  const contract = new hre.ethers.Contract(
    '0xd3549d47D09b485d3921E5169596deB47158b490',
    ['function getState() view returns (uint8)', 'function buyer() view returns (address)'],
    provider
  );
  
  const state = await contract.getState();
  const buyer = await contract.buyer();
  
  console.log('Contract State:', state); // 0=Created, 1=Funded, 2=InTransit, 3=Delivered, 4=Completed, 5=Disputed
  console.log('Current Buyer:', buyer);
}

checkContractState().catch(console.error);