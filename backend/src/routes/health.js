import { db } from '../index.js';

export function registerHealthRoute(app) {
  app.get('/api/health', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT 1 AS ok');
      res.json({ status: 'ok', db: rows[0]?.ok === 1 });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });
}


