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
  
  // If department is already provided, use it
  if (providedDepartmentId) {
    return providedDepartmentId;
  }
  
  // Define department classification patterns
  const departmentPatterns = {
    // Education Department
    education: {
      patterns: [
        /(mid\s*-?\s*day\s*meal|mdm)/i,
        /(school|education|teacher|student|classroom|library|book)/i,
        /(exam|admission|scholarship|tuition)/i
      ],
      departmentName: 'Education'
    },
    
    // Health Department
    health: {
      patterns: [
        /(health|hospital|clinic|doctor|nurse|medicine|medical|pharmacy)/i,
        /(ambulance|emergency|treatment|disease|illness|sick)/i,
        /(vaccination|immunization|maternal|child\s*health)/i
      ],
      departmentName: 'Health'
    },
    
    // Electricity Department
    electricity: {
      patterns: [
        /(electricity|electric|power|transformer|wire|cable|bulb|light)/i,
        /(voltage|current|meter|billing|connection|disconnection)/i,
        /(street\s*light|pole|electrical)/i
      ],
      departmentName: 'Electricity'
    },
    
    // Water Department
    water: {
      patterns: [
        /(water|supply|pipeline|tap|handpump|well|borewell)/i,
        /(drinking|potable|purification|tank|reservoir)/i,
        /(irrigation|canal|drainage|flood)/i
      ],
      departmentName: 'Water Supply'
    },
    
    // Public Works Department
    publicWorks: {
      patterns: [
        /(road|bridge|construction|repair|pothole|street)/i,
        /(building|infrastructure|drain|sewer|gutter)/i,
        /(maintenance|renovation|development)/i
      ],
      departmentName: 'Public Works'
    },
    
    // Sanitation Department
    sanitation: {
      patterns: [
        /(garbage|waste|trash|cleanliness|sweeping)/i,
        /(toilet|latrine|sewerage|drainage)/i,
        /(hygiene|sanitation|cleaning)/i
      ],
      departmentName: 'Sanitation'
    }
  };
  
  // Check each department pattern
  for (const [key, config] of Object.entries(departmentPatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(normalized)) {
        const departmentId = await getDepartmentIdByName(config.departmentName);
        if (departmentId) {
          console.log(`Complaint classified as ${config.departmentName} based on pattern: ${pattern}`);
          return departmentId;
        }
      }
    }
  }
  
  // If no pattern matches, return default department (General Administration)
  console.log('No specific department pattern matched, using default department');
  return 1; // Default to General Administration
}


