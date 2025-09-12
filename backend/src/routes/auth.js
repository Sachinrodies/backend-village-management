import { Router } from 'express';
import { db } from '../index.js';
import { validatePerson } from '../middleware/validation.js';

export const authRouter = Router();

// Login with phone number and name
authRouter.post('/login', async (req, res) => {
  const { phoneNumber, firstName, lastName } = req.body;
  
  if (!phoneNumber || !firstName || !lastName) {
    return res.status(400).json({ 
      error: 'Phone number, first name, and last name are required' 
    });
  }
  
  // Validate phone number format
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ 
      error: 'Phone number must be a valid 10-digit Indian mobile number' 
    });
  }
  
  try {
    // Find person by phone number and name
    const [persons] = await db.query(`
      SELECT p.*, v.VillageName, v.District, v.Block, v.State
      FROM Person p
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      WHERE p.PhoneNumber = ? AND p.FirstName = ? AND p.LastName = ?
    `, [phoneNumber, firstName, lastName]);
    
    if (persons.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Please check your phone number and name.' 
      });
    }
    
    const person = persons[0];
    
    // Check if person is an officer
    const [assigningOfficer] = await db.query(`
      SELECT ao.*, d.DepartmentName
      FROM AssigningOfficer ao
      LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
      WHERE ao.PersonID = ?
    `, [person.PersonID]);
    
    const [resolvingOfficer] = await db.query(`
      SELECT ro.*, d.DepartmentName
      FROM ResolvingOfficer ro
      LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
      WHERE ro.PersonID = ?
    `, [person.PersonID]);
    
    // Determine user role
    let role = 'villager';
    let department = null;
    
    if (assigningOfficer.length > 0) {
      role = 'assigning_officer';
      department = assigningOfficer[0].DepartmentName;
    } else if (resolvingOfficer.length > 0) {
      role = 'resolution_officer';
      department = resolvingOfficer[0].DepartmentName;
    }
    
    // Create user object
    const user = {
      id: person.PersonID.toString(),
      name: `${person.FirstName} ${person.LastName}`,
      phoneNumber: person.PhoneNumber,
      role: role,
      village: person.VillageName,
      district: person.District,
      block: person.Block,
      department: department,
      personId: person.PersonID,
      address: person.Address,
      occupation: person.Occupation,
      aadharNumber: person.AadhaarNumber
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Register new person (villager)
authRouter.post('/register', validatePerson, async (req, res) => {
  const { 
    FirstName, 
    LastName, 
    PhoneNumber, 
    Gender, 
    DateOfBirth, 
    Address, 
    CensusVillageCode, 
    Occupation, 
    AadhaarNumber, 
    MiddleName 
  } = req.body;
  
  try {
    // Check if person already exists
    const [existingPerson] = await db.query(
      'SELECT PersonID FROM Person WHERE PhoneNumber = ?',
      [PhoneNumber]
    );
    
    if (existingPerson.length > 0) {
      return res.status(409).json({ 
        error: 'Person with this phone number already exists' 
      });
    }
    
    // Create new person
    const [result] = await db.query(
      'INSERT INTO Person (FirstName, MiddleName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [FirstName, MiddleName || null, LastName, PhoneNumber, Gender || null, DateOfBirth || null, Address || null, CensusVillageCode || null, Occupation || null, AadhaarNumber || null]
    );
    
    // Get village information
    const [village] = await db.query(`
      SELECT VillageName, District, Block, State
      FROM Village 
      WHERE CensusVillageCode = ?
    `, [CensusVillageCode]);
    
    const user = {
      id: result.insertId.toString(),
      name: `${FirstName} ${LastName}`,
      phoneNumber: PhoneNumber,
      role: 'villager',
      village: village[0]?.VillageName || null,
      district: village[0]?.District || null,
      block: village[0]?.Block || null,
      personId: result.insertId,
      address: Address,
      occupation: Occupation,
      aadharNumber: AadhaarNumber
    };
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: user
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Get user profile
authRouter.get('/profile/:personId', async (req, res) => {
  try {
    const [persons] = await db.query(`
      SELECT p.*, v.VillageName, v.District, v.Block, v.State
      FROM Person p
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      WHERE p.PersonID = ?
    `, [req.params.personId]);
    
    if (persons.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    const person = persons[0];
    
    // Check officer status
    const [assigningOfficer] = await db.query(`
      SELECT ao.*, d.DepartmentName
      FROM AssigningOfficer ao
      LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
      WHERE ao.PersonID = ?
    `, [person.PersonID]);
    
    const [resolvingOfficer] = await db.query(`
      SELECT ro.*, d.DepartmentName
      FROM ResolvingOfficer ro
      LEFT JOIN Department d ON ro.DepartmentID = d.DepartmentID
      WHERE ro.PersonID = ?
    `, [person.PersonID]);
    
    let role = 'villager';
    let department = null;
    
    if (assigningOfficer.length > 0) {
      role = 'assigning_officer';
      department = assigningOfficer[0].DepartmentName;
    } else if (resolvingOfficer.length > 0) {
      role = 'resolution_officer';
      department = resolvingOfficer[0].DepartmentName;
    }
    
    const user = {
      id: person.PersonID.toString(),
      name: `${person.FirstName} ${person.LastName}`,
      phoneNumber: person.PhoneNumber,
      role: role,
      village: person.VillageName,
      district: person.District,
      block: person.Block,
      department: department,
      personId: person.PersonID,
      address: person.Address,
      occupation: person.Occupation,
      aadharNumber: person.AadharNumber
    };
    
    res.json({ user });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
authRouter.put('/profile/:personId', async (req, res) => {
  const { 
    FirstName, 
    LastName, 
    PhoneNumber, 
    Gender, 
    DateOfBirth, 
    Address, 
    CensusVillageCode, 
    Occupation, 
    AadharNumber, 
    MiddleName 
  } = req.body;
  
  try {
    await db.query(
      'UPDATE Person SET FirstName=?, MiddleName=?, LastName=?, PhoneNumber=?, Gender=?, DateOfBirth=?, Address=?, CensusVillageCode=?, Occupation=?, AadharNumber=? WHERE PersonID=?',
      [FirstName, MiddleName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadharNumber, req.params.personId]
    );
    
    res.json({ message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Check if phone number exists
authRouter.get('/check-phone/:phoneNumber', async (req, res) => {
  try {
    const [persons] = await db.query(
      'SELECT PersonID, FirstName, LastName FROM Person WHERE PhoneNumber = ?',
      [req.params.phoneNumber]
    );
    
    res.json({ 
      exists: persons.length > 0,
      person: persons[0] || null
    });
    
  } catch (error) {
    console.error('Phone check error:', error);
    res.status(500).json({ error: 'Failed to check phone number' });
  }
});
