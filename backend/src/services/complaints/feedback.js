import { db } from '../../index.js';

export async function submitFeedback({ complaintId, personId, rating, comments }) {
  const [complaints] = await db.query('SELECT Status FROM Complaint WHERE ComplaintID = ?', [complaintId]);
  if (complaints.length === 0) { const err = new Error('Complaint not found'); err.statusCode = 404; throw err; }
  if (complaints[0].Status !== 'RESOLVED') { const err = new Error('Complaint must be resolved before feedback'); err.statusCode = 400; throw err; }
  await db.query(
    'INSERT INTO Feedback (ComplaintID, PersonID, Rating, Comments, FeedbackTimestamp) VALUES (?, ?, ?, ?, NOW())',
    [complaintId, personId, rating, comments || '']
  );
}


