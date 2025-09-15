// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format date to readable string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format time to readable string
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status color based on complaint status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-warning-100 text-warning-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    case 'in-review':
      return 'bg-accent-100 text-accent-800';
    case 'in-progress':
      return 'bg-primary-100 text-primary-800';
    case 'resolved':
      return 'bg-success-100 text-success-800';
    case 'rejected':
      return 'bg-error-100 text-error-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get priority color based on complaint priority
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get status text based on complaint status
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'assigned':
      return 'Assigned';
    case 'in-review':
      return 'In Review';
    case 'in-progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

// Generate mock users for demo
export const generateMockUsers = () => {
  return [
    {
      id: '1',
      name: 'Raj Patel',
      email: 'raj@example.com',
      role: 'admin',
      village: 'Sundarpur'
    },
    {
      id: '2',
      name: 'Meera Singh',
      email: 'meera@example.com',
      role: 'villager',
      village: 'Sundarpur'
    },
    {
      id: '3',
      name: 'Dr. Sharma',
      email: 'sharma@example.com',
      role: 'district_officer',
      district: 'East District'
    },
    {
      id: '4',
      name: 'Mr. Kumar',
      email: 'kumar@example.com',
      role: 'block_officer',
      district: 'East District',
      block: 'Block A'
    },
    {
      id: '5',
      name: 'Mrs. Gupta',
      email: 'gupta@example.com',
      role: 'department_head',
      district: 'East District',
      block: 'Block A',
      department: 'Water Resources'
    },
    {
      id: '6',
      name: 'Mr. Verma',
      email: 'verma@example.com',
      role: 'resolving_officer',
      district: 'East District',
      block: 'Block A',
      department: 'Water Resources'
    }
  ];
};

// Get role display name
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'district_officer':
      return 'District Officer';
    case 'block_officer':
      return 'Block Officer';
    case 'department_head':
      return 'Department Head';
    case 'resolving_officer':
      return 'Resolution Officer';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

// Check if user has permission to manage complaint
export const canManageComplaint = (user: User, complaint: Complaint): boolean => {
  if (!user) return false;

  switch (user.role) {
    case 'admin':
      return true;
    case 'district_officer':
      return user.district === complaint.district;
    case 'block_officer':
      return user.district === complaint.district && user.block === complaint.block;
    case 'department_head':
      return complaint.department === user.department &&
             user.district === complaint.district &&
             user.block === complaint.block;
    case 'resolving_officer':
      return complaint.resolutionOfficer === user.id;
    default:
      return false;
  }
};

// Check if user can assign complaints
export const canAssignComplaints = (user: User): boolean => {
  return user?.role === 'department_head' || user?.role === 'admin';
};

// Check if user can view district level data
export const canViewDistrictData = (user: User): boolean => {
  return ['admin', 'district_officer'].includes(user?.role || '');
};

// Check if user can view block level data
export const canViewBlockData = (user: User): boolean => {
  return ['admin', 'district_officer', 'block_officer'].includes(user?.role || '');
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get mock departments
export const getMockDepartments = (): Department[] => {
  return [
    {
      id: '1',
      name: 'Water Resources',
      head: '5', // Mrs. Gupta's ID
      district: 'East District',
      block: 'Block A'
    },
    {
      id: '2',
      name: 'Public Works',
      head: '7',
      district: 'East District',
      block: 'Block A'
    },
    {
      id: '3',
      name: 'Education',
      head: '8',
      district: 'East District',
      block: 'Block A'
    },
    {
      id: '4',
      name: 'Healthcare',
      head: '9',
      district: 'East District',
      block: 'Block A'
    }
  ];
};