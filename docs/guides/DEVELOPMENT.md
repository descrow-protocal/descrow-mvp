# Development Guide

## Project Structure
- `/frontend` - React TypeScript application
- `/backend` - Node.js Express API
- `/web3` - ink! Smart contracts
- `/docs` - Documentation

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Smart Contract Development
```bash
cd web3
cargo contract build
cargo contract test
```

## Testing
- Backend: `npm test`
- Frontend: `npm test`
- Contracts: `cargo test`
