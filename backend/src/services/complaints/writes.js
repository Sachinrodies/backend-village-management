import { db } from '../../index.js';
import { classifyDepartmentId, getDepartmentHeadAssigningOfficerId } from './helpers.js';

export async function createComplaint({ PersonID, Description, PriorityLevel, LocationDescription, DepartmentID }) {
  const departmentId = await classifyDepartmentId({ description: Description, providedDepartmentId: DepartmentID });
  const [result] = await db.query(
    `INSERT INTO Complaint (PersonID, Description, PriorityLevel, LocationDescription, Status, Timestamp, DepartmentID)
     VALUES (?, ?, ?, ?, 'NEW', NOW(), ?)`,
    [PersonID, Description, PriorityLevel || 'MEDIUM', LocationDescription || '', departmentId]
  );
  const complaintId = result.insertId;
  const assigningOfficerId = await getDepartmentHeadAssigningOfficerId(departmentId);
  if (assigningOfficerId) {
    await db.query(
      `INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp)
       VALUES (?, ?, NULL, NOW())`,
      [complaintId, assigningOfficerId]
    );
    await db.query('UPDATE Complaint SET Status = \"ASSIGNED\" WHERE ComplaintID = ?', [complaintId]);
  }
  return complaintId;
}

export async function updateComplaintStatus({ id, status, notes, officerId }) {
  await db.query('UPDATE Complaint SET Status = ? WHERE ComplaintID = ?', [status, id]);
  await db.query(
    `INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription)
     VALUES (?, ?, ?, NOW(), ?)`,
    [id, status, officerId || 1, notes || `Status changed to ${status}`]
  );
}

export async function assignComplaint({ id, AssigningOfficerID, ResolvingOfficerID }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[complaint]] = await connection.query('SELECT DepartmentID FROM Complaint WHERE ComplaintID = ?', [id]);
    if (!complaint) {
      const err = new Error('Complaint not found'); err.statusCode = 404; throw err;
    }
    const [[resolvingOfficer]] = await connection.query('SELECT DepartmentID FROM ResolvingOfficer WHERE ResolvingOfficerID = ?', [ResolvingOfficerID]);
    if (!resolvingOfficer) { const err = new Error('Resolving officer not found'); err.statusCode = 404; throw err; }
    if (Number(resolvingOfficer.DepartmentID) !== Number(complaint.DepartmentID)) {
      const err = new Error('Resolving officer department does not match complaint department'); err.statusCode = 400; throw err;
    }
    let assigningOfficerIdToUse = AssigningOfficerID;
    if (!assigningOfficerIdToUse) {
      assigningOfficerIdToUse = await getDepartmentHeadAssigningOfficerId(complaint.DepartmentID);
      if (!assigningOfficerIdToUse) { const err = new Error('No assigning officer found for this department'); err.statusCode = 400; throw err; }
    }
    await connection.query('DELETE FROM ComplaintAssignment WHERE ComplaintID = ?', [id]);
    await connection.query(
      `INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp)
       VALUES (?, ?, ?, NOW())`,
      [id, assigningOfficerIdToUse, ResolvingOfficerID]
    );
    await connection.query('UPDATE Complaint SET Status = \"ASSIGNED\" WHERE ComplaintID = ?', [id]);
    await connection.commit();
  } catch (e) {
    try { await connection.rollback(); } catch {}
    throw e;
  } finally {
    try { connection.release(); } catch {}
  }
}

export async function addComplaintUpdate({ id, content, isPublic, createdBy }) {
  await db.query(
    `INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription)
     VALUES (?, 'UPDATE', ?, NOW(), ?)`,
    [id, createdBy || 1, content]
  );
}


