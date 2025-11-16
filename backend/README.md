# Descrow Backend Oracle

Minimal backend service that acts as an oracle between the blockchain and frontend.

## Features

- 🔗 Blockchain event listener (EVM - Moonbeam/Ethereum)
- 🔐 JWT authentication
- 📦 Order management API
- 📊 Seller dashboard endpoints
- 🗄️ PostgreSQL database

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Setup database:
```bash
psql -U postgres -d descrow < schema.sql
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with wallet signature
- `GET /api/auth/me` - Get current user

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `POST /api/orders/:id/confirm` - Confirm goods received
- `PATCH /api/orders/:id/status` - Update order status

### Seller
- `GET /api/seller/stats` - Get seller statistics
- `GET /api/seller/orders` - Get seller orders

## Architecture

```
backend/
├── src/
│   ├── config/          # Database config
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── services/        # Blockchain service
│   ├── types/           # TypeScript types
│   └── index.ts         # Main entry
├── schema.sql           # Database schema
└── package.json
```

## Oracle Functions

The backend listens to Solidity contract events and updates the database:

- `Funded(address buyer, uint256 amount)` → Updates order status to 'funded'
- `Shipped(string trackingNumber)` → Updates order status to 'shipped' with tracking
- `Delivered()` → Updates order status to 'delivered'
- `GoodsConfirmed(address buyer)` → Updates order status to 'completed'

## Environment Variables

See `.env.example` for required configuration.
