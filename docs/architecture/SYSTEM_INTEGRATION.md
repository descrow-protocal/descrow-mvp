# System Integration - Descrow MVP

## Overview

This document outlines how the Backend, Frontend, and Web3 layers integrate to create a cohesive escrow platform. It covers data flow patterns, integration contracts, event synchronization, and deployment orchestration across all system components.

## Integration Architecture

The Descrow MVP follows a three-tier architecture where each layer has distinct responsibilities while maintaining seamless communication:

**Frontend Layer**: Provides user interface for wallet connections, payment processing, and order management. Communicates directly with smart contracts for DOT payments and with the backend for M-Pesa transactions and data retrieval.

**Backend Layer**: Acts as the orchestration hub managing database operations, M-Pesa API integration, smart contract event monitoring, and real-time notifications. Serves as an authorized oracle for recording off-chain payments on the blockchain.

**Web3 Layer**: Provides trustless escrow functionality through smart contracts, manages DOT fund custody, tracks order states, and emits events for off-chain processing. Accepts oracle inputs for M-Pesa payment confirmation.

## Data Flow Patterns

### DOT Payment Integration Flow

**User Initiation**: When users select DOT payment, the frontend directly interacts with their connected Polkadot wallet to prepare and sign transactions. The application calculates exact amounts, validates user balances, and prepares smart contract calls.

**Blockchain Execution**: The signed transaction calls the smart contract's fund_order_dot function, transferring DOT tokens to the contract's escrow. The contract validates the payment amount, updates order status, and emits OrderFunded events.

**Backend Synchronization**: The backend's event listener detects the OrderFunded event, updates the database to reflect the payment, and sends real-time notifications to both buyer and seller through WebSocket connections.

**Status Propagation**: The frontend receives real-time updates about the payment confirmation and updates the user interface to show the funded status. Users see immediate feedback about successful blockchain transactions.

### M-Pesa Payment Integration Flow

**Payment Initiation**: Users selecting M-Pesa payment provide their phone number through the frontend, which sends a payment request to the backend API. The backend validates the phone number format and initiates an STK push through the M-Pesa Daraja API.

**STK Push Processing**: The M-Pesa system sends a payment prompt to the user's phone. The frontend displays instructions and monitors payment status through polling or WebSocket updates while the user completes the mobile payment.

**Webhook Confirmation**: When the user completes payment, M-Pesa sends a webhook confirmation to the backend. The backend validates the webhook signature, extracts transaction details, and updates the database with payment information.

**Oracle Recording**: After confirming the M-Pesa payment, the backend acts as an authorized oracle and calls the smart contract's record_offchain_payment function to record the payment on-chain, maintaining audit trails.

**Notification Distribution**: The backend sends real-time notifications to the frontend about payment confirmation, and the smart contract emits events that are processed by the event monitoring system for complete synchronization.

### Order Lifecycle Integration

**Order Creation Synchronization**: When orders are created, the frontend sends requests to the backend, which creates database records and corresponding smart contract orders. The contract assigns order IDs that are stored in the database for cross-reference.

**Status Update Coordination**: Order status changes can originate from either the frontend (user actions) or smart contract (automated processes). The backend ensures both the database and blockchain remain synchronized through event monitoring and API calls.

**Real-time Update Distribution**: All order status changes are immediately distributed to relevant users through WebSocket connections. The frontend updates its interface in real-time, providing users with current information about their orders.

## API Integration Contracts

### Shared Data Models

**Order Structure Consistency**: All three layers use consistent order data structures with the same field names, data types, and validation rules. This ensures seamless data exchange and reduces integration complexity.

**Event Schema Standardization**: Smart contract events, backend API responses, and frontend state updates follow standardized schemas. This consistency enables reliable data processing across all system components.

**Error Handling Uniformity**: Error codes, messages, and handling patterns are consistent across all layers. Users receive coherent error messages regardless of which layer encounters issues.

### API Endpoint Design

**RESTful Interface**: The backend provides RESTful APIs that map directly to smart contract functions and database operations. Endpoint naming conventions reflect the underlying business operations for clarity.

**Authentication Integration**: API endpoints integrate with wallet-based authentication where users sign messages with their private keys to prove identity. This eliminates traditional password-based authentication while maintaining security.

