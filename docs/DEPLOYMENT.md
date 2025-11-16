# Deployment Guide

## Development Setup

### Quick Start (Recommended)

```bash
# 1. Install root dependencies
npm install

# 2. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Update backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/descrow_db
JWT_SECRET=your-secret-key
RPC_WS_URL=wss://wss.api.moonbase.moonbeam.network
CONTRACT_ADDRESS=0x...

# 4. Setup database
psql -U postgres -c "CREATE DATABASE descrow_db;"
psql -U postgres -d descrow_db -f backend/schema.sql
psql -U postgres -d descrow_db -f backend/migrations/add_email_name.sql

# 5. Run both services
npm run dev
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## Docker Deployment

```bash
# Clean previous builds
docker-compose down -v
docker system prune -a -f

# Build and run
docker-compose up --build
```

## Smart Contract Deployment

```bash
cd web3
npm install
cp .env.example .env
# Add your PRIVATE_KEY to .env
npm run compile
npm run deploy
```

Save the deployed contract address and update:
- `backend/.env` → `CONTRACT_ADDRESS`
- `frontend/.env` → `VITE_CONTRACT_ADDRESS`

## Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=development

# Moonbeam
RPC_WS_URL=wss://wss.api.moonbase.moonbeam.network
CONTRACT_ADDRESS=0x...

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/descrow_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0x...
VITE_MOONBEAM_RPC_URL=https://rpc.api.moonbase.moonbeam.network
VITE_CHAIN_ID=1287
```

## Network Details

- **Network**: Moonbeam Alpha (Testnet)
- **Chain ID**: 1287
- **RPC**: https://rpc.api.moonbase.moonbeam.network
- **WebSocket**: wss://wss.api.moonbase.moonbeam.network
- **Faucet**: https://faucet.moonbeam.network/
- **Explorer**: https://moonbase.moonscan.io

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Create database
psql -U postgres -c "CREATE DATABASE descrow_db;"

# Run migrations
psql -U postgres -d descrow_db -f backend/schema.sql
psql -U postgres -d descrow_db -f backend/migrations/add_email_name.sql
```

### WebSocket Connection Error

The backend will run in API-only mode if blockchain connection fails. This is normal for development.

## Production Deployment

1. Use Docker for consistent environment
2. Set `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Configure proper database credentials
5. Deploy smart contract to Moonbeam mainnet
6. Update RPC URLs to mainnet endpoints
