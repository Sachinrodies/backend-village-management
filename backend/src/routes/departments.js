import { Router } from 'express';
import { db } from '../index.js';

export const departmentsRouter = Router();

// List departments
departmentsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      'SELECT DepartmentID, DepartmentName, ContactNumber, Email, JurisdictionLevel, OfficeAddress, LastUpdated, DepartmentHeadID FROM Department ORDER BY DepartmentID DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get department by id
departmentsRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Department WHERE DepartmentID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create department
departmentsRouter.post('/', async (req, res) => {
  const { DepartmentName, ContactNumber, Email, JurisdictionLevel, OfficeAddress, LastUpdated, DepartmentHeadID } = req.body || {};
  if (!DepartmentName) return res.status(400).json({ error: 'DepartmentName is required' });
  try {
    const [result] = await db.query(
      'INSERT INTO Department (DepartmentName, ContactNumber, Email, JurisdictionLevel, OfficeAddress, LastUpdated, DepartmentHeadID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [DepartmentName, ContactNumber || null, Email || null, JurisdictionLevel || null, OfficeAddress || null, LastUpdated || new Date(), DepartmentHeadID || null]
    );
    const [rows] = await db.query('SELECT * FROM Department WHERE DepartmentID = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update department
departmentsRouter.put('/:id', async (req, res) => {
  const { DepartmentName, ContactNumber, Email, JurisdictionLevel, OfficeAddress, LastUpdated, DepartmentHeadID } = req.body || {};
  try {
    await db.query(
      'UPDATE Department SET DepartmentName=?, ContactNumber=?, Email=?, JurisdictionLevel=?, OfficeAddress=?, LastUpdated=?, DepartmentHeadID=? WHERE DepartmentID=?',
      [DepartmentName || null, ContactNumber || null, Email || null, JurisdictionLevel || null, OfficeAddress || null, LastUpdated || null, DepartmentHeadID || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM Department WHERE DepartmentID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete department
departmentsRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Department WHERE DepartmentID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get departments by district and block
departmentsRouter.get('/district/:district/block/:block', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Department WHERE District = ? AND Block = ?',
      [req.params.district, req.params.block]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
