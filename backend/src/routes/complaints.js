import { Router } from 'express';
import { db } from '../index.js';

export const complaintsRouter = Router();

// List complaints with full details
complaintsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  const status = req.query.status;
  const department = req.query.department;
  // Note: Village may not have District/Block columns in your DB
  
  try {
    let query = `
      SELECT c.*, 
             p.FirstName, p.LastName, p.PhoneNumber,
             d.DepartmentName,
             v.VillageName,
             ca.AssignmentID, ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
             ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
             ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName
      FROM Complaint c
      LEFT JOIN Person p ON c.PersonID = p.PersonID
      LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
      LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
      LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND UPPER(TRIM(c.Status)) = UPPER(TRIM(?))';
      params.push(status);
    }
    if (department) {
      query += ' AND c.DepartmentID = ?';
      params.push(department);
    }
    // District/Block filters removed because Village lacks these columns
    
    query += ' ORDER BY c.ComplaintID DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaint by id with full details
complaintsRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, 
             p.FirstName, p.LastName, p.PhoneNumber, p.Address,
             d.DepartmentName,
             v.VillageName,
             ca.AssignmentID, ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
             ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
             ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName
      FROM Complaint c
      LEFT JOIN Person p ON c.PersonID = p.PersonID
      LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
      LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
      LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
      WHERE c.ComplaintID = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
    
    // Get complaint logs
    const [logs] = await db.query(`
      SELECT cl.*, p.FirstName, p.LastName
      FROM ComplaintLog cl
      LEFT JOIN Person p ON cl.OfficerID = p.PersonID
      WHERE cl.ComplaintID = ?
      ORDER BY cl.Timestamp DESC
    `, [req.params.id]);
    
    // Get feedback
    const [feedback] = await db.query(`
      SELECT f.*, p.FirstName, p.LastName
      FROM Feedback f
      LEFT JOIN Person p ON f.PersonID = p.PersonID
      WHERE f.ComplaintID = ?
      ORDER BY f.FeedbackTimestamp DESC
    `, [req.params.id]);
    
    res.json({
      ...rows[0],
      logs,
      feedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create complaint
complaintsRouter.post('/', async (req, res) => {
  const { PersonID, DepartmentID, Description, Status, PriorityLevel, LocationDescription, AttachmentPath } = req.body || {};
  if (!PersonID || !Description) return res.status(400).json({ error: 'PersonID and Description are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO Complaint (PersonID, DepartmentID, Description, Timestamp, Status, PriorityLevel, LocationDescription, AttachmentPath) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
      [PersonID, DepartmentID || null, Description, Status || 'NEW', PriorityLevel || null, LocationDescription || null, AttachmentPath || null]
    );
    const [rows] = await db.query('SELECT * FROM Complaint WHERE ComplaintID = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint
complaintsRouter.put('/:id', async (req, res) => {
  const { PersonID, DepartmentID, Description, Status, PriorityLevel, LocationDescription, AttachmentPath, Timestamp } = req.body || {};
  try {
    await db.query(
      'UPDATE Complaint SET PersonID=?, DepartmentID=?, Description=?, Timestamp=?, Status=?, PriorityLevel=?, LocationDescription=?, AttachmentPath=? WHERE ComplaintID=?',
      [PersonID || null, DepartmentID || null, Description || null, Timestamp || null, Status || null, PriorityLevel || null, LocationDescription || null, AttachmentPath || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM Complaint WHERE ComplaintID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete complaint
complaintsRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Complaint WHERE ComplaintID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign complaint to officer
complaintsRouter.post('/:id/assign', async (req, res) => {
  const { AssigningOfficerID, ResolvingOfficerID } = req.body || {};
  if (!AssigningOfficerID || !ResolvingOfficerID) return res.status(400).json({ error: 'AssigningOfficerID and ResolvingOfficerID are required' });
  
  try {
    // Create assignment
    const [assignmentResult] = await db.query(
      'INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp) VALUES (?, ?, ?, NOW())',
      [req.params.id, AssigningOfficerID, ResolvingOfficerID]
    );
    
    // Update complaint status
    await db.query(
      'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
      ['ASSIGNED', req.params.id]
    );
    
    // Log the assignment
    await db.query(
      'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
      [req.params.id, 'ASSIGNED', AssigningOfficerID, 'Complaint assigned to officer']
    );
    
    res.status(201).json({ message: 'Complaint assigned successfully', assignmentId: assignmentResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint status
complaintsRouter.put('/:id/status', async (req, res) => {
  const { Status, OfficerID, ActionDescription } = req.body || {};
  if (!Status || !OfficerID) return res.status(400).json({ error: 'Status and OfficerID are required' });
  
  const validStatuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];
  if (!validStatuses.includes(Status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
  }
  
  try {
    // Update complaint status
    await db.query(
      'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
      [Status, req.params.id]
    );
    
    // Log the status change
    await db.query(
      'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
      [req.params.id, Status, OfficerID, ActionDescription || `Status changed to ${Status}`]
    );
    
    res.json({ message: 'Complaint status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaints by person
complaintsRouter.get('/person/:personId', async (req, res) => {
  try {
    const status = req.query.status;
    const [rows] = await db.query(`
      SELECT c.*, 
             p.FirstName, p.LastName, p.PhoneNumber,
             d.DepartmentName,
             v.VillageName,
             ca.AssignmentID, ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
             ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
             ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName
      FROM Complaint c
      LEFT JOIN Person p ON c.PersonID = p.PersonID
      LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
      LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
      LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
      WHERE c.PersonID = ?
      ${status ? 'AND UPPER(TRIM(c.Status)) = UPPER(TRIM(?))' : ''}
      ORDER BY c.ComplaintID DESC
    `, status ? [req.params.personId, status] : [req.params.personId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaints by officer
complaintsRouter.get('/officer/:officerId', async (req, res) => {
  try {
    const status = req.query.status;
    const [rows] = await db.query(`
      SELECT c.*, 
             p.FirstName, p.LastName, p.PhoneNumber,
             d.DepartmentName,
             v.VillageName,
             ca.AssignmentID, ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
             ao.FirstName as AssigningFirstName, ao.LastName as AssigningLastName,
             ro.FirstName as ResolvingFirstName, ro.LastName as ResolvingLastName
      FROM Complaint c
      LEFT JOIN Person p ON c.PersonID = p.PersonID
      LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
      LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
      LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
      WHERE ca.ResolvingOfficerID = ?
      ${status ? 'AND UPPER(TRIM(c.Status)) = UPPER(TRIM(?))' : ''}
      ORDER BY c.ComplaintID DESC
    `, status ? [req.params.officerId, status] : [req.params.officerId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaint statistics
complaintsRouter.get('/stats/overview', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalComplaints,
        SUM(CASE WHEN Status = 'NEW' THEN 1 ELSE 0 END) as newComplaints,
        SUM(CASE WHEN Status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedComplaints,
        SUM(CASE WHEN Status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressComplaints,
        SUM(CASE WHEN Status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedComplaints,
        SUM(CASE WHEN Status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedComplaints,
        SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closedComplaints
      FROM Complaint
    `);
    
    const [departmentStats] = await db.query(`
      SELECT d.DepartmentName, COUNT(c.ComplaintID) as complaintCount
      FROM Department d
      LEFT JOIN Complaint c ON d.DepartmentID = c.DepartmentID
      GROUP BY d.DepartmentID, d.DepartmentName
      ORDER BY complaintCount DESC
    `);
    
    // Removed by-district stats because Village may not have District column
    
    res.json({
      overview: stats[0],
      byDepartment: departmentStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


