import { Router } from 'express';
import { db } from '../index.js';

export const villagesRouter = Router();

// List villages
villagesRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      'SELECT CensusVillageCode, VillageName FROM Village ORDER BY CensusVillageCode DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get village by id
villagesRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Village WHERE CensusVillageCode = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Village not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create village
villagesRouter.post('/', async (req, res) => {
  const { VillageName, CensusVillageCode } = req.body || {};
  if (!VillageName || !CensusVillageCode) return res.status(400).json({ error: 'VillageName and CensusVillageCode are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO Village (VillageName, CensusVillageCode) VALUES (?, ?)',
      [VillageName, CensusVillageCode]
    );
    const [rows] = await db.query('SELECT * FROM Village WHERE CensusVillageCode = ?', [CensusVillageCode]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update village
villagesRouter.put('/:id', async (req, res) => {
  const { VillageName, CensusVillageCode } = req.body || {};
  try {
    await db.query(
      'UPDATE Village SET VillageName=?, CensusVillageCode=? WHERE CensusVillageCode=?',
      [VillageName || null, CensusVillageCode || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM Village WHERE CensusVillageCode = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Village not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete village
villagesRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Village WHERE CensusVillageCode = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get villages by district and block
villagesRouter.get('/district/:district/block/:block', async (req, res) => {
  res.status(400).json({ error: 'District/Block filters are not supported by the current Village schema' });
});
