# Descrow MVP

Decentralized escrow platform on Moonbeam.

## Project Structure

```
descrow-mvp/
├── web3/          # Smart contracts & deployment
├── backend/       # Oracle backend API
├── frontend/      # React frontend
└── docs/          # Documentation
```

## Quick Start

### Option 1: Run Both Services (Recommended for Development)

```bash
# Install root dependencies
npm install

# Run backend and frontend concurrently
npm run dev
```

### Option 2: Run Separately

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Option 3: Docker

```bash
docker-compose up --build
```

## Prerequisites

- Node.js 18+
- PostgreSQL (if running locally)
- MetaMask or Polkadot.js wallet

## Environment Setup

1. **Backend**: Copy `backend/.env.example` to `backend/.env`
2. **Frontend**: Copy `frontend/.env.example` to `frontend/.env`
3. Update environment variables with your values

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment guide.

## Development

- Backend runs on: `http://localhost:3000`
- Frontend runs on: `http://localhost:8080`
- Database runs on: `localhost:5432`

## Features

- 🔐 Wallet authentication (MetaMask & Polkadot.js)
- 🛒 Product marketplace
- 💰 Escrow smart contracts
- 📦 Order tracking
- 👥 Buyer & Seller dashboards
