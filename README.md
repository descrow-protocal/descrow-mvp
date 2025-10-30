# Descrow MVP - Decentralized Escrow Platform

A hybrid escrow platform built on Polkadot that supports both native DOT payments (fully trustless) and M-Pesa integration (hybrid model) for e-commerce transactions in emerging markets.

## Overview

Descrow MVP bridges traditional payment methods with blockchain technology, enabling secure peer-to-peer transactions with built-in dispute resolution. The platform combines the trustless nature of blockchain for DOT transactions with the accessibility of mobile money (M-Pesa) for broader adoption.

### Key Features

- **Dual Payment Support**: Native DOT (on-chain) and M-Pesa (hybrid) payment flows
- **Smart Contract Escrow**: Automated fund holding and release based on delivery confirmation
- **Dispute Resolution**: Built-in arbitration system with evidence submission
- **IPFS Integration**: Decentralized storage for product metadata and dispute evidence
- **Real-time Updates**: WebSocket notifications for order status changes
- **Mobile-First Design**: Optimized for mobile users in emerging markets

## Architecture

### Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Smart Contract │
│   (React)       │◄──►│   (Node.js)     │◄──►│     (ink!)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Polkadot Wallet │    │   M-Pesa API    │    │  Polkadot Node  │
│   Extension     │    │   (Daraja)      │    │   (Testnet)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Smart Contract**: ink! (Rust-based) on Polkadot
- **Backend**: Node.js/TypeScript with Express
- **Frontend**: React with Polkadot.js extension integration
- **Database**: PostgreSQL for off-chain data
- **Storage**: IPFS for metadata and evidence
- **Payments**: M-Pesa Daraja API integration
- **Real-time**: WebSocket for live updates

## Payment Flows

### DOT Flow (Fully Trustless)

1. **Order Creation**: Buyer creates order with product metadata stored on IPFS
2. **Funding**: Buyer sends DOT to smart contract in single transaction
3. **Shipping**: Seller marks order as shipped with tracking information
4. **Delivery**: Buyer confirms delivery, triggering automatic fund release
5. **Disputes**: Either party can raise disputes for admin resolution

### M-Pesa Flow (Hybrid Model)

1. **Payment Initiation**: Buyer selects M-Pesa, receives STK push notification
2. **Payment Confirmation**: Backend verifies M-Pesa transaction via webhook
3. **On-chain Recording**: Backend records payment on smart contract as oracle
4. **Order Fulfillment**: Same shipping and delivery flow as DOT
5. **Payout**: Backend triggers M-Pesa B2C payout to seller upon delivery

## Smart Contract Functions

### Core Functions

- `create_order(metadata_cid, amount)` - Creates new escrow order
- `fund_order_dot(order_id)` - Funds order with DOT (trustless)
- `record_offchain_payment(order_id, tx_hash)` - Records M-Pesa payment (oracle)
- `mark_shipped(order_id, tracking_cid)` - Seller marks order shipped
- `confirm_delivery(order_id)` - Buyer confirms delivery
- `raise_dispute(order_id, evidence_cid)` - Initiates dispute process
- `resolve_dispute(order_id, resolution)` - Admin resolves disputes

### Order States

```
Created → Funded → Shipped → Delivered → Completed
    ↓       ↓        ↓         ↓
    └───────┴────────┴─────────┴──→ Disputed → Resolved
```

## API Endpoints

### Product Management
- `POST /api/products` - Upload product metadata to IPFS
- `GET /api/products` - Browse available products
- `GET /api/products/:id` - Get product details

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/pay/mpesa` - Initiate M-Pesa payment
- `POST /api/orders/:id/ship` - Mark order as shipped
- `POST /api/orders/:id/confirm` - Confirm delivery
- `POST /api/orders/:id/dispute` - Create dispute

### Admin Functions
- `POST /api/admin/orders/:id/resolve` - Resolve dispute
- `GET /api/admin/disputes` - List pending disputes

### Webhooks
- `POST /api/mpesa/webhook` - M-Pesa payment confirmation

## Database Schema

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(255) UNIQUE,
  role VARCHAR(20) CHECK (role IN ('buyer', 'seller', 'admin')),
  kyc_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id),
  cid VARCHAR(255) NOT NULL,
  price_dot DECIMAL(18,8),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  buyer_id INTEGER REFERENCES users(id),
  seller_id INTEGER REFERENCES users(id),
  amount_dot DECIMAL(18,8),
  payment_mode VARCHAR(20) CHECK (payment_mode IN ('dot', 'mpesa')),
  status VARCHAR(20),
  contract_order_ref INTEGER,
  mpesa_tx_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### Smart Contract Security
- Oracle account restrictions for off-chain payment recording
- Replay protection using nonces
- Event-based state transitions
- Admin role separation for dispute resolution

### Backend Security
- M-Pesa webhook signature validation
- JWT-based authentication
- Rate limiting on admin endpoints
- HTTPS enforcement
- Input validation and sanitization

### Data Integrity
- IPFS content addressing for immutable metadata
- On-chain event logging for auditability
- Cryptographic proof storage for evidence

## Development Setup

### Prerequisites
- Node.js 18+
- Rust and Cargo
- ink! CLI
- PostgreSQL
- IPFS node (optional, can use public gateway)

### Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd descrow-mvp
   ```

2. **Setup Smart Contract**
   ```bash
   cd web3
   cargo contract build
   cargo contract test
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/descrow

# Polkadot
POLKADOT_WS_URL=wss://testnet.polkadot.io
CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
ORACLE_SEED=//Alice

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_API_URL=http://localhost:5001

# JWT
JWT_SECRET=your_jwt_secret
```

## Testing

### Smart Contract Tests
```bash
cd web3
cargo contract test
```

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
npm run test:e2e
```

## Deployment

### Smart Contract Deployment
```bash
cd web3
cargo contract build --release
# Deploy to testnet using Polkadot.js Apps
```

### Backend Deployment
```bash
docker build -t descrow-backend .
docker run -p 3000:3000 descrow-backend
```

## Monitoring & Metrics

- Order creation and funding rates (DOT vs M-Pesa)
- Transaction confirmation times
- M-Pesa STK push success rates
- Dispute resolution metrics
- Evidence attachment statistics

## Roadmap

### Phase 1 (MVP - Current)
- [ ] Escrow functionality
- [ ] DOT payment integration
- [ ] M-Pesa hybrid model
- [ ] dispute resolution

### Phase 2 (Post-Hackathon)
- [ ] Stablecoin integration (USDT/USDC)
- [ ] Advanced KYC/AML compliance
- [ ] Multi-signature admin controls
- [ ] Mobile app development

### Phase 3 (Production)
- [ ] Parachain deployment
- [ ] Cross-chain compatibility
- [ ] Automated dispute resolution (AI)
- [ ] Merchant dashboard

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

