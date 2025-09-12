// Validation middleware for complaint system

export const validateComplaint = (req, res, next) => {
  const { PersonID, Description, PriorityLevel, LocationDescription } = req.body;
  
  if (!PersonID) {
    return res.status(400).json({ error: 'PersonID is required' });
  }
  
  if (!Description || Description.trim().length < 10) {
    return res.status(400).json({ error: 'Description is required and must be at least 10 characters long' });
  }
  
  if (PriorityLevel && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(PriorityLevel)) {
    return res.status(400).json({ error: 'PriorityLevel must be one of: LOW, MEDIUM, HIGH, URGENT' });
  }
  
  next();
};

export const validatePerson = (req, res, next) => {
  const { FirstName, LastName, PhoneNumber, Email, AadharNumber } = req.body;
  
  if (!FirstName || !LastName) {
    return res.status(400).json({ error: 'FirstName and LastName are required' });
  }
  
  if (PhoneNumber && !/^[6-9]\d{9}$/.test(PhoneNumber)) {
    return res.status(400).json({ error: 'PhoneNumber must be a valid 10-digit Indian mobile number' });
  }
  
  if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
    return res.status(400).json({ error: 'Email must be a valid email address' });
  }
  
  if (AadharNumber && !/^\d{12}$/.test(AadharNumber)) {
    return res.status(400).json({ error: 'AadharNumber must be a valid 12-digit number' });
  }
  
  next();
};

export const validateAssignment = (req, res, next) => {
  const { AssignedBy, AssignedTo, DepartmentID } = req.body;
  
  if (!AssignedBy || !AssignedTo) {
    return res.status(400).json({ error: 'AssignedBy and AssignedTo are required' });
  }
  
  if (AssignedBy === AssignedTo) {
    return res.status(400).json({ error: 'Cannot assign complaint to the same person' });
  }
  
  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { Status, UpdatedBy } = req.body;
  const validStatuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];
  
  if (!Status || !UpdatedBy) {
    return res.status(400).json({ error: 'Status and UpdatedBy are required' });
  }
  
  if (!validStatuses.includes(Status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
  }
  
  next();
};

export const validateFeedback = (req, res, next) => {
  const { ComplaintID, PersonID, Rating, Comments } = req.body;
  
  if (!ComplaintID || !PersonID || !Rating) {
    return res.status(400).json({ error: 'ComplaintID, PersonID, and Rating are required' });
  }
  
  if (Rating < 1 || Rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  if (Comments && Comments.length > 500) {
    return res.status(400).json({ error: 'Comments must be less than 500 characters' });
  }
  
  next();
};

export const validateDepartment = (req, res, next) => {
  const { DepartmentName, District, Block } = req.body;
  
  if (!DepartmentName) {
    return res.status(400).json({ error: 'DepartmentName is required' });
  }
  
  if (DepartmentName.length < 3) {
    return res.status(400).json({ error: 'DepartmentName must be at least 3 characters long' });
  }
  
  next();
};

export const validateVillage = (req, res, next) => {
  const { VillageName, CensusVillageCode, District, Block, State } = req.body;
  
  if (!VillageName || !CensusVillageCode) {
    return res.status(400).json({ error: 'VillageName and CensusVillageCode are required' });
  }
  
  if (!/^\d{6}$/.test(CensusVillageCode)) {
    return res.status(400).json({ error: 'CensusVillageCode must be a valid 6-digit code' });
  }
  
  next();
};

export const validateOfficer = (req, res, next) => {
  const { PersonID, DepartmentID, Designation, District, Block } = req.body;
  
  if (!PersonID || !DepartmentID) {
    return res.status(400).json({ error: 'PersonID and DepartmentID are required' });
  }
  
  if (Designation && Designation.length < 2) {
    return res.status(400).json({ error: 'Designation must be at least 2 characters long' });
  }
  
  next();
};

// Pagination validation
export const validatePagination = (req, res, next) => {
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'Limit must be between 1 and 100' });
  }
  
  if (offset < 0) {
    return res.status(400).json({ error: 'Offset must be non-negative' });
  }
  
  req.pagination = { limit, offset };
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry. Record already exists.' });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }
  
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ error: 'Cannot delete record. It is referenced by other records.' });
  }
  
  if (err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({ error: 'Invalid field name in query.' });
  }
  
  if (err.code === 'ER_PARSE_ERROR') {
    return res.status(400).json({ error: 'Invalid SQL query.' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Not found middleware
export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};
