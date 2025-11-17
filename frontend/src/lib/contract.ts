import Web3 from 'web3';

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_MOONBEAM_RPC_URL || 'https://rpc.api.moonbase.moonbeam.network';

const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "seller", "type": "address" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint256", "name": "disputeWindow", "type": "uint256" }
    ],
    "name": "createOrder",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "orderContract", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "OrderCreated",
    "type": "event"
  }
];

const ESCROW_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_seller", "type": "address" },
      { "internalType": "uint256", "name": "_price", "type": "uint256" },
      { "internalType": "uint256", "name": "_disputeWindow", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "DisputeNotTimedOut", "type": "error" },
  { "inputs": [], "name": "InsufficientAmount", "type": "error" },
  { "inputs": [], "name": "InvalidState", "type": "error" },
  { "inputs": [], "name": "NotBuyer", "type": "error" },
  { "inputs": [], "name": "NotSeller", "type": "error" },
  { "inputs": [], "name": "TransferFailed", "type": "error" },
  { "anonymous": false, "inputs": [], "name": "Delivered", "type": "event" },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }],
    "name": "DisputeOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }],
    "name": "GoodsConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "trackingNumber", "type": "string" }],
    "name": "Shipped",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "buyer",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confirmGoods",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disputeDeadline",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disputeWindow",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getState",
    "outputs": [{ "internalType": "enum DescrowContract.State", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "markDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_trackingNumber", "type": "string" }],
    "name": "markShipped",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "openDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "price",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "refundBuyer", "type": "bool" }],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "seller",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [{ "internalType": "enum DescrowContract.State", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "trackingNumber",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const contract = {
  async createOrder(sellerAddress: string, priceUSD: number, account: string) {
    const web3 = new Web3(window.ethereum);
    const factory = new web3.eth.Contract(FACTORY_ABI as any, FACTORY_ADDRESS);
    const priceWei = web3.utils.toWei(priceUSD.toString(), 'ether');
    const disputeWindow = 7 * 24 * 60 * 60; // 7 days
    
    const tx = await factory.methods.createOrder(sellerAddress, priceWei, disputeWindow)
      .send({ from: account, value: priceWei });
    return tx.transactionHash;
  },
  
  async confirmGoods(contractAddress: string, account: string) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ESCROW_ABI as any, contractAddress);
    const tx = await contract.methods.confirmGoods().send({ from: account });
    return tx.transactionHash;
  },
  
  async markShipped(contractAddress: string, trackingNumber: string, account: string) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ESCROW_ABI as any, contractAddress);
    const tx = await contract.methods.markShipped(trackingNumber).send({ from: account });
    return tx.transactionHash;
  },
  
  async getState(contractAddress: string) {
    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(ESCROW_ABI as any, contractAddress);
    return await contract.methods.getState().call();
  }
};
