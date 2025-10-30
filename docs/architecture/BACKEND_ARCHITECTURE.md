# Backend Architecture - Descrow MVP

## Overview

The backend serves as the orchestration layer between the frontend UI, smart contracts, and external payment systems. It acts as an authorized oracle for M-Pesa transactions and provides real-time updates via WebSocket connections.

## Core Responsibilities

1. **Oracle Functions**: Record off-chain M-Pesa payments on smart contract
2. **Payment Processing**: Handle M-Pesa STK push and B2C payouts
3. **Event Listening**: Monitor smart contract events and update database
4. **API Gateway**: Provide REST endpoints for frontend operations
5. **Real-time Updates**: WebSocket notifications for order status changes
6. **Authentication**: JWT-based user sessions and admin access control

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Polkadot.js API
- **Payments**: M-Pesa Daraja API
- **Storage**: IPFS (Pinata/Infura)
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt
- **Validation**: Joi/Zod
- **Testing**: Jest + Supertest

## Project Structure

The backend follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses, validate inputs, and coordinate service calls
- **Services**: Contain business logic for blockchain interactions, payment processing, and file management
- **Middleware**: Provide cross-cutting concerns like authentication, validation, and error handling
- **Models**: Define database schemas and relationships using Prisma ORM
- **Routes**: Define API endpoints and their corresponding controller methods
- **Utils**: Contain helper functions for cryptography, validation, and logging
- **Config**: Store configuration for database, blockchain, and external service connections

## Database Design

### Core Tables Structure

**Users Table**: Stores user account information including Polkadot wallet addresses, phone numbers for M-Pesa, user roles (buyer/seller/admin), and KYC verification status. Each user has a unique account ID that corresponds to their blockchain wallet address.

**Products Table**: Contains product listings with seller information, pricing in both DOT and USD, product categories, and IPFS content identifiers for images and metadata. Products can be active, inactive, or sold.

**Orders Table**: Tracks the complete order lifecycle from creation to completion. Links buyers and sellers, stores payment information for both DOT and M-Pesa transactions, maintains order status, and references smart contract order IDs.

**Evidence Table**: Manages dispute evidence files stored on IPFS. Links evidence to specific orders and tracks who uploaded each piece of evidence with timestamps for audit trails.

**M-Pesa Transactions Table**: Records all M-Pesa payment attempts including STK push requests and B2C payouts. Stores transaction references, phone numbers, amounts, and raw API responses for debugging.

**Notifications Table**: Manages user notifications for order updates, payment confirmations, and system alerts. Tracks read status and provides message content for real-time updates.

## Core Services

### Polkadot Service

**Contract Interaction Functions**: This service manages all blockchain interactions with the smart contract. It creates new orders on-chain with product metadata, records off-chain M-Pesa payments as an authorized oracle, updates order status when sellers mark items as shipped, processes delivery confirmations from buyers, and manages dispute creation and resolution workflows.

**Event Listening Capabilities**: The service maintains persistent connections to monitor smart contract events in real-time. It processes OrderFunded events to update the database and notify users, handles OrderShipped events to trigger delivery tracking, manages OrderDelivered events to initiate fund release or B2C payouts, and processes dispute events to alert administrators.

**Utility Operations**: Provides functions to retrieve order details directly from the blockchain, check account balances for payment validation, and maintain connection health with the Polkadot node.

### M-Pesa Service

**STK Push Operations**: Handles the initiation of payment requests that appear on customer phones through Safaricom's STK push service. Generates secure checkout requests with proper authentication, polls payment status until completion or timeout, and manages customer payment confirmations and failures.

**B2C Payout Operations**: Processes seller payouts after successful delivery confirmation. Calculates appropriate amounts including platform fees, manages payout failures with retry mechanisms, and maintains detailed transaction records for audit purposes.

**Webhook Processing**: Validates incoming payment confirmations from Safaricom using signature verification. Processes callback data to extract transaction details, updates order status, and triggers blockchain recording of successful payments.

### IPFS Service

**File Management**: Handles uploads of product images and returns content-addressed identifiers for immutable storage. Manages dispute evidence files with cryptographic verification, retrieves files using IPFS gateways with fallback options, and validates file integrity using content hashing.

