import { Router } from 'express';
import { db } from '../index.js';
import { validatePerson } from '../middleware/validation.js';

export const personsRouter = Router();

// Get all persons
personsRouter.get('/', async (req, res) => {
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

// Get person by ID
personsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [persons] = await db.query(`
      SELECT p.*, v.VillageName
      FROM Person p
      LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
      WHERE p.PersonID = ?
    `, [id]);
    
    if (persons.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(persons[0]);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
});

// Create person
personsRouter.post('/', validatePerson, async (req, res) => {
  const { FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber } = req.body;
  
  try {
    // Check if person already exists
    const [existing] = await db.query('SELECT PersonID FROM Person WHERE PhoneNumber = ?', [PhoneNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Person already exists with this phone number' });
    }
    
    const [result] = await db.query(`
      INSERT INTO Person (FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadhaarNumber]);
    
    res.json({ 
      success: true, 
      message: 'Person created successfully',
      personId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
});