**Rate Limiting Coordination**: API rate limits are designed to prevent abuse while allowing normal user workflows. Limits consider both user actions and automated system processes like event monitoring.

### Real-time Communication

**WebSocket Event Distribution**: The backend maintains WebSocket connections with frontend clients to provide real-time updates about order changes, payment confirmations, and system notifications.

**Event Filtering**: Users receive only relevant events based on their involvement in orders. Buyers see updates about their purchases, sellers see updates about their sales, and administrators see dispute-related events.

**Connection Management**: WebSocket connections are automatically restored if dropped, and missed events are replayed to ensure users don't lose important updates during temporary disconnections.

## Event Synchronization

### Blockchain Event Processing

**Real-time Monitoring**: The backend maintains persistent connections to Polkadot nodes to monitor smart contract events in real-time. Event processing ensures the off-chain database stays synchronized with on-chain state changes.

**Event Ordering**: Events are processed in chronological order to maintain data consistency. The system handles potential blockchain reorganizations by monitoring block confirmations and adjusting processed events accordingly.

**Failure Recovery**: Failed event processing attempts are queued for retry with exponential backoff. This ensures no critical state changes are lost due to temporary network issues or processing failures.

### Cross-Layer Synchronization

**State Consistency Checks**: Regular synchronization processes compare database states with smart contract states to detect and resolve any inconsistencies. Discrepancies trigger automatic reconciliation processes.

**Audit Trail Maintenance**: All state changes are logged with timestamps, transaction hashes, and responsible parties. This creates comprehensive audit trails for debugging and compliance purposes.

**Conflict Resolution**: When conflicts arise between different data sources, the smart contract state is considered authoritative for financial transactions, while the database provides additional metadata and user information.

## Error Handling and Recovery

### Transaction Failure Management

**DOT Payment Failures**: When DOT transactions fail, the system checks blockchain state to determine if the failure occurred before or after fund transfer. Users are provided with appropriate recovery options including transaction retry or alternative payment methods.

**M-Pesa Payment Failures**: Failed M-Pesa payments are handled by checking the actual payment status with M-Pesa APIs before taking corrective action. Users receive clear feedback about payment failures and retry options.

**Smart Contract Errors**: Contract function failures are caught and translated into user-friendly error messages. The system provides guidance on resolving issues like insufficient funds or invalid order states.

### Data Synchronization Recovery

**Event Replay Mechanisms**: When event processing fails or falls behind, the system can replay events from specific block numbers to restore synchronization. This ensures no critical updates are permanently lost.

**Database Consistency Checks**: Regular consistency checks compare off-chain data with on-chain state to identify and resolve discrepancies. Automated reconciliation processes handle most common inconsistencies.

**Manual Recovery Tools**: Administrative tools allow manual intervention for complex recovery scenarios. These tools provide detailed information about system state and enable targeted corrections.

## Security Integration

### Multi-Layer Security

**Frontend Security**: The frontend validates all user inputs, sanitizes data before display, and implements proper authentication flows. It never stores sensitive information like private keys or payment credentials.

**Backend Security**: The backend implements comprehensive input validation, rate limiting, authentication verification, and secure communication with external APIs. All sensitive operations are logged for audit purposes.

**Smart Contract Security**: The contract enforces access controls, validates all function parameters, and implements reentrancy protection. Emergency pause functionality provides additional security during incidents.

### Cross-Layer Authentication

**Wallet-Based Identity**: Users authenticate using their Polkadot wallet signatures, providing cryptographic proof of identity without traditional passwords. This authentication method works consistently across all system layers.

**Session Management**: Authenticated sessions are managed securely with JWT tokens that include user roles and permissions. Token validation occurs at both API and smart contract levels where applicable.

**Permission Enforcement**: User permissions are enforced consistently across all layers. Buyers can only access their orders, sellers can only modify their products, and administrators have elevated privileges for dispute resolution.

## Deployment Orchestration

### Environment Management

**Configuration Consistency**: All system components use consistent configuration management with environment-specific settings for database connections, API endpoints, and smart contract addresses.

**Service Dependencies**: Deployment scripts ensure proper startup order with database initialization, smart contract deployment, backend service startup, and frontend build deployment occurring in the correct sequence.

**Health Check Integration**: Each component provides health check endpoints that verify connectivity to dependent services. Load balancers and orchestration systems use these checks to ensure system reliability.