**Metadata Operations**: Creates structured JSON metadata for products including descriptions, specifications, and image references. Stores order tracking information and shipping details, manages evidence packages for dispute resolution, and ensures data immutability through content addressing.

**Storage Optimization**: Implements file compression for efficient storage, manages IPFS pinning to ensure content availability, provides multiple gateway access for reliability, and handles large file uploads through chunking mechanisms.

## API Architecture

### Authentication System

**JWT Token Management**: The system implements JSON Web Token authentication where each user receives a signed token upon login. Authentication middleware extracts tokens from request headers, validates signatures using a secret key, and attaches user information to requests. Invalid or expired tokens result in immediate rejection with appropriate error messages.

**Role-Based Access Control**: Users are assigned roles (buyer, seller, admin) that determine their permissions. The authorization system checks user roles before allowing access to protected endpoints. Sellers can only modify their own products, buyers can only access their orders, and admins have elevated privileges for dispute resolution.

### Input Validation

**Schema-Based Validation**: All incoming requests undergo strict validation using predefined schemas. Order creation requires valid product IDs, payment modes, and delivery addresses. M-Pesa payments additionally require properly formatted Kenyan phone numbers. The validation system provides detailed error messages for invalid inputs.

**Conditional Validation**: Validation rules adapt based on context - M-Pesa payments require phone numbers while DOT payments do not. Address validation ensures minimum length requirements for successful delivery. Product uploads validate image formats and metadata completeness.

### Rate Limiting

**API Protection**: The system implements sliding window rate limiting to prevent abuse. Regular API endpoints allow 100 requests per 15-minute window per IP address. Administrative functions have stricter limits with only 20 requests per 5-minute window to prevent automated attacks on sensitive operations.

## Event Handling

### Smart Contract Event Processing

**Real-Time Event Monitoring**: The backend maintains persistent connections to the Polkadot network to monitor smart contract events. When events are emitted, the system immediately processes them to update the database and notify relevant users, ensuring the off-chain database stays synchronized with on-chain state changes.

**Event Handler Functions**: Each event type has dedicated handlers - OrderFunded events update payment status and notify buyers, OrderShipped events trigger delivery tracking, OrderDelivered events initiate fund release processes, and DisputeRaised events alert administrators and freeze fund transfers.

**Error Recovery Mechanisms**: The event listener includes retry logic for failed processing attempts. Events that fail to process are queued for later retry with exponential backoff, ensuring no critical state changes are lost due to temporary network issues.

## Error Handling

### Centralized Error Processing

**Error Classification**: The system implements comprehensive error handling middleware that catches all unhandled errors and provides appropriate responses. Different error types receive specific handling - validation errors return detailed field-level feedback, while system errors provide generic messages to avoid exposing internal details.

**Security Considerations**: Error messages are sanitized to prevent information leakage. Development environments show detailed error information for debugging, while production environments return generic messages. All errors are logged with full stack traces for administrative review.

## Testing Strategy

### Unit Testing

**Service Layer Testing**: Unit tests focus on individual service functions to ensure they handle various input scenarios correctly. Order creation tests verify that valid data produces expected results while invalid data triggers appropriate errors. External dependencies are mocked to create predictable test environments.

### Integration Testing

**End-to-End API Testing**: Integration tests verify complete request-response cycles through the API endpoints using real database connections. They simulate actual user interactions including authentication, order creation, and payment processing to ensure all system components work together correctly.

**Payment Flow Testing**: Special attention is given to testing both DOT and M-Pesa payment flows. Tests simulate successful payments, failed transactions, and timeout scenarios to ensure the system handles all possible payment outcomes gracefully.

## Performance Optimization

### Database Optimization

**Strategic Indexing**: Database performance is optimized through carefully placed indexes on frequently queried columns. Orders are indexed by buyer ID, seller ID, status, and creation date to support fast filtering and sorting. These indexes significantly reduce query execution time for common operations.

**Query Optimization**: Database queries are optimized to minimize data transfer and processing time. Complex joins are avoided where possible, pagination is implemented for large result sets, and connection pooling ensures efficient resource utilization.

