import { ethers } from 'ethers';
import { OrderStatus } from '../types/index.js';
import { query } from '../config/database.js';

const ABI = [
  'constructor(address _seller, uint256 _price, uint256 _disputeWindow)',
  'error DisputeNotTimedOut()',
  'error InsufficientAmount()',
  'error InvalidState()',
  'error NotBuyer()',
  'error NotSeller()',
  'error TransferFailed()',
  'event Delivered()',
  'event DisputeOpened(uint256 deadline)',
  'event DisputeResolved(address indexed winner, uint256 amount)',
  'event Funded(address indexed buyer, uint256 amount)',
  'event FundsReleased(address indexed seller, uint256 amount)',
  'event GoodsConfirmed(address indexed buyer)',
  'event Shipped(string trackingNumber)',
  'function buyer() view returns (address)',
  'function confirmGoods()',
  'function disputeDeadline() view returns (uint256)',
  'function disputeWindow() view returns (uint256)',
  'function getState() view returns (uint8)',
  'function markDelivered()',
  'function markShipped(string _trackingNumber)',
  'function openDispute()',
  'function price() view returns (uint256)',
  'function resolveDispute(bool refundBuyer)',
  'function seller() view returns (address)',
  'function stake() payable',
  'function state() view returns (uint8)',
  'function trackingNumber() view returns (string)'
];

class BlockchainService {
  private provider?: ethers.WebSocketProvider;
  private contract?: ethers.Contract;

  async initialize() {
    this.provider = new ethers.WebSocketProvider(process.env.RPC_WS_URL!);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS!,
      ABI,
      this.provider
    );

    console.log('✅ Blockchain service initialized');
  }

  async subscribeToEvents() {
    if (!this.contract) throw new Error('Contract not initialized');

    console.log('👂 Listening for contract events...');

    this.contract.on('Funded', async (buyer, amount, event) => {
      await this.handleOrderFunded(event.address, buyer, amount);
    });

    this.contract.on('Shipped', async (trackingNumber, event) => {
      await this.handleOrderShipped(event.address, trackingNumber);
    });

    this.contract.on('Delivered', async (event) => {
      await this.handleOrderDelivered(event.address);
    });

    this.contract.on('GoodsConfirmed', async (buyer, event) => {
      await this.handleOrderCompleted(event.address);
    });
  }

  private async handleOrderFunded(contractAddress: string, buyer: string, amount: bigint) {
    await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE contract_address = $2',
      [OrderStatus.Funded, contractAddress]
    );
    console.log(`📦 Order ${contractAddress} funded by ${buyer}`);
  }

  private async handleOrderShipped(contractAddress: string, trackingNumber: string) {
    await query(
      'UPDATE orders SET status = $1, tracking_number = $2, updated_at = NOW() WHERE contract_address = $3',
      [OrderStatus.Shipped, trackingNumber, contractAddress]
    );
    console.log(`🚚 Order ${contractAddress} shipped`);
  }

  private async handleOrderDelivered(contractAddress: string) {
    await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE contract_address = $2',
      [OrderStatus.Delivered, contractAddress]
    );
    console.log(`✅ Order ${contractAddress} delivered`);
  }

  private async handleOrderCompleted(contractAddress: string) {
    await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE contract_address = $2',
      [OrderStatus.Completed, contractAddress]
    );
    console.log(`✅ Order ${contractAddress} completed`);
  }

  async disconnect() {
    await this.provider?.destroy();
  }
}

export const blockchainService = new BlockchainService();
