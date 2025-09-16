import { db } from '../../index.js';
import { getDepartmentHeadAssigningOfficerId } from './helpers.js';

export async function transferComplaintDepartment({ id, targetDepartmentName, targetDepartmentId, ResolvingOfficerID }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    let newDeptId = targetDepartmentId;
    if (!newDeptId && targetDepartmentName) {
      const [rows] = await connection.query(
        'SELECT DepartmentID FROM Department WHERE LOWER(DepartmentName) = LOWER(?) LIMIT 1',
        [targetDepartmentName]
      );
      if (rows.length > 0) newDeptId = rows[0].DepartmentID;
    }
    if (!newDeptId) {
      const err = new Error('Target department not found'); err.statusCode = 404; throw err;
    }
    const [result] = await connection.query(
      "UPDATE Complaint SET DepartmentID = ?, Status = 'NEW' WHERE ComplaintID = ?",
      [newDeptId, id]
    );
    if (result.affectedRows === 0) { const err = new Error('Complaint not found'); err.statusCode = 404; throw err; }
    await connection.query('DELETE FROM ComplaintAssignment WHERE ComplaintID = ?', [id]);
    const assigningOfficerId = await getDepartmentHeadAssigningOfficerId(newDeptId);
    let resolvingOfficerIdToUse = null;
    if (ResolvingOfficerID) {
      const [[resolvingOfficer]] = await connection.query('SELECT DepartmentID FROM ResolvingOfficer WHERE ResolvingOfficerID = ?', [ResolvingOfficerID]);
      if (!resolvingOfficer || Number(resolvingOfficer.DepartmentID) !== Number(newDeptId)) {
        const err = new Error('Resolving officer department does not match target department'); err.statusCode = 400; throw err;
      }
      resolvingOfficerIdToUse = ResolvingOfficerID;
    }
    if (assigningOfficerId) {
      await connection.query(
        'INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp) VALUES (?, ?, ?, NOW())',
        [id, assigningOfficerId, resolvingOfficerIdToUse]
      );
      await connection.query("UPDATE Complaint SET Status = 'ASSIGNED' WHERE ComplaintID = ?", [id]);
    }
    await connection.commit();
    return { success: true, newDepartmentId: newDeptId, assigningOfficerId, resolvingOfficerId: resolvingOfficerIdToUse };
  } catch (e) {
    try { await connection.rollback(); } catch {}
    throw e;
  } finally {
    try { connection.release(); } catch {}
  }
}