### Caching Strategy

**Redis-Based Caching**: Frequently accessed data like product details and user profiles are cached in Redis with appropriate expiration times. The system implements a cache-aside pattern where the application checks the cache first, then falls back to the database if data is not found.

## Monitoring & Logging

### Structured Logging

**Comprehensive Log Management**: The system implements structured JSON logging with configurable levels (error, warn, info, debug). All logs include timestamps, request IDs, and contextual information for effective debugging. Logs are structured for easy parsing by log aggregation systems.

### Health Monitoring

**Multi-Service Health Checks**: The health check endpoint tests connectivity to all critical services including the database, Polkadot node, IPFS network, and M-Pesa API. Health checks run automatically and provide detailed status information including response times and error messages.

## Deployment Configuration

### Containerization

**Docker Setup**: The backend is packaged as a Docker container using Alpine Linux for minimal size and security. The build process installs only production dependencies, compiles TypeScript to JavaScript, and configures the container to run the application efficiently.

### Environment Management

**Configuration Management**: The system uses environment variables for all configuration including database connections, API keys, and service endpoints. Different environments (development, staging, production) have separate configuration files with appropriate security measures.

This backend architecture provides a robust foundation for the Descrow MVP, handling both on-chain and off-chain operations while maintaining security, scalability, and reliability through comprehensive error handling, monitoring, and testing strategies.


# Backend Architecture - Descrow MVP

## Overview

The backend serves as the orchestration layer between the frontend UI, smart contracts, and external payment systems. It acts as an authorized oracle for M-Pesa transactions and provides real-time updates via WebSocket connections.

## Core Responsibilities

1. **Oracle Functions**: Record off-chain M-Pesa payments on smart contract
2. **Payment Processing**: Handle M-Pesa STK push and B2C payouts
3. **Event Listening**: Monitor smart contract events and update database
4. **API Gateway**: Provide REST endpoints for frontend operations
5. **Real-time Updates**: WebSocket notifications for order status changes
6. **Authentication**: JWT-based user sessions and admin access control

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Polkadot.js API
- **Payments**: M-Pesa Daraja API
- **Storage**: IPFS (Pinata/Infura)
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt
- **Validation**: Joi/Zod
- **Testing**: Jest + Supertest

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── mpesa.controller.ts
│   │   └── admin.controller.ts
│   ├── services/             # Business logic
│   │   ├── polkadot.service.ts
│   │   ├── mpesa.service.ts
│   │   ├── ipfs.service.ts
│   │   ├── order.service.ts
│   │   └── notification.service.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/              # Database models
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   └── evidence.model.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── mpesa.routes.ts
│   │   └── admin.routes.ts
│   ├── utils/               # Utilities
│   │   ├── crypto.utils.ts
│   │   ├── validation.utils.ts
│   │   └── logger.utils.ts
│   ├── config/              # Configuration
│   │   ├── database.config.ts
│   │   ├── polkadot.config.ts
│   │   └── mpesa.config.ts
│   └── app.ts               # Express app setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── tests/                   # Test files
├── docker/                  # Docker configuration
└── package.json
```

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
  kyc_status VARCHAR(20) CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  kyc_documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_dot DECIMAL(18,8) NOT NULL,
  price_usd DECIMAL(10,2),
  category VARCHAR(100),
  images_cid VARCHAR(255),
  metadata_cid VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'sold')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount_dot DECIMAL(18,8) NOT NULL,
  amount_usd DECIMAL(10,2),
  payment_mode VARCHAR(20) CHECK (payment_mode IN ('dot', 'mpesa')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('created', 'funded', 'shipped', 'delivered', 'completed', 'disputed', 'resolved', 'cancelled')) DEFAULT 'created',
  contract_order_id INTEGER,
  mpesa_tx_ref VARCHAR(255),
  mpesa_checkout_id VARCHAR(255),
  tracking_cid VARCHAR(255),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Evidence table for disputes
CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  uploader_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) CHECK (evidence_type IN ('image', 'document', 'video', 'text')),
  cid VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- M-Pesa transactions table
CREATE TABLE mpesa_transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('stk_push', 'b2c_payout')),
  mpesa_receipt_number VARCHAR(255),
  phone_number VARCHAR(20),
  amount DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Core Services

### 1. Polkadot Service

```typescript
interface PolkadotService {
  // Contract interaction
  createOrder(metadata_cid: string, amount: string): Promise<number>;
  recordOffchainPayment(orderId: number, txHash: string): Promise<void>;
  markShipped(orderId: number, trackingCid: string): Promise<void>;
  confirmDelivery(orderId: number): Promise<void>;
  raiseDispute(orderId: number, evidenceCid: string): Promise<void>;
  resolveDispute(orderId: number, resolution: DisputeResolution): Promise<void>;
  
