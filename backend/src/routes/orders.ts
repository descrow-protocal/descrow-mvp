import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE buyer_id = $1 OR seller_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, amount, deliveryAddress, sellerId } = req.body;
    
    const result = await query(
      'INSERT INTO orders (product_id, buyer_id, seller_id, amount, status, delivery_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [productId, req.user.id, sellerId, amount, 'created', deliveryAddress]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/confirm', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND buyer_id = $3 RETURNING *',
      ['completed', req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const result = await query(
      'UPDATE orders SET status = $1, tracking_number = $2, updated_at = NOW() WHERE id = $3 AND seller_id = $4 RETURNING *',
      [status, trackingNumber, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
