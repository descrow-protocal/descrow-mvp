import type { Product } from '@/contexts/CartContext';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Quantum Processor Unit',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
    description: 'Next-gen quantum computing chip for advanced blockchain operations',
    category: 'Hardware',
  },
  {
    id: '2',
    name: 'Neural Interface Headset',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop',
    description: 'Direct brain-to-blockchain interface for seamless transactions',
    category: 'Wearables',
  },
  {
    id: '3',
    name: 'Crypto Mining Rig',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop',
    description: 'High-performance mining system with optimized cooling',
    category: 'Hardware',
  },
  {
    id: '4',
    name: 'Blockchain Security Key',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
    description: 'Hardware wallet with military-grade encryption',
    category: 'Security',
  },
  {
    id: '5',
    name: 'Smart Contract Analyzer',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    description: 'AI-powered tool for auditing smart contracts',
    category: 'Software',
  },
  {
    id: '6',
    name: 'Decentralized Storage Drive',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=600&fit=crop',
    description: 'IPFS-compatible storage device with 2TB capacity',
    category: 'Storage',
  },
  {
    id: '7',
    name: 'Web3 Developer Kit',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    description: 'Complete toolkit for building dApps on Polkadot',
    category: 'Software',
  },
  {
    id: '8',
    name: 'NFT Display Frame',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&h=600&fit=crop',
    description: 'Digital frame for showcasing your NFT collection',
    category: 'Display',
  },
];

export type EscrowStatus = 'pending' | 'funded' | 'in_transit' | 'delivered' | 'completed' | 'disputed';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  escrowStatus: EscrowStatus;
  buyerAddress: string;
  sellerAddress: string;
  escrowAddress: string;
  transactionHash: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  escrowReleaseDate?: string;
}

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    date: '2024-11-10T10:30:00Z',
    items: [
      {
        productId: '1',
        productName: 'Quantum Processor Unit',
        productImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
        quantity: 1,
        price: 299.99,
      },
    ],
    totalAmount: 299.99,
    escrowStatus: 'in_transit',
    buyerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    sellerAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    escrowAddress: '0x1234567890123456789012345678901234567890',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    trackingNumber: 'TRK-QP-2024-001',
    estimatedDelivery: '2024-11-20',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    date: '2024-11-08T14:20:00Z',
    items: [
      {
        productId: '4',
        productName: 'Blockchain Security Key',
        productImage: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
        quantity: 2,
        price: 79.99,
      },
    ],
    totalAmount: 159.98,
    escrowStatus: 'delivered',
    buyerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    sellerAddress: '0x9ba2f209661cE543914156Ac247eee85fEA93',
    escrowAddress: '0x2345678901234567890123456789012345678901',
    transactionHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
    trackingNumber: 'TRK-BSK-2024-002',
    estimatedDelivery: '2024-11-15',
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    date: '2024-11-05T09:15:00Z',
    items: [
      {
        productId: '2',
        productName: 'Neural Interface Headset',
        productImage: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop',
        quantity: 1,
        price: 499.99,
      },
      {
        productId: '5',
        productName: 'Smart Contract Analyzer',
        productImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        quantity: 1,
        price: 149.99,
      },
    ],
    totalAmount: 649.98,
    escrowStatus: 'completed',
    buyerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    sellerAddress: '0x7ba3f309771dF654025267Bc358ffe96gFB94',
    escrowAddress: '0x3456789012345678901234567890123456789012',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    trackingNumber: 'TRK-NIH-2024-003',
    estimatedDelivery: '2024-11-12',
    escrowReleaseDate: '2024-11-13T16:45:00Z',
  },
];

export const getEscrowStatusColor = (status: EscrowStatus): string => {
  const colors: Record<EscrowStatus, string> = {
    pending: 'text-yellow-500',
    funded: 'text-blue-500',
    in_transit: 'text-purple-500',
    delivered: 'text-green-500',
    completed: 'text-gray-500',
    disputed: 'text-red-500',
  };
  return colors[status];
};

export const getEscrowStatusLabel = (status: EscrowStatus): string => {
  const labels: Record<EscrowStatus, string> = {
    pending: 'Pending Payment',
    funded: 'Payment Received',
    in_transit: 'In Transit',
    delivered: 'Delivered - Awaiting Confirmation',
    completed: 'Completed',
    disputed: 'Disputed',
  };
  return labels[status];
};
