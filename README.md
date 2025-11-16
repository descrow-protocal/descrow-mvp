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

### Option 1: Automated Start (Recommended)

```bash
# Install dependencies (first time only)
npm install

# Start everything (PostgreSQL + Backend + Frontend)
npm start
```

### Option 2: Manual Start

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run backend and frontend
npm run dev
```

### Option 3: Full Docker

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
