import { db } from '../../index.js';

export async function getAllComplaints() {
  const [complaints] = await db.query(`
    SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName,
           ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
           ao.FirstName as AssigningOfficerName, ao.LastName as AssigningOfficerLastName,
           ro.FirstName as ResolvingOfficerName, ro.LastName as ResolvingOfficerLastName
    FROM Complaint c
    LEFT JOIN Person p ON c.PersonID = p.PersonID
    LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
    LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
    LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
    LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
    LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
    ORDER BY c.ComplaintID DESC
  `);
  return complaints;
}

export async function getComplaintById(id) {
  const [complaints] = await db.query(`
    SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName
    FROM Complaint c
    LEFT JOIN Person p ON c.PersonID = p.PersonID
    LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
    LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
    WHERE c.ComplaintID = ?
  `, [id]);
  return complaints[0] || null;
}

export async function getComplaintsByPerson(personId) {
  const [complaints] = await db.query(`
    SELECT c.*, d.DepartmentName, v.VillageName
    FROM Complaint c
    LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
    LEFT JOIN Person p ON c.PersonID = p.PersonID
    LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
    WHERE c.PersonID = ?
    ORDER BY c.ComplaintID DESC
  `, [personId]);
  return complaints;
}

export async function getDashboardStats() {
  const [stats] = await db.query(`
    SELECT 
      COUNT(*) as totalComplaints,
      SUM(CASE WHEN Status = 'NEW' THEN 1 ELSE 0 END) as newComplaints,
      SUM(CASE WHEN Status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedComplaints,
      SUM(CASE WHEN Status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressComplaints,
      SUM(CASE WHEN Status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedComplaints,
      SUM(CASE WHEN Status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedComplaints
    FROM Complaint
  `);
  return stats[0];
}

export async function getComplaintsByOfficer({ officerId, role }) {
  let query = `
    SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName
    FROM Complaint c
    LEFT JOIN Person p ON c.PersonID = p.PersonID
    LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
    LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
    LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
    WHERE `;
  query += role === 'assigning' ? 'ca.AssigningOfficerID = ?' : 'ca.ResolvingOfficerID = ?';
  query += ' ORDER BY c.ComplaintID DESC';
  const [complaints] = await db.query(query, [officerId]);
  return complaints;
}