### Monitoring Integration

**Comprehensive Logging**: All system components use structured logging with consistent formats and correlation IDs. This enables effective debugging and system monitoring across the entire platform.

**Performance Monitoring**: Key performance metrics are collected from all layers including transaction processing times, API response times, and smart contract execution costs. This data helps identify optimization opportunities.

**Alert Coordination**: Monitoring systems coordinate alerts across all components to provide comprehensive incident detection. Alerts include context from multiple layers to facilitate rapid problem resolution.

### Backup and Recovery

**Data Backup Strategy**: Database backups are coordinated with blockchain state snapshots to ensure consistent recovery points. IPFS content is backed up to prevent data loss.

**Disaster Recovery**: Recovery procedures account for all system components with clear priorities for service restoration. Critical functions like payment processing are prioritized during recovery operations.

**Testing Procedures**: Regular disaster recovery testing ensures all components can be restored correctly and that data consistency is maintained across recovery scenarios.

## Performance Optimization

### Cross-Layer Caching

**Multi-Level Caching**: Frequently accessed data is cached at multiple levels including browser caches, API response caches, and database query caches. Cache invalidation strategies ensure data consistency.

**Smart Contract Optimization**: Contract functions are optimized for gas efficiency while maintaining security and functionality. Batch operations reduce transaction costs for users.

**Network Optimization**: API calls are minimized through efficient data fetching strategies, and blockchain interactions are batched where possible to reduce network overhead.

### Scalability Considerations

**Horizontal Scaling**: System components are designed for horizontal scaling with stateless services, database read replicas, and load balancing across multiple instances.

**Resource Management**: Resource usage is monitored and optimized across all components. Database connections are pooled, and smart contract calls are optimized for efficiency.

**Growth Planning**: The architecture supports growth through modular design, efficient data structures, and scalable infrastructure patterns that can handle increased user loads.

This system integration approach ensures all components work together seamlessly while maintaining security, performance, and reliability. The integration patterns support both current MVP requirements and future platform expansion needs.


# System Integration - Descrow MVP

## Overview

This document outlines how the Backend, Frontend, and Web3 layers integrate to create a cohesive escrow platform. It covers data flow, API contracts, event handling, and deployment orchestration.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   React     │  │  Polkadot   │  │   Socket    │            │
│  │    App      │  │   Wallet    │  │   Client    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │ HTTP/REST          │ Direct             │ WebSocket
           │                    │ Contract           │
           ▼                    │ Calls              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Express   │  │  Polkadot   │  │   Socket    │            │
│  │   Server    │  │   Client    │  │   Server    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│           │              │                    │                │
│           │              │ Contract Events    │                │
│           ▼              ▼                    ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │   M-Pesa    │  │    IPFS     │            │
│  │ Database    │  │    API      │  │   Storage   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Oracle Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WEB3 LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    ink!     │  │  Polkadot   │  │   Events    │            │
│  │  Contract   │  │    Node     │  │   System    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### 1. DOT Payment Flow Integration

```typescript
// Frontend: Initiate DOT payment
const handleDotPayment = async (orderId: number, amount: string) => {
  try {
    // 1. Connect wallet
    const injector = await web3FromAddress(selectedAccount.address);
    
    // 2. Call smart contract directly
    const contract = new ContractPromise(api, contractAbi, contractAddress);
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 1000000000,
      proofSize: 64 * 1024,
    });
    
    // 3. Execute transaction
    const tx = await contract.tx.fundOrderDot(
      { gasLimit, storageDepositLimit: null, value: amount },
      orderId
    );
    
    const result = await tx.signAndSend(
      selectedAccount.address,
      { signer: injector.signer },
      (status) => {
        if (status.isInBlock) {
          // 4. Update UI optimistically
          dispatch(updateOrderStatus({ orderId, status: 'funded' }));
        }
      }
    );
    
    return result;
  } catch (error) {
    console.error('DOT payment failed:', error);
    throw error;
  }
};

// Backend: Listen for contract events
class ContractEventListener {
  async subscribeToOrderEvents() {
    const contract = new ContractPromise(this.api, contractAbi, contractAddress);
    
    contract.events.OrderFunded((event) => {
      this.handleOrderFunded(event);
    });
  }
  
  private async handleOrderFunded(event: ContractEvent) {
    const { orderId, buyer, amount } = event.data;
    
    // 1. Update database
    await prisma.order.update({
      where: { contract_order_id: orderId },
      data: { 
        status: 'funded',
        funded_at: new Date()
      }
    });
    
    // 2. Notify frontend via WebSocket
    this.socketService.emitToUser(buyer, 'orderUpdate', {
      orderId,
      status: 'funded',
      message: 'Payment confirmed on blockchain'
    });
    
    // 3. Send notification
    await this.notificationService.sendOrderUpdate(orderId, 'funded');
  }
}
```

