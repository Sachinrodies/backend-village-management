import { Router } from 'express';
import { db } from '../index.js';

export const feedbackRouter = Router();

// List feedback
feedbackRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       ORDER BY f.FeedbackID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback by id
feedbackRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       WHERE f.FeedbackID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create feedback
feedbackRouter.post('/', async (req, res) => {
  const { ComplaintID, PersonID, Rating, Comments, FeedbackTimestamp } = req.body || {};
  if (!ComplaintID || !PersonID || !Rating) return res.status(400).json({ error: 'ComplaintID, PersonID, and Rating are required' });
  if (Rating < 1 || Rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  try {
    const [result] = await db.query(
      'INSERT INTO Feedback (ComplaintID, PersonID, Rating, Comments, FeedbackTimestamp) VALUES (?, ?, ?, ?, ?)',
      [ComplaintID, PersonID, Rating, Comments || null, FeedbackTimestamp || new Date()]
    );
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       WHERE f.FeedbackID = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update feedback
feedbackRouter.put('/:id', async (req, res) => {
  const { ComplaintID, PersonID, Rating, Comments, FeedbackTimestamp } = req.body || {};
  if (Rating && (Rating < 1 || Rating > 5)) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  try {
    await db.query(
      'UPDATE Feedback SET ComplaintID=?, PersonID=?, Rating=?, Comments=?, FeedbackTimestamp=? WHERE FeedbackID=?',
      [ComplaintID || null, PersonID || null, Rating || null, Comments || null, FeedbackTimestamp || null, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       WHERE f.FeedbackID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete feedback
feedbackRouter.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Feedback WHERE FeedbackID = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback by complaint
feedbackRouter.get('/complaint/:complaintId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       WHERE f.ComplaintID = ?
       ORDER BY f.FeedbackTimestamp DESC`,
      [req.params.complaintId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback by person
feedbackRouter.get('/person/:personId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, 
              c.Description as ComplaintDescription,
              p.FirstName, p.LastName
       FROM Feedback f
       LEFT JOIN Complaint c ON f.ComplaintID = c.ComplaintID
       LEFT JOIN Person p ON f.PersonID = p.PersonID
       WHERE f.PersonID = ?
       ORDER BY f.FeedbackTimestamp DESC`,
      [req.params.personId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
