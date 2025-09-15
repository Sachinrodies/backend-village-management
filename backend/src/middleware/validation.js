// Simple validation middleware

export const validateComplaint = (req, res, next) => {
  const { PersonID, Description, PriorityLevel } = req.body;
  
  if (!PersonID) {
    return res.status(400).json({ error: 'PersonID required' });
  }
  
  if (!Description || Description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters' });
  }
  
  if (PriorityLevel && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(PriorityLevel)) {
    return res.status(400).json({ error: 'Invalid priority level' });
  }
  
  next();
};

export const validatePerson = (req, res, next) => {
  const { FirstName, LastName, PhoneNumber, Gender, DateOfBirth } = req.body;
  
  if (!FirstName || !LastName) {
    return res.status(400).json({ error: 'Name required' });
  }
  
  if (!PhoneNumber || !/^[6-9]\d{9}$/.test(PhoneNumber)) {
    return res.status(400).json({ error: 'Valid phone number required' });
  }
  
  if (!Gender || !['Male', 'Female', 'M', 'F'].includes(Gender)) {
    return res.status(400).json({ error: 'Gender required' });
  }
  
  if (!DateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(DateOfBirth)) {
    return res.status(400).json({ error: 'Valid date required' });
  }
  
  next();
};

export const validateOfficerLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  next();
};

export const validateSetOfficerPassword = (req, res, next) => {
  const { officerId, password } = req.body;
  
  if (!officerId || !password) {
    return res.status(400).json({ error: 'Officer ID and password required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  next();
};

export const validateChangeOfficerPassword = (req, res, next) => {
  const { officerId, currentPassword, newPassword } = req.body;
  
  if (!officerId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  
  next();
};