### 2. M-Pesa Payment Flow Integration

```typescript
// Frontend: Initiate M-Pesa payment
const handleMpesaPayment = async (orderId: number, phoneNumber: string) => {
  try {
    // 1. Call backend API
    const response = await api.post(`/orders/${orderId}/pay/mpesa`, {
      phoneNumber
    });
    
    const { checkoutRequestId } = response.data;
    
    // 2. Show STK push modal
    setShowStkModal(true);
    setCheckoutRequestId(checkoutRequestId);
    
    // 3. Poll for payment status
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await api.get(`/mpesa/stk-status/${checkoutRequestId}`);
        const { status } = statusResponse.data;
        
        if (status === 'success') {
          clearInterval(pollInterval);
          setShowStkModal(false);
          dispatch(updateOrderStatus({ orderId, status: 'funded' }));
          showNotification('Payment successful!', 'success');
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(pollInterval);
          setShowStkModal(false);
          showNotification('Payment failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 3000);
    
    // 4. Clear interval after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
    
  } catch (error) {
    console.error('M-Pesa payment failed:', error);
    throw error;
  }
};

// Backend: Handle M-Pesa webhook
export const handleMpesaWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // 1. Validate webhook signature
    const isValid = mpesaService.validateWebhookSignature(
      JSON.stringify(payload),
      req.headers['x-signature'] as string
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Process payment confirmation
    const { Body } = payload;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;
    
    if (ResultCode === 0) { // Success
      const amount = CallbackMetadata.Item.find(
        (item: any) => item.Name === 'Amount'
      )?.Value;
      
      const mpesaReceiptNumber = CallbackMetadata.Item.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      
      // 3. Update database
      const order = await prisma.order.findFirst({
        where: { mpesa_checkout_id: CheckoutRequestID }
      });
      
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'funded',
            mpesa_tx_ref: mpesaReceiptNumber,
            funded_at: new Date()
          }
        });
        
        // 4. Record payment on smart contract
        await polkadotService.recordOffchainPayment(
          order.contract_order_id!,
          mpesaReceiptNumber
        );
        
        // 5. Notify frontend
        socketService.emitToUser(order.buyer_id, 'orderUpdate', {
          orderId: order.id,
          status: 'funded',
          message: 'M-Pesa payment confirmed'
        });
      }
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### 3. Real-time Event Synchronization

```typescript
// Backend: Event synchronization service
class EventSyncService {
  private lastProcessedBlock: number = 0;
  
  async startEventSync() {
    // 1. Get last processed block from database
    const syncState = await prisma.syncState.findFirst();
    this.lastProcessedBlock = syncState?.last_block || 0;
    
    // 2. Subscribe to new blocks
    this.api.rpc.chain.subscribeNewHeads(async (header) => {
      const blockNumber = header.number.toNumber();
      await this.processBlockEvents(blockNumber);
      this.lastProcessedBlock = blockNumber;
      
      // 3. Update sync state
      await prisma.syncState.upsert({
        where: { id: 1 },
        update: { last_block: blockNumber },
        create: { id: 1, last_block: blockNumber }
      });
    });
  }
  
  private async processBlockEvents(blockNumber: number) {
    const blockHash = await this.api.rpc.chain.getBlockHash(blockNumber);
    const events = await this.api.query.system.events.at(blockHash);
    
    for (const record of events) {
      const { event } = record;
      
      if (event.section === 'contracts' && event.method === 'ContractEmitted') {
        await this.handleContractEvent(event.data);
      }
    }
  }
  
  private async handleContractEvent(eventData: any) {
    const [contractAddress, eventBytes] = eventData;
    
    if (contractAddress.toString() === this.contractAddress) {
      // Decode event based on contract ABI
      const decodedEvent = this.decodeContractEvent(eventBytes);
      await this.processDecodedEvent(decodedEvent);
    }
  }
}

