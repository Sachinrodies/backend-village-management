import { Router } from 'express';
import { db } from '../index.js';

export const personsRouter = Router();

// List persons (basic pagination)
personsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      'SELECT PersonID, FirstName, MiddleName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation FROM Person ORDER BY PersonID DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get person by id
personsRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Person WHERE PersonID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create person (minimal fields)
personsRouter.post('/', async (req, res) => {
  const { FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber, MiddleName } = req.body || {};
  if (!FirstName || !LastName) return res.status(400).json({ error: 'FirstName and LastName are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO Person (FirstName, MiddleName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [FirstName, MiddleName || null, LastName, PhoneNumber || null, Gender || null, DateOfBirth || null, Address || null, CensusVillageCode || null, Occupation || null, AadhaarNumber || null]
    );
    const [rows] = await db.query('SELECT * FROM Person WHERE PersonID = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update person
personsRouter.put('/:id', async (req, res) => {
  const { FirstName, MiddleName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber } = req.body || {};
  try {
    await db.query(
      'UPDATE Person SET FirstName=?, MiddleName=?, LastName=?, PhoneNumber=?, Gender=?, DateOfBirth=?, Address=?, CensusVillageCode=?, Occupation=?, AadhaarNumber=? WHERE PersonID=?',
      [FirstName || null, MiddleName || null, LastName || null, PhoneNumber || null, Gender || null, DateOfBirth || null, Address || null, CensusVillageCode || null, Occupation || null, AadhaarNumber || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM Person WHERE PersonID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete person
personsRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Person WHERE PersonID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


