import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../index.js';

export const authRouter = Router();

// Villager login 
authRouter.post('/login', async (req, res) => {
  const { phoneNumber, firstName, lastName } = req.body;
  
  if (!phoneNumber || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  try {
    
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    const [persons] = await db.query(`
      SELECT p.*, v.VillageName
      FROM Person p
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      WHERE p.PhoneNumber = ? AND TRIM(p.FirstName) = ? AND TRIM(p.LastName) = ?
    `, [phoneNumber, trimmedFirstName, trimmedLastName]);
    
    // Check if officer first (match by phone number and name, then verify password)
    const [assigningOfficer] = await db.query(`
      SELECT ao.*, d.DepartmentName
      FROM AssigningOfficer ao
      LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
      WHERE ao.PhoneNumber = ? AND TRIM(ao.FirstName) = ? AND TRIM(ao.LastName) = ?
    `, [phoneNumber, trimmedFirstName, trimmedLastName]);
    
    const [resolvingOfficer] = await db.query(`
      SELECT ro.*, d.DepartmentName
      FROM ResolvingOfficer ro
      LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
      WHERE ro.PhoneNumber = ? AND TRIM(ro.FirstName) = ? AND TRIM(ro.LastName) = ?
    `, [phoneNumber, trimmedFirstName, trimmedLastName]);
    
    // If officer found, verify password and return officer data
    if (assigningOfficer.length > 0) {
      const officer = assigningOfficer[0];
      const isPasswordValid = await bcrypt.compare(password, officer.Password);
      
      if (isPasswordValid) {
        const user = {
          id: officer.AssigningOfficerID.toString(),
          name: `${officer.FirstName} ${officer.LastName}`,
          phoneNumber: officer.PhoneNumber,
          email: officer.Email,
          role: 'assigning_officer',
          department: officer.DepartmentName,
          designation: officer.Designation
        };
        return res.json({ success: true, user });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    if (resolvingOfficer.length > 0) {
      const officer = resolvingOfficer[0];
      const isPasswordValid = await bcrypt.compare(password, officer.Password);
      
      if (isPasswordValid) {
        const user = {
          id: officer.ResolvingOfficerID.toString(),
          name: `${officer.FirstName} ${officer.LastName}`,
          phoneNumber: officer.PhoneNumber,
          email: officer.Email,
          role: 'resolving_officer',
          department: officer.DepartmentName,
          designation: officer.Designation
        };
        return res.json({ success: true, user });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // If not an officer, check if person exists
    if (persons.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const person = persons[0];
    
    // Person (villager) login
    const user = {
      id: person.PersonID.toString(),
      name: `${person.FirstName} ${person.LastName}`,
      phoneNumber: person.PhoneNumber,
      village: person.VillageName,
      role: 'villager'
    };
    
    res.json({ success: true, user });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Villager registration
authRouter.post('/register', async (req, res) => {
  const { FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber } = req.body;
  
  if (!FirstName || !LastName || !PhoneNumber || !Gender || !DateOfBirth || !Address || !CensusVillageCode || !Occupation || !AadhaarNumber) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT PersonID FROM Person WHERE PhoneNumber = ?', [PhoneNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Insert new person
    const [result] = await db.query(`
      INSERT INTO Person (FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber]);
    
    res.json({ 
      success: true, 
      message: 'Registration successful',
      personId: result.insertId 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Officer login (phone + name + password)
authRouter.post('/officer/login', async (req, res) => {
  const { phoneNumber, firstName, lastName, password } = req.body;
  
  if (!phoneNumber || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'Phone number, name, and password required' });
  }
  
  try {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    // Check AssigningOfficer first
    const [assigningOfficers] = await db.query(`
      SELECT ao.*, d.DepartmentName
      FROM AssigningOfficer ao
      LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
      WHERE ao.PhoneNumber = ? AND TRIM(ao.FirstName) = ? AND TRIM(ao.LastName) = ? AND ao.IsActive = 1
    `, [phoneNumber, trimmedFirstName, trimmedLastName]);
    
    // Check ResolvingOfficer
    const [resolvingOfficers] = await db.query(`
      SELECT ro.*, d.DepartmentName
      FROM ResolvingOfficer ro
      LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
      WHERE ro.PhoneNumber = ? AND TRIM(ro.FirstName) = ? AND TRIM(ro.LastName) = ? AND ro.IsActive = 1
    `, [phoneNumber, trimmedFirstName, trimmedLastName]);
    
    // Check AssigningOfficer
    if (assigningOfficers.length > 0) {
      const officer = assigningOfficers[0];
      const isPasswordValid = await bcrypt.compare(password, officer.Password);
      
      if (isPasswordValid) {
        const user = {
          id: officer.AssigningOfficerID.toString(),
          name: `${officer.FirstName} ${officer.LastName}`,
          phoneNumber: officer.PhoneNumber,
          email: officer.Email,
          role: 'assigning_officer',
          department: officer.DepartmentName,
          designation: officer.Designation
        };
        return res.json({ success: true, user });
      }
    }
    
    // Check ResolvingOfficer
    if (resolvingOfficers.length > 0) {
      const officer = resolvingOfficers[0];
      const isPasswordValid = await bcrypt.compare(password, officer.Password);
      
      if (isPasswordValid) {
        const user = {
          id: officer.ResolvingOfficerID.toString(),
          name: `${officer.FirstName} ${officer.LastName}`,
          phoneNumber: officer.PhoneNumber,
          email: officer.Email,
          role: 'resolving_officer',
          department: officer.DepartmentName,
          designation: officer.Designation
        };
        return res.json({ success: true, user });
      }
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Officer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all persons
authRouter.get('/persons', async (req, res) => {
  try {
    const [persons] = await db.query(`
      SELECT p.*, v.VillageName
      FROM Person p
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      ORDER BY p.PersonID DESC
    `);
    
    res.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
});