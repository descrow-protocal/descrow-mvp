import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { blockchainService } from './services/blockchain.service.js';
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import sellerRoutes from './routes/seller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/seller', sellerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
  try {
    await blockchainService.initialize();
    await blockchainService.subscribeToEvents();
    console.log('Blockchain service connected');
  } catch (error) {
    console.warn('Blockchain service unavailable, running in API-only mode');
  }
    
    app.listen(PORT, () => {
      console.log(`🚀 Oracle backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await blockchainService.disconnect();
  process.exit(0);
});

start();
