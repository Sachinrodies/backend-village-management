import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

const PASSWORD_FILE = path.join(process.cwd(), 'data', 'officer-passwords.json');

// Simple password management for officers
export const setOfficerPassword = async (officerId, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let passwords = {};
    try {
      const data = await fs.readFile(PASSWORD_FILE, 'utf8');
      passwords = JSON.parse(data);
    } catch (error) {
    
    }
    
    passwords[officerId] = hashedPassword;
    
    await fs.writeFile(PASSWORD_FILE, JSON.stringify(passwords, null, 2));
    return true;
  } catch (error) {
    console.error('Error setting password:', error);
    return false;
  }
};

export const verifyOfficerPassword = async (officerId, password) => {
  try {
    const data = await fs.readFile(PASSWORD_FILE, 'utf8');
    const passwords = JSON.parse(data);
    
    if (!passwords[officerId]) {
      return false;
    }
    
    return await bcrypt.compare(password, passwords[officerId]);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const hasOfficerPassword = async (officerId) => {
  try {
    const data = await fs.readFile(PASSWORD_FILE, 'utf8');
    const passwords = JSON.parse(data);
    return !!passwords[officerId];
  } catch (error) {
    return false;
  }
};

// Return list of officer IDs (as strings) that have passwords set
export const getAllOfficersWithPasswords = async () => {
  try {
    const data = await fs.readFile(PASSWORD_FILE, 'utf8');
    const passwords = JSON.parse(data);
    return Object.keys(passwords);
  } catch (error) {
    return [];
  }
};