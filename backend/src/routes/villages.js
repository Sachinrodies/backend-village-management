import { Router } from 'express';
import { db } from '../index.js';

export const villagesRouter = Router();

// Get all villages
villagesRouter.get('/', async (req, res) => {
  try {
    const [villages] = await db.query('SELECT * FROM Village ORDER BY VillageName');
    res.json(villages);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Failed to fetch villages' });
  }
});

// Create village
villagesRouter.post('/', async (req, res) => {
  const { CensusVillageCode, VillageName } = req.body;
  
  if (!CensusVillageCode || !VillageName) {
    return res.status(400).json({ error: 'Village code and name required' });
  }
  
  try {
    const [result] = await db.query(`
      INSERT INTO Village (CensusVillageCode, VillageName)
      VALUES (?, ?)
    `, [CensusVillageCode, VillageName]);
    
    res.json({ 
      success: true, 
      message: 'Village created successfully',
      villageId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating village:', error);
    res.status(500).json({ error: 'Failed to create village' });
  }
});