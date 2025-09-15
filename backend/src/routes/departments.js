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