// Frontend: Real-time updates via WebSocket
const useOrderUpdates = (orderId: number) => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (socket && orderId) {
      // Join order-specific room
      socket.emit('joinOrder', orderId);
      
      // Listen for order updates
      socket.on('orderUpdate', (data: OrderUpdateEvent) => {
        if (data.orderId === orderId) {
          dispatch(ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            Object.assign(draft, data.updates);
          }));
          
          // Show notification
          toast.success(data.message || 'Order updated');
        }
      });
      
      // Listen for payment confirmations
      socket.on('paymentConfirmed', (data: PaymentConfirmedEvent) => {
        if (data.orderId === orderId) {
          dispatch(ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            draft.status = 'funded';
            draft.mpesa_tx_ref = data.transactionRef;
          }));
          
          toast.success('Payment confirmed!');
        }
      });
      
      return () => {
        socket.emit('leaveOrder', orderId);
        socket.off('orderUpdate');
        socket.off('paymentConfirmed');
      };
    }
  }, [socket, orderId, dispatch]);
};
```

## API Integration Contracts

### 1. Order Management API

```typescript
// Shared types between frontend and backend
interface CreateOrderRequest {
  productId: number;
  paymentMode: 'dot' | 'mpesa';
  deliveryAddress: string;
  phoneNumber?: string; // Required for M-Pesa
}

interface CreateOrderResponse {
  order: Order;
  contractOrderId?: number;
  checkoutRequestId?: string; // For M-Pesa
}

interface OrderUpdateRequest {
  action: 'ship' | 'confirm' | 'dispute';
  trackingCid?: string;
  evidenceCid?: string;
  reason?: string;
}

// Frontend API client
class OrdersApiClient {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await this.httpClient.post('/api/orders', data);
    return response.data;
  }
  
  async payWithDot(orderId: number): Promise<{ contractOrderId: number }> {
    const response = await this.httpClient.post(`/api/orders/${orderId}/pay/dot`);
    return response.data;
  }
  
  async payWithMpesa(orderId: number, phoneNumber: string): Promise<{ checkoutRequestId: string }> {
    const response = await this.httpClient.post(`/api/orders/${orderId}/pay/mpesa`, {
      phoneNumber
    });
    return response.data;
  }
  
  async updateOrder(orderId: number, update: OrderUpdateRequest): Promise<Order> {
    const response = await this.httpClient.put(`/api/orders/${orderId}`, update);
    return response.data;
  }
}

