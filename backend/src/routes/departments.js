import { Router } from 'express';
import { db } from '../index.js';

export const departmentsRouter = Router();

// Get all departments
departmentsRouter.get('/', async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM Department ORDER BY DepartmentName');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get resolving officers by department name (quick lookup for frontend)
departmentsRouter.get('/by-name/:name/resolving-officers', async (req, res) => {
  const { name } = req.params;
  try {
    const [officers] = await db.query(`
      SELECT ro.ResolvingOfficerID as id, ro.FirstName, ro.LastName, ro.Email, ro.PhoneNumber, ro.Designation, d.DepartmentName
      FROM ResolvingOfficer ro
      LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
      WHERE d.DepartmentName = ? AND ro.IsActive = 1
      ORDER BY ro.FirstName, ro.LastName
    `, [name]);
    res.json(officers.map(o => ({
      id: o.id,
      name: `${o.FirstName} ${o.LastName}`,
      email: o.Email,
      phoneNumber: o.PhoneNumber,
      designation: o.Designation,
      department: o.DepartmentName
    })));
  } catch (error) {
    console.error('Error fetching resolving officers:', error);
    res.status(500).json({ error: 'Failed to fetch resolving officers' });
  }
});

// Create department
departmentsRouter.post('/', async (req, res) => {
  const { DepartmentName, ContactNumber, Email } = req.body;
  
  if (!DepartmentName) {
    return res.status(400).json({ error: 'Department name required' });
  }
  
  try {
    const [result] = await db.query(`
      INSERT INTO Department (DepartmentName, ContactNumber, Email)
      VALUES (?, ?, ?)
    `, [DepartmentName, ContactNumber || '', Email || '']);
    
    res.json({ 
      success: true, 
      message: 'Department created successfully',
      departmentId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});