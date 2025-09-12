import { Router } from 'express';
import { db } from '../index.js';

export const complaintAssignmentsRouter = Router();

// List complaint assignments
complaintAssignmentsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
              ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       ORDER BY ca.AssignmentID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaint assignment by id
complaintAssignmentsRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
              ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE ca.AssignmentID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint Assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create complaint assignment
complaintAssignmentsRouter.post('/', async (req, res) => {
  const { ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp } = req.body || {};
  if (!ComplaintID || !AssigningOfficerID || !ResolvingOfficerID) return res.status(400).json({ error: 'ComplaintID, AssigningOfficerID, and ResolvingOfficerID are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp) VALUES (?, ?, ?, ?)',
      [ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp || new Date()]
    );
    
    // Update complaint status to ASSIGNED
    await db.query(
      'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
      ['ASSIGNED', ComplaintID]
    );
    
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              p1.FirstName as AssigningFirstName, p1.LastName as AssigningLastName,
              p2.FirstName as ResolvingFirstName, p2.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Person p1 ON ao.PersonID = p1.PersonID
       LEFT JOIN Person p2 ON ro.PersonID = p2.PersonID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE ca.AssignmentID = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint assignment
complaintAssignmentsRouter.put('/:id', async (req, res) => {
  const { ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp } = req.body || {};
  try {
    await db.query(
      'UPDATE ComplaintAssignment SET ComplaintID=?, AssigningOfficerID=?, ResolvingOfficerID=?, AssignmentTimestamp=? WHERE AssignmentID=?',
      [ComplaintID || null, AssigningOfficerID || null, ResolvingOfficerID || null, AssignmentTimestamp || null, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
              ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE ca.AssignmentID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint Assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete complaint assignment
complaintAssignmentsRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ComplaintAssignment WHERE AssignmentID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments by complaint
complaintAssignmentsRouter.get('/complaint/:complaintId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
              ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE ca.ComplaintID = ?`,
      [req.params.complaintId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments by resolving officer
complaintAssignmentsRouter.get('/officer/:officerId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*, 
              c.Description as ComplaintDescription, c.Status as ComplaintStatus,
              ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
              ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName,
              d.DepartmentName
       FROM ComplaintAssignment ca
       LEFT JOIN Complaint c ON ca.ComplaintID = c.ComplaintID
       LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
       LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
       LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE ca.ResolvingOfficerID = ?`,
      [req.params.officerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
