# Docker Deployment

## Quick Start

1. **Deploy contract first**:
```bash
cd web3
npm install
cp .env.example .env
# Add your PRIVATE_KEY
npm run deploy
# Save the contract address
```

2. **Configure environment**:
```bash
cd ..
cp .env.docker .env
```

Edit `.env`:
```env
CONTRACT_ADDRESS=0x... # From step 1
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
```

3. **Start services**:
```bash
docker-compose up -d
```

4. **Check logs**:
```bash
docker-compose logs -f backend
```

## Commands

- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`
- **Restart**: `docker-compose restart`
- **Logs**: `docker-compose logs -f`
- **Rebuild**: `docker-compose up -d --build`

## Services

- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Health check**: http://localhost:3000/health

## Troubleshooting

**Backend won't start**:
```bash
docker-compose logs backend
```

**Database issues**:
```bash
docker-compose down -v
docker-compose up -d
```
