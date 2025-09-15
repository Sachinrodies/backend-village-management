import { setOfficerPassword, hasOfficerPassword, getAllOfficersWithPasswords } from '../lib/passwordManager.js';
import { db } from '../index.js';

// Set password for a specific officer
export const setOfficerPasswordById = async (officerId, password) => {
  try {
    // Verify officer exists
    const [officers] = await db.query(
      'SELECT AssigningOfficerID, FirstName, LastName, Email FROM AssigningOfficer WHERE AssigningOfficerID = ?',
      [officerId]
    );
    
    if (officers.length === 0) {
      throw new Error(`Officer with ID ${officerId} not found`);
    }
    
    await setOfficerPassword(officerId, password);
    const officer = officers[0];
    
    console.log(`✅ Password set successfully for officer: ${officer.FirstName} ${officer.LastName} (${officer.Email})`);
    return { success: true, officer };
  } catch (error) {
    console.error(`❌ Failed to set password for officer ${officerId}:`, error.message);
    throw error;
  }
};

// Set password for officer by email
export const setOfficerPasswordByEmail = async (email, password) => {
  try {
    // Find officer by email
    const [officers] = await db.query(
      'SELECT AssigningOfficerID, FirstName, LastName, Email FROM AssigningOfficer WHERE Email = ?',
      [email]
    );
    
    if (officers.length === 0) {
      throw new Error(`Officer with email ${email} not found`);
    }
    
    const officer = officers[0];
    await setOfficerPassword(officer.AssigningOfficerID, password);
    
    console.log(`✅ Password set successfully for officer: ${officer.FirstName} ${officer.LastName} (${officer.Email})`);
    return { success: true, officer };
  } catch (error) {
    console.error(`❌ Failed to set password for officer with email ${email}:`, error.message);
    throw error;
  }
};

// List all officers and their password status
export const listOfficersPasswordStatus = async () => {
  try {
    const [officers] = await db.query(`
      SELECT ao.AssigningOfficerID, ao.FirstName, ao.LastName, ao.Email, ao.IsActive,
             d.DepartmentName
      FROM AssigningOfficer ao
      LEFT JOIN Department d ON ao.DepartmentID = d.DepartmentID
      ORDER BY ao.AssigningOfficerID
    `);
    
    const officersWithPasswords = await getAllOfficersWithPasswords();
    
    console.log('\n📋 Officer Password Status:');
    console.log('=' .repeat(80));
    console.log('ID\tName\t\t\tEmail\t\t\t\tDepartment\t\tPassword Set');
    console.log('-'.repeat(80));
    
    officers.forEach(officer => {
      const hasPassword = officersWithPasswords.includes(officer.AssigningOfficerID.toString());
      const status = hasPassword ? '✅ Yes' : '❌ No';
      const name = `${officer.FirstName} ${officer.LastName}`.padEnd(20);
      const email = officer.Email.padEnd(30);
      const department = (officer.DepartmentName || 'N/A').padEnd(20);
      
      console.log(`${officer.AssigningOfficerID}\t${name}\t${email}\t${department}\t${status}`);
    });
    
    return officers.map(officer => ({
      ...officer,
      hasPassword: officersWithPasswords.includes(officer.AssigningOfficerID.toString())
    }));
  } catch (error) {
    console.error('❌ Failed to list officers:', error.message);
    throw error;
  }
};

// Bulk set passwords for multiple officers
export const bulkSetPasswords = async (officerPasswords) => {
  const results = [];
  
  for (const { officerId, password } of officerPasswords) {
    try {
      const result = await setOfficerPasswordById(officerId, password);
      results.push({ officerId, success: true, result });
    } catch (error) {
      results.push({ officerId, success: false, error: error.message });
    }
  }
  
  console.log('\n📊 Bulk Password Setting Results:');
  console.log('=' .repeat(50));
  results.forEach(({ officerId, success, error }) => {
    if (success) {
      console.log(`✅ Officer ${officerId}: Password set successfully`);
    } else {
      console.log(`❌ Officer ${officerId}: ${error}`);
    }
  });
  
  return results;
};

// Generate random password
export const generateRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Set random password for officer
export const setRandomPasswordForOfficer = async (officerId, length = 8) => {
  const password = generateRandomPassword(length);
  await setOfficerPasswordById(officerId, password);
  return { officerId, password };
};
