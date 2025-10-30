# Getting Started

## Prerequisites
- Node.js 18+
- Rust and Cargo
- PostgreSQL 14+

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Smart Contracts
```bash
cd web3
cargo contract build
cargo contract test
```
