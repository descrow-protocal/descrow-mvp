export interface Order {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: string;
  status: OrderStatus;
  contractOrderId?: number;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  Created = 'created',
  Funded = 'funded',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Completed = 'completed',
  Disputed = 'disputed'
}

export interface User {
  id: number;
  accountId: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface ContractEvent {
  orderId: number;
  data: any;
}
