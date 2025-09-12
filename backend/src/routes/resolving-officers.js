import { Router } from 'express';
import { db } from '../index.js';

export const resolvingOfficersRouter = Router();

// List resolving officers
resolvingOfficersRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      `SELECT ro.ResolvingOfficerID, ro.DepartmentID, ro.Designation,
              d.DepartmentName
       FROM ResolvingOfficer ro
       LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
       ORDER BY ro.ResolvingOfficerID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get resolving officer by id
resolvingOfficersRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ro.*, d.DepartmentName
       FROM ResolvingOfficer ro
       LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
       WHERE ro.ResolvingOfficerID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Resolving Officer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create resolving officer
resolvingOfficersRouter.post('/', async (req, res) => {
  const { DepartmentID, Designation } = req.body || {};
  if (!DepartmentID) return res.status(400).json({ error: 'DepartmentID is required' });
  try {
    const [result] = await db.query(
      'INSERT INTO ResolvingOfficer (DepartmentID, Designation) VALUES (?, ?)',
      [DepartmentID, Designation || null]
    );
    const [rows] = await db.query(
      `SELECT ro.*, d.DepartmentName
       FROM ResolvingOfficer ro
       LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
       WHERE ro.ResolvingOfficerID = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update resolving officer
resolvingOfficersRouter.put('/:id', async (req, res) => {
  const { DepartmentID, Designation } = req.body || {};
  try {
    await db.query(
      'UPDATE ResolvingOfficer SET DepartmentID=?, Designation=? WHERE ResolvingOfficerID=?',
      [DepartmentID || null, Designation || null, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT ro.*, d.DepartmentName
       FROM ResolvingOfficer ro
       LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
       WHERE ro.ResolvingOfficerID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Resolving Officer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete resolving officer
resolvingOfficersRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ResolvingOfficer WHERE ResolvingOfficerID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get resolving officers by department
resolvingOfficersRouter.get('/department/:departmentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ro.*, p.FirstName, p.LastName, p.PhoneNumber, p.Email, d.DepartmentName
       FROM ResolvingOfficer ro
       LEFT JOIN Person p ON ro.PersonID = p.PersonID
       LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
       WHERE ro.DepartmentID = ?`,
      [req.params.departmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