// Backend API implementation
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { productId, paymentMode, deliveryAddress, phoneNumber } = req.body;
    const userId = req.user.id;
    
    // 1. Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 2. Create order in database
    const order = await prisma.order.create({
      data: {
        product_id: productId,
        buyer_id: userId,
        seller_id: product.seller_id,
        amount_dot: product.price_dot,
        payment_mode: paymentMode,
        delivery_address: deliveryAddress,
        status: 'created'
      },
      include: {
        product: true,
        buyer: true,
        seller: true
      }
    });
    
    // 3. Create order on smart contract
    const contractOrderId = await polkadotService.createOrder(
      product.metadata_cid,
      product.price_dot.toString()
    );
    
    // 4. Update order with contract reference
    await prisma.order.update({
      where: { id: order.id },
      data: { contract_order_id: contractOrderId }
    });
    
    let checkoutRequestId: string | undefined;
    
    // 5. Initiate M-Pesa payment if selected
    if (paymentMode === 'mpesa' && phoneNumber) {
      const mpesaResponse = await mpesaService.initiateSTKPush(
        phoneNumber,
        parseFloat(product.price_dot) * 1500, // Convert DOT to KES
        order.id
      );
      
      checkoutRequestId = mpesaResponse.CheckoutRequestID;
      
      await prisma.order.update({
        where: { id: order.id },
        data: { mpesa_checkout_id: checkoutRequestId }
      });
    }
    
    res.status(201).json({
      order: { ...order, contract_order_id: contractOrderId },
      contractOrderId,
      checkoutRequestId
    });
    
  } catch (error) {
    console.error('Create order failed:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
```

### 2. IPFS Integration

```typescript
// Shared IPFS service
class IPFSIntegrationService {
  // Frontend: Upload files to IPFS via backend
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const { cid } = await response.json();
    return cid;
  }
  
  // Backend: Handle file uploads
  async handleFileUpload(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      // Upload to IPFS
      const cid = await this.ipfsService.uploadFile(file.buffer, file.originalname);
      
      // Store metadata in database
      await prisma.ipfsFile.create({
        data: {
          cid,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          uploader_id: req.user.id
        }
      });
      
      res.json({ cid });
    } catch (error) {
      console.error('File upload failed:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
  
  // Smart contract: Store CID references
  async storeMetadataCID(productData: any): Promise<string> {
    const metadata = {
      title: productData.title,
      description: productData.description,
      images: productData.imageCids,
      category: productData.category,
      specifications: productData.specifications,
      timestamp: Date.now()
    };
    
    const cid = await this.ipfsService.uploadJSON(metadata);
    return cid;
  }
}
```

## Error Handling & Recovery

### 1. Transaction Failure Recovery

```typescript
// Frontend: Handle transaction failures
class TransactionRecoveryService {
  async handleFailedDotPayment(orderId: number, error: any) {
    // 1. Check if transaction was actually successful
    const order = await api.get(`/orders/${orderId}`);
    
    if (order.data.status === 'funded') {
      // Transaction succeeded despite error
      dispatch(updateOrderStatus({ orderId, status: 'funded' }));
      return;
    }
    
    // 2. Check blockchain state
    const contractOrder = await this.checkContractOrderStatus(orderId);
    
    if (contractOrder?.status === 'Funded') {
      // Contract shows funded, sync with backend
      await api.post(`/orders/${orderId}/sync-blockchain`);
      dispatch(updateOrderStatus({ orderId, status: 'funded' }));
      return;
    }
    
    // 3. Show retry option
    this.showRetryDialog(orderId, error);
  }
  
  async handleFailedMpesaPayment(orderId: number, checkoutRequestId: string) {
    // 1. Query M-Pesa status directly
    const status = await api.get(`/mpesa/stk-status/${checkoutRequestId}`);
    
    if (status.data.status === 'success') {
      // Payment succeeded, wait for webhook processing
      this.showPaymentProcessingDialog();
      return;
    }
    
    // 2. Show payment options
    this.showPaymentRetryDialog(orderId);
  }
}

// Backend: Sync blockchain state
export const syncBlockchainState = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order?.contract_order_id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check contract state
    const contractOrder = await polkadotService.getOrder(order.contract_order_id);
    
    // Sync database with contract state
    if (contractOrder.status !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: contractOrder.status.toLowerCase(),
          funded_at: contractOrder.funded_at ? new Date(contractOrder.funded_at) : null,
          shipped_at: contractOrder.shipped_at ? new Date(contractOrder.shipped_at) : null,
          delivered_at: contractOrder.delivered_at ? new Date(contractOrder.delivered_at) : null
        }
      });
      
      // Notify frontend
      socketService.emitToUser(order.buyer_id, 'orderUpdate', {
        orderId: order.id,
        status: contractOrder.status.toLowerCase(),
        message: 'Order status synchronized with blockchain'
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Blockchain sync failed:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
};
```

### 2. Event Processing Recovery

```typescript
// Backend: Event replay mechanism
class EventReplayService {
  async replayMissedEvents(fromBlock: number, toBlock: number) {
    console.log(`Replaying events from block ${fromBlock} to ${toBlock}`);
    
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      try {
        await this.processBlockEvents(blockNumber);
        
        // Update progress
        await prisma.syncState.upsert({
          where: { id: 1 },
          update: { last_block: blockNumber },
          create: { id: 1, last_block: blockNumber }
        });
        
      } catch (error) {
        console.error(`Failed to process block ${blockNumber}:`, error);
        // Continue with next block
      }
    }
  }
  
  async handleEventProcessingFailure(event: any, error: Error) {
    // Store failed event for retry
    await prisma.failedEvent.create({
      data: {
        event_data: JSON.stringify(event),
        error_message: error.message,
        retry_count: 0,
        created_at: new Date()
      }
    });
  }
  
  async retryFailedEvents() {
    const failedEvents = await prisma.failedEvent.findMany({
      where: {
        retry_count: { lt: 3 },
        next_retry_at: { lte: new Date() }
      }
    });
    
    for (const failedEvent of failedEvents) {
      try {
        const eventData = JSON.parse(failedEvent.event_data);
        await this.processDecodedEvent(eventData);
        
        // Delete successful retry
        await prisma.failedEvent.delete({
          where: { id: failedEvent.id }
        });
        
      } catch (error) {
        // Increment retry count
        await prisma.failedEvent.update({
          where: { id: failedEvent.id },
          data: {
            retry_count: failedEvent.retry_count + 1,
            next_retry_at: new Date(Date.now() + Math.pow(2, failedEvent.retry_count) * 60000),
            last_error: error.message
          }
        });
      }
    }
  }
}
```

## Deployment Integration

### 1. Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: descrow
      POSTGRES_USER: descrow_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U descrow_user -d descrow"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://descrow_user:${DB_PASSWORD}@postgres:5432/descrow
      REDIS_URL: redis://redis:6379
      POLKADOT_WS_URL: ${POLKADOT_WS_URL}
      CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}
      ORACLE_SEED: ${ORACLE_SEED}
      MPESA_CONSUMER_KEY: ${MPESA_CONSUMER_KEY}
      MPESA_CONSUMER_SECRET: ${MPESA_CONSUMER_SECRET}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${FRONTEND_API_URL}
        REACT_APP_WS_URL: ${FRONTEND_WS_URL}
        REACT_APP_CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}
        REACT_APP_IPFS_GATEWAY: ${IPFS_GATEWAY}
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy

  # IPFS node (optional)
  ipfs:
    image: ipfs/go-ipfs:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs_data:/data/ipfs

volumes:
  postgres_data:
  ipfs_data:
```

### 2. Deployment Scripts

```bash
#!/bin/bash
# deploy.sh - Complete deployment script

set -e

echo "🚀 Starting Descrow MVP deployment..."

# 1. Deploy smart contract
echo "📝 Deploying smart contract..."
cd web3
cargo contract build --release

# Deploy to testnet
CONTRACT_ADDRESS=$(cargo contract instantiate \
  --constructor new \
  --args "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" \
  --suri "${DEPLOYMENT_SEED}" \
  --salt $(date +%s) \
  --url "${POLKADOT_WS_URL}" \
  --output-json | jq -r '.contract')

echo "✅ Contract deployed at: $CONTRACT_ADDRESS"

# 2. Update environment variables
echo "🔧 Updating environment variables..."
cd ..
sed -i "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env

# 3. Build and deploy services
echo "🏗️ Building services..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# 4. Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout 300 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 5; done'

# 5. Run database migrations
echo "📊 Running database migrations..."
docker-compose exec backend npm run prisma:migrate

# 6. Verify deployment
echo "🔍 Verifying deployment..."
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost/health || exit 1

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔗 Backend API: http://localhost:3000"
echo "📜 Smart Contract: $CONTRACT_ADDRESS"
```

### 3. Health Monitoring

```typescript
// Backend: Comprehensive health check
export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    services: {
      database: 'unknown',
      polkadot: 'unknown',
      ipfs: 'unknown',
      mpesa: 'unknown',
      redis: 'unknown'
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeConnections: 0
    }
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  try {
    // Check Polkadot connection
    const chainInfo = await polkadotService.api.rpc.system.chain();
    health.services.polkadot = 'ok';
  } catch (error) {
    health.services.polkadot = 'error';
    health.status = 'degraded';
  }

  try {
    // Check IPFS
    await ipfsService.getFile('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn');
    health.services.ipfs = 'ok';
  } catch (error) {
    health.services.ipfs = 'error';
  }

  try {
    // Check M-Pesa (generate token)
    await mpesaService.generateAccessToken();
    health.services.mpesa = 'ok';
  } catch (error) {
    health.services.mpesa = 'error';
  }

  try {
    // Check Redis
    await redisClient.ping();
    health.services.redis = 'ok';
  } catch (error) {
    health.services.redis = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};

// Frontend: Service status monitoring
const useServiceHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const healthData = await response.json();
        setHealth(healthData);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth({ status: 'error', services: {} });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { health, loading };
};
```

This system integration documentation provides a complete picture of how all three layers work together to create a seamless, reliable escrow platform with proper error handling, monitoring, and deployment strategies.