  // Event listening
  subscribeToEvents(): void;
  handleOrderFunded(event: OrderFundedEvent): Promise<void>;
  handleOrderShipped(event: OrderShippedEvent): Promise<void>;
  handleOrderDelivered(event: OrderDeliveredEvent): Promise<void>;
  
  // Utility functions
  getOrderDetails(orderId: number): Promise<ContractOrder>;
  getBalance(accountId: string): Promise<string>;
}
```

### 2. M-Pesa Service

```typescript
interface MpesaService {
  // STK Push operations
  initiateSTKPush(phoneNumber: string, amount: number, orderId: number): Promise<STKPushResponse>;
  querySTKPushStatus(checkoutRequestId: string): Promise<STKPushStatus>;
  
  // B2C Payout operations
  initiateB2CPayout(phoneNumber: string, amount: number, orderId: number): Promise<B2CResponse>;
  
  // Webhook handling
  handleSTKPushCallback(payload: STKPushCallback): Promise<void>;
  validateWebhookSignature(payload: string, signature: string): boolean;
  
  // Utility functions
  generateAccessToken(): Promise<string>;
  generatePassword(): string;
}
```

### 3. IPFS Service

```typescript
interface IPFSService {
  // File operations
  uploadFile(file: Buffer, filename: string): Promise<string>;
  uploadJSON(data: object): Promise<string>;
  getFile(cid: string): Promise<Buffer>;
  getJSON(cid: string): Promise<object>;
  
  // Metadata operations
  uploadProductMetadata(metadata: ProductMetadata): Promise<string>;
  uploadEvidenceFile(file: Buffer, type: string): Promise<string>;
  
  // Utility functions
  validateCID(cid: string): boolean;
  getFileSize(cid: string): Promise<number>;
}
```

## API Endpoints

### Authentication Routes

```typescript
POST   /api/auth/register          // Register new user
POST   /api/auth/login             // Login with wallet signature
POST   /api/auth/refresh           // Refresh JWT token
POST   /api/auth/logout            // Logout user
GET    /api/auth/profile           // Get user profile
PUT    /api/auth/profile           // Update user profile
POST   /api/auth/kyc               // Submit KYC documents
```

### Product Routes

```typescript
GET    /api/products               // List products (paginated)
GET    /api/products/:id           // Get product details
POST   /api/products               // Create new product (seller only)
PUT    /api/products/:id           // Update product (seller only)
DELETE /api/products/:id           // Delete product (seller only)
POST   /api/products/upload        // Upload product images to IPFS
```

### Order Routes

```typescript
GET    /api/orders                 // List user orders
GET    /api/orders/:id             // Get order details
POST   /api/orders                 // Create new order
POST   /api/orders/:id/pay/dot     // Fund order with DOT
POST   /api/orders/:id/pay/mpesa   // Initiate M-Pesa payment
POST   /api/orders/:id/ship        // Mark order shipped (seller)
POST   /api/orders/:id/confirm     // Confirm delivery (buyer)
POST   /api/orders/:id/dispute     // Raise dispute
POST   /api/orders/:id/evidence    // Upload dispute evidence
GET    /api/orders/:id/tracking    // Get tracking information
```

### M-Pesa Routes

```typescript
POST   /api/mpesa/webhook          // M-Pesa callback webhook
POST   /api/mpesa/stk-status       // Query STK push status
GET    /api/mpesa/transactions     // List M-Pesa transactions
```

### Admin Routes

```typescript
GET    /api/admin/orders           // List all orders
GET    /api/admin/disputes         // List pending disputes
POST   /api/admin/disputes/:id/resolve  // Resolve dispute
GET    /api/admin/users            // List users
PUT    /api/admin/users/:id/kyc    // Approve/reject KYC
GET    /api/admin/analytics        // Platform analytics
```

## Security Implementation

### 1. Authentication & Authorization

```typescript
// JWT middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 2. Input Validation

```typescript
// Order creation validation
const createOrderSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  paymentMode: Joi.string().valid('dot', 'mpesa').required(),
  deliveryAddress: Joi.string().min(10).max(500).required(),
  phoneNumber: Joi.when('paymentMode', {
    is: 'mpesa',
    then: Joi.string().pattern(/^254[0-9]{9}$/).required(),
    otherwise: Joi.optional()
  })
});
```

### 3. Rate Limiting

```typescript
// API rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Admin endpoint rate limiting
const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit admin actions
  message: 'Too many admin requests'
});
```

## Event Handling

### Smart Contract Event Listeners

```typescript
class EventListener {
  private api: ApiPromise;
  private contract: ContractPromise;
  
  async subscribeToEvents() {
    // Listen for OrderFunded events
    this.contract.events.OrderFunded((event) => {
      this.handleOrderFunded(event);
    });
    
    // Listen for OrderShipped events
    this.contract.events.OrderShipped((event) => {
      this.handleOrderShipped(event);
    });
    
    // Listen for OrderDelivered events
    this.contract.events.OrderDelivered((event) => {
      this.handleOrderDelivered(event);
    });
  }
  
  private async handleOrderFunded(event: OrderFundedEvent) {
    const { orderId, buyer, amount } = event.data;
    
    // Update database
    await prisma.order.update({
      where: { contract_order_id: orderId },
      data: { status: 'funded' }
    });
    
    // Send notification
    await this.notificationService.sendOrderUpdate(orderId, 'funded');
  }
}
```

## Error Handling

### Global Error Handler

```typescript
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }
  
  if (err instanceof ContractError) {
    return res.status(500).json({
      error: 'Smart contract error',
      message: err.message
    });
  }
  
  if (err instanceof MpesaError) {
    return res.status(502).json({
      error: 'Payment service error',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
```

## Testing Strategy

### Unit Tests

```typescript
describe('OrderService', () => {
  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        productId: 1,
        buyerId: 1,
        paymentMode: 'dot',
        deliveryAddress: 'Test Address'
      };
      
      const order = await orderService.createOrder(orderData);
      expect(order.status).toBe('created');
    });
  });
});
```

### Integration Tests

```typescript
describe('Orders API', () => {
  it('should create order and initiate M-Pesa payment', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: 1,
        paymentMode: 'mpesa',
        phoneNumber: '254712345678',
        deliveryAddress: 'Test Address'
      });
      
    expect(response.status).toBe(201);
    expect(response.body.order.status).toBe('created');
  });
});
```

## Deployment Configuration

### Docker Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.descrow.io

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/descrow
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Polkadot
POLKADOT_WS_URL=wss://rpc.polkadot.io
CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
ORACLE_SEED=//YourOracleAccountSeed

# M-Pesa
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://api.descrow.io/api/mpesa/webhook

# IPFS
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

## Performance Optimization

### Database Optimization

```sql
-- Indexes for performance
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
```

### Caching Strategy

```typescript
// Redis caching for frequently accessed data
const cacheService = {
  async getProduct(id: number): Promise<Product | null> {
    const cached = await redis.get(`product:${id}`);
    if (cached) return JSON.parse(cached);
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) {
      await redis.setex(`product:${id}`, 300, JSON.stringify(product));
    }
    return product;
  }
};
```

## Monitoring & Logging

### Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Health Checks

```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      polkadot: await checkPolkadotConnection(),
      ipfs: await checkIPFSConnection(),
      mpesa: await checkMpesaConnection()
    }
  };
  
  const isHealthy = Object.values(health.services).every(service => service === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

This backend architecture provides a robust foundation for the Descrow MVP, handling both on-chain and off-chain operations while maintaining security, scalability, and reliability.