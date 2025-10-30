# Deployment Guide

## Smart Contract Deployment
```bash
cd web3
cargo contract build --release
# Deploy via Polkadot.js Apps
```

## Backend Deployment
```bash
cd backend
npm run build
npm start
```

## Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ to hosting service
```

## Environment Variables
- Copy `.env.example` to `.env`
- Configure production values
- Never commit `.env` files
