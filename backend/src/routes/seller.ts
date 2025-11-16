import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = Router();

router.get('/stats', authenticate, requireRole(['seller']), async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status IN ('created', 'funded', 'shipped', 'delivered')) as active_orders,
        COALESCE(SUM(amount::numeric) FILTER (WHERE status = 'completed'), 0) as total_sales,
        COALESCE(SUM(amount::numeric) FILTER (WHERE status IN ('funded', 'shipped', 'delivered')), 0) as pending_escrow
      FROM orders WHERE seller_id = $1`,
      [req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', authenticate, requireRole(['seller']), async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
