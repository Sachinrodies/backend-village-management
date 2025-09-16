import { db } from '../../index.js';

export async function getComplaintFeedback(id) {
  const [feedback] = await db.query(`
    SELECT f.*, p.FirstName, p.LastName
    FROM Feedback f
    LEFT JOIN Person p ON f.PersonID = p.PersonID
    WHERE f.ComplaintID = ?
    ORDER BY f.FeedbackTimestamp DESC
  `, [id]);
  return feedback;
}

export async function getComplaintLogs(id) {
  const [logs] = await db.query(`
    SELECT cl.*, 
           CASE 
             WHEN cl.OfficerID IN (SELECT AssigningOfficerID FROM AssigningOfficer) THEN CONCAT(ao.FirstName, ' ', ao.LastName)
             WHEN cl.OfficerID IN (SELECT ResolvingOfficerID FROM ResolvingOfficer) THEN CONCAT(ro.FirstName, ' ', ro.LastName)
             ELSE 'System'
           END as OfficerName
    FROM ComplaintLog cl
    LEFT JOIN AssigningOfficer ao ON cl.OfficerID = ao.AssigningOfficerID
    LEFT JOIN ResolvingOfficer ro ON cl.OfficerID = ro.ResolvingOfficerID
    WHERE cl.ComplaintID = ?
    ORDER BY cl.Timestamp DESC
  `, [id]);
  return logs;
}

export async function getComplaintUpdates(id) {
  const [updates] = await db.query(`
    SELECT cl.*, p.FirstName, p.LastName
    FROM ComplaintLog cl
    LEFT JOIN Person p ON cl.OfficerID = p.PersonID
    WHERE cl.ComplaintID = ? AND cl.ActionDescription IS NOT NULL
    ORDER BY cl.Timestamp DESC
  `, [id]);
  return updates;
}


