import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const result = await query(
      'SELECT * FROM users WHERE account_id = $1',
      [accountId]
    );
    
    let user = result.rows[0];
    
    if (!user) {
      const newUser = await query(
        'INSERT INTO users (account_id, role) VALUES ($1, $2) RETURNING *',
        [accountId, 'buyer']
      );
      user = newUser.rows[0];
    }
    
    const token = jwt.sign(
      { id: user.id, accountId: user.account_id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    
    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
