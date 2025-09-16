import { db } from '../../index.js';

export async function deleteComplaint({ id }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[complaint]] = await connection.query(
      'SELECT ComplaintID, DepartmentID FROM Complaint WHERE ComplaintID = ?',
      [id]
    );
    if (!complaint) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }
    await connection.query('DELETE FROM Feedback WHERE ComplaintID = ?', [id]);
    await connection.query('DELETE FROM ComplaintLog WHERE ComplaintID = ?', [id]);
    await connection.query('DELETE FROM ComplaintAssignment WHERE ComplaintID = ?', [id]);
    await connection.query('DELETE FROM Complaint WHERE ComplaintID = ?', [id]);
    await connection.commit();
    return { success: true, departmentId: complaint.DepartmentID };
  } catch (e) {
    try { await connection.rollback(); } catch {}
    throw e;
  } finally {
    try { connection.release(); } catch {}
  }
}

export async function resetAllAssignments() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM ComplaintAssignment');
    await connection.query("UPDATE Complaint SET Status = 'NEW' WHERE Status = 'ASSIGNED'");
    await connection.commit();
    return { success: true };
  } catch (e) {
    try { await connection.rollback(); } catch {}
    throw e;
  } finally {
    try { connection.release(); } catch {}
  }
}

export async function deleteTestComplaints({ keywords }) {
  const connection = await db.getConnection();
  const patterns = (keywords && Array.isArray(keywords) && keywords.length > 0)
    ? keywords
    : ['test', 'dummy', 'sample'];
  try {
    await connection.beginTransaction();
    const likeClauses = patterns.map(() => 'LOWER(Description) LIKE LOWER(?)').join(' OR ');
    const likeParams = patterns.map(k => `%${k}%`);
    const [rows] = await connection.query(
      `SELECT ComplaintID FROM Complaint WHERE ${likeClauses}`,
      likeParams
    );
    const ids = rows.map(r => r.ComplaintID);
    if (ids.length === 0) {
      await connection.commit();
      return { deleted: 0, ids: [] };
    }
    const idList = ids.join(',');
    await connection.query(`DELETE FROM Feedback WHERE ComplaintID IN (${idList})`);
    await connection.query(`DELETE FROM ComplaintLog WHERE ComplaintID IN (${idList})`);
    await connection.query(`DELETE FROM ComplaintAssignment WHERE ComplaintID IN (${idList})`);
    await connection.query(`DELETE FROM Complaint WHERE ComplaintID IN (${idList})`);
    await connection.commit();
    return { deleted: ids.length, ids };
  } catch (e) {
    try { await connection.rollback(); } catch {}
    throw e;
  } finally {
    try { connection.release(); } catch {}
  }
}


