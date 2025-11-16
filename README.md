# Descrow MVP - Decentralized Escrow Platform

> **Polkadot Hackathon Submission**: User-centric Apps Theme

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://descrow-mvp-frontend.vercel.app)
[![Contract](https://img.shields.io/badge/contract-moonbeam-purple)](https://moonbase.moonscan.io/address/0xd3549d47D09b485d3921E5169596deB47158b490)

## 🎯 Project Overview

Descrow is a decentralized escrow platform built on Polkadot's Moonbeam parachain that enables secure peer-to-peer transactions between buyers and sellers. By leveraging blockchain technology and smart contracts, Descrow eliminates the need for centralized intermediaries while ensuring trust and transparency in online commerce.

**Problem**: Traditional online marketplaces require users to trust centralized platforms with their funds and data, leading to high fees, censorship risks, and lack of transparency.

**Solution**: Descrow provides a trustless escrow system where:
- Funds are locked in smart contracts, not controlled by intermediaries
- Users maintain custody of their wallets and identity
- Transparent on-chain transactions ensure accountability
- Lower fees through decentralization

### Key Objectives

1. **User Sovereignty**: Enable users to control their funds and data through wallet-based authentication
2. **Trust Minimization**: Use smart contracts to automate escrow logic without intermediaries
3. **Real-world Impact**: Provide a practical solution for secure P2P commerce
4. **Polkadot Integration**: Leverage Moonbeam's EVM compatibility within the Polkadot ecosystem

## 🏗️ Architecture & Technologies

### Polkadot Technology Stack

- **Moonbeam Parachain**: EVM-compatible smart contract deployment on Polkadot
- **Wallet Integration**: MetaMask and Polkadot.js extension support
- **Smart Contracts**: Solidity-based escrow contracts with automated fund management
- **RPC Connection**: Direct interaction with Moonbeam testnet nodes

### Tech Stack

**Blockchain Layer**:
- Solidity smart contracts
- Hardhat development environment
- Ethers.js for blockchain interaction
- Moonbeam testnet (Polkadot parachain)

**Backend**:
- Node.js + TypeScript
- Express.js REST API
- PostgreSQL database
- JWT authentication

**Frontend**:
- React + TypeScript
- Vite build tool
- TailwindCSS + shadcn/ui
- Web3 wallet integration

### Project Structure

```
descrow-mvp/
├── web3/          # Smart contracts & deployment scripts
│   ├── contracts/ # Solidity escrow contract
│   └── scripts/   # Deployment automation
├── backend/       # Oracle backend API
│   ├── src/       # TypeScript source code
│   └── migrations/# Database migrations
├── frontend/      # React frontend application
│   ├── src/       # React components & pages
│   └── public/    # Static assets
└── docs/          # Technical documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or use Docker)
- MetaMask or Polkadot.js wallet extension
- Git

### Installation & Setup

#### Option 1: Automated Start (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/descrow-mvp.git
cd descrow-mvp

# Install all dependencies
npm install

# Start PostgreSQL + Backend + Frontend
npm start
```

#### Option 2: Manual Start

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Install dependencies
npm install

# 3. Run backend and frontend concurrently
npm run dev
```

#### Option 3: Full Docker Deployment

```bash
# Build and start all services
docker-compose up --build
```

### Environment Configuration

1. **Backend Configuration**:
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

2. **Frontend Configuration**:
```bash
cd frontend
cp .env.example .env
# Update with deployed contract address if needed
```

3. **Smart Contract Deployment** (Optional - already deployed):
```bash
cd web3
cp .env.example .env
# Add your private key for deployment
npx hardhat run scripts/deploy.js --network moonbase
```

### Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432
- **Live Demo**: https://descrow-mvp-frontend.vercel.app

## 💡 Features & Functionality

### Core Features

- 🔐 **Wallet Authentication**: Connect with MetaMask or Polkadot.js extension
- 🛒 **Product Marketplace**: Browse and list products for sale
- 💰 **Smart Contract Escrow**: Automated fund locking and release
- 📦 **Order Management**: Track orders through their lifecycle
- 👥 **Dual Dashboards**: Separate interfaces for buyers and sellers
- 🔍 **Transaction Transparency**: View all transactions on Moonbeam explorer
- 💸 **Automated Payments**: Smart contract handles fund distribution

### User Flows

**Seller Flow**:
1. Connect wallet
2. Create product listing with price
3. Receive order notifications
4. Mark order as shipped
5. Receive payment when buyer confirms delivery

**Buyer Flow**:
1. Connect wallet
2. Browse marketplace
3. Purchase product (funds locked in escrow)
4. Track order status
5. Confirm delivery (releases funds to seller)

### Smart Contract Functions

- `createOrder()`: Initialize escrow with locked funds
- `confirmDelivery()`: Buyer releases funds to seller
- `cancelOrder()`: Refund buyer if order cancelled
- `getOrderDetails()`: Query order status on-chain

## 🔧 Dependencies

### Smart Contracts (web3/)
```json
{
  "hardhat": "^2.19.0",
  "@nomicfoundation/hardhat-toolbox": "^4.0.0",
  "ethers": "^6.9.0"
}
```

### Backend (backend/)
```json
{
  "express": "^4.18.2",
  "typescript": "^5.3.3",
  "pg": "^8.11.3",
  "jsonwebtoken": "^9.0.2",
  "ethers": "^6.9.0"
}
```

### Frontend (frontend/)
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "ethers": "^6.9.0",
  "@tanstack/react-query": "^5.17.9",
  "tailwindcss": "^3.4.0"
}
```

## 📖 Usage Guide

### For Sellers

1. **Connect Wallet**: Click "Connect Wallet" and approve connection
2. **Add Product**: Navigate to "Sell" → "Add Product"
3. **Fill Details**: Enter product name, description, price, and image
4. **Manage Orders**: View incoming orders in seller dashboard
5. **Ship Products**: Mark orders as shipped after sending
6. **Receive Payment**: Funds automatically released upon buyer confirmation

### For Buyers

1. **Connect Wallet**: Authenticate with your Web3 wallet
2. **Browse Products**: Explore marketplace listings
3. **Make Purchase**: Click "Buy Now" and approve transaction
4. **Track Order**: Monitor status in buyer dashboard
5. **Confirm Delivery**: Release funds when product received

### Testing on Moonbeam Testnet

1. Get testnet DEV tokens from [Moonbeam Faucet](https://faucet.moonbeam.network/)
2. Add Moonbeam testnet to MetaMask:
   - Network Name: Moonbase Alpha
   - RPC URL: https://rpc.api.moonbase.moonbeam.network
   - Chain ID: 1287
   - Currency: DEV

## 🌐 Deployed Contract

- **Network**: Moonbeam Testnet (Moonbase Alpha)
- **Contract Address**: `0xd3549d47D09b485d3921E5169596deB47158b490`
- **Explorer**: [View on Moonscan](https://moonbase.moonscan.io/address/0xd3549d47D09b485d3921E5169596deB47158b490)

## 📚 Additional Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md) - API design and database schema
- [Docker Setup](docs/DOCKER.md) - Container orchestration details
- [Project Breakdown](docs/project_breakdown.md) - Detailed technical breakdown

## 🎥 Demo Video

[Coming Soon] - A walkthrough demonstrating:
- Wallet connection
- Product listing creation
- Purchase flow with escrow
- Order tracking and completion

## 🤝 Contributing

This project was built for the Polkadot Hackathon. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Submission

**Theme**: User-centric Apps

**Why Descrow?**
- Prioritizes user sovereignty and data ownership
- Solves real-world problem of trust in online commerce
- Leverages Polkadot's Moonbeam parachain for EVM compatibility
- Demonstrates practical Web3 application beyond DeFi

**Impact**:
- Enables trustless P2P commerce globally
- Reduces fees compared to centralized platforms
- Provides transparent, auditable transactions
- Empowers users with self-custody

---

**Built with ❤️ for the Polkadot Ecosystem**
