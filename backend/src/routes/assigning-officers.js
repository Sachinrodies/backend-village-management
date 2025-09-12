import { Router } from 'express';
import { db } from '../index.js';

export const assigningOfficersRouter = Router();

// List assigning officers
assigningOfficersRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      `SELECT ao.AssigningOfficerID, ao.DepartmentID, ao.Designation,
              d.DepartmentName
       FROM AssigningOfficer ao
       LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
       ORDER BY ao.AssigningOfficerID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assigning officer by id
assigningOfficersRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ao.*, d.DepartmentName
       FROM AssigningOfficer ao
       LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
       WHERE ao.AssigningOfficerID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Assigning Officer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create assigning officer
assigningOfficersRouter.post('/', async (req, res) => {
  const { DepartmentID, Designation } = req.body || {};
  if (!DepartmentID) return res.status(400).json({ error: 'DepartmentID is required' });
  try {
    const [result] = await db.query(
      'INSERT INTO AssigningOfficer (DepartmentID, Designation) VALUES (?, ?)',
      [DepartmentID, Designation || null]
    );
    const [rows] = await db.query(
      `SELECT ao.*, d.DepartmentName
       FROM AssigningOfficer ao
       LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
       WHERE ao.AssigningOfficerID = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assigning officer
assigningOfficersRouter.put('/:id', async (req, res) => {
  const { DepartmentID, Designation } = req.body || {};
  try {
    await db.query(
      'UPDATE AssigningOfficer SET DepartmentID=?, Designation=? WHERE AssigningOfficerID=?',
      [DepartmentID || null, Designation || null, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT ao.*, d.DepartmentName
       FROM AssigningOfficer ao
       LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
       WHERE ao.AssigningOfficerID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Assigning Officer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assigning officer
assigningOfficersRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM AssigningOfficer WHERE AssigningOfficerID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assigning officers by department
assigningOfficersRouter.get('/department/:departmentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ao.*, p.FirstName, p.LastName, p.PhoneNumber, p.Email, d.DepartmentName
       FROM AssigningOfficer ao
       LEFT JOIN Person p ON ao.PersonID = p.PersonID
       LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
       WHERE ao.DepartmentID = ?`,
      [req.params.departmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
