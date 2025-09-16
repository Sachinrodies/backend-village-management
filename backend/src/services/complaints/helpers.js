import { db } from '../../index.js';

export async function getDepartmentHeadAssigningOfficerId(departmentId) {
  const [deptRows] = await db.query(
    'SELECT DepartmentHeadID FROM Department WHERE DepartmentID = ? LIMIT 1',
    [departmentId]
  );
  if (deptRows.length > 0 && deptRows[0].DepartmentHeadID) {
    const departmentHeadId = deptRows[0].DepartmentHeadID;
    const [headsById] = await db.query(
      'SELECT AssigningOfficerID FROM AssigningOfficer WHERE AssigningOfficerID = ? AND DepartmentID = ? LIMIT 1',
      [departmentHeadId, departmentId]
    );
    if (headsById.length > 0) return headsById[0].AssigningOfficerID;
  }
  const [any] = await db.query(
    'SELECT AssigningOfficerID FROM AssigningOfficer WHERE DepartmentID = ? ORDER BY AssigningOfficerID ASC LIMIT 1',
    [departmentId]
  );
  return any.length > 0 ? any[0].AssigningOfficerID : null;
}

export async function getDepartmentIdByName(departmentName) {
  const [rows] = await db.query(
    'SELECT DepartmentID FROM Department WHERE LOWER(DepartmentName) = LOWER(?) LIMIT 1',
    [departmentName]
  );
  return rows.length > 0 ? rows[0].DepartmentID : null;
}

export async function classifyDepartmentId({ description, providedDepartmentId }) {
  const normalized = (description || '').toLowerCase();
  const mdmPattern = /(mid\s*-?\s*day\s*meal|mdm)/i;
  if (mdmPattern.test(normalized)) {
    const educationId = await getDepartmentIdByName('Education');
    if (educationId) return educationId;
  }
  return providedDepartmentId || 1;
}


