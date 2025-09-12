import { Router } from 'express';
import { db } from '../index.js';

export const complaintLogsRouter = Router();

// List complaint logs
complaintLogsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      `SELECT cl.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM ComplaintLog cl
       LEFT JOIN Complaint c ON cl.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON cl.OfficerID = p.PersonID
       ORDER BY cl.LogID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaint log by id
complaintLogsRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cl.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM ComplaintLog cl
       LEFT JOIN Complaint c ON cl.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON cl.OfficerID = p.PersonID
       WHERE cl.LogID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint Log not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create complaint log
complaintLogsRouter.post('/', async (req, res) => {
  const { ComplaintID, Status, OfficerID, Timestamp, ActionDescription } = req.body || {};
  if (!ComplaintID || !Status || !OfficerID) return res.status(400).json({ error: 'ComplaintID, Status, and OfficerID are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, ?, ?)',
      [ComplaintID, Status, OfficerID, Timestamp || new Date(), ActionDescription || null]
    );
    
    // Update complaint status
    await db.query(
      'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
      [Status, ComplaintID]
    );
    
    const [rows] = await db.query(
      `SELECT cl.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM ComplaintLog cl
       LEFT JOIN Complaint c ON cl.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON cl.OfficerID = p.PersonID
       WHERE cl.LogID = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint log
complaintLogsRouter.put('/:id', async (req, res) => {
  const { ComplaintID, Status, OfficerID, Timestamp, ActionDescription } = req.body || {};
  try {
    await db.query(
      'UPDATE ComplaintLog SET ComplaintID=?, Status=?, OfficerID=?, Timestamp=?, ActionDescription=? WHERE LogID=?',
      [ComplaintID || null, Status || null, OfficerID || null, Timestamp || null, ActionDescription || null, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT cl.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM ComplaintLog cl
       LEFT JOIN Complaint c ON cl.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON cl.OfficerID = p.PersonID
       WHERE cl.LogID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint Log not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete complaint log
complaintLogsRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ComplaintLog WHERE LogID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs by complaint
complaintLogsRouter.get('/complaint/:complaintId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cl.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM ComplaintLog cl
       LEFT JOIN Complaint c ON cl.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON cl.OfficerID = p.PersonID
       WHERE cl.ComplaintID = ?
       ORDER BY cl.Timestamp DESC`,
      [req.params.complaintId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
