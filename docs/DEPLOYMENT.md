# Moonbeam Alpha Deployment Guide

## 1. Deploy Smart Contract

```bash
cd web3
npm install
cp .env.example .env
# Edit .env with your PRIVATE_KEY
npm run compile
npm run deploy
```

Save the deployed contract address.

## 2. Setup Backend

### Option A: Docker (Recommended)

```bash
cp .env.docker .env
# Edit .env with CONTRACT_ADDRESS from step 1
docker-compose up -d
```

### Option B: Local

```bash
cd backend
npm install
cp .env.example .env
# Edit .env
psql -U postgres -d descrow < schema.sql
npm run dev
```

## 3. Setup Frontend

```bash
cd frontend
npm install
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=<deployed_contract_address>
VITE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
VITE_CHAIN_ID=1287
```

Start:
```bash
npm run dev
```

## Network Details

- **Network**: Moonbeam Alpha
- **Chain ID**: 1287
- **RPC**: https://rpc.api.moonbase.moonbeam.network
- **Faucet**: https://faucet.moonbeam.network/
- **Explorer**: https://moonbase.moonscan.io
