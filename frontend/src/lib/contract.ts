import Web3 from 'web3';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_MOONBEAM_RPC_URL || 'https://rpc.api.moonbase.moonbeam.network';

const ABI = [
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
  async confirmGoods(orderId: string, account: string) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);
    const tx = await contract.methods.confirmGoods().send({ from: account });
    return tx.transactionHash;
  },
  
  async stakeEscrow(amount: string, account: string) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);
    const amountWei = web3.utils.toWei(amount, 'ether');
    const tx = await contract.methods.stake().send({ from: account, value: amountWei });
    return tx.transactionHash;
  },
  
  async markShipped(trackingNumber: string, account: string) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);
    const tx = await contract.methods.markShipped(trackingNumber).send({ from: account });
    return tx.transactionHash;
  },
  
  async getState() {
    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);
    return await contract.methods.getState().call();
  }
};
