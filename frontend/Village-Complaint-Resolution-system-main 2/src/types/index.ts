export type UserRole = 
  | 'villager' 
  | 'admin' 
  | 'district_officer' 
  | 'block_officer' 
  | 'department_head' 
  | 'assigning_officer'
  | 'resolving_officer';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  village?: string;
  district?: string;
  block?: string;
  department?: string;
  phoneNumber?: string;
  personId?: number;
  address?: string;
  occupation?: string;
  aadharNumber?: string;
}

export type ComplaintStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED';
export type ComplaintCategory = 'infrastructure' | 'sanitation' | 'electricity' | 'water' | 'education' | 'healthcare' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location: string;
  status: ComplaintStatus;
  district: string;
  block: string;
  department?: string;
  submittedBy: string; // User ID
  submittedAt: string;
  resolvedAt?: string;
  assignedTo?: string; // Officer ID
  assignedBy?: string; // Department Head ID
  assignedAt?: string;
  resolutionOfficer?: string; // Resolution Officer ID
  attachments?: string[];
  updates: ComplaintUpdate[];
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  content: string;
  createdBy: string; // User ID
  createdAt: string;
  isPublic: boolean;
}

export interface PublicNotice {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  expiresAt?: string;
  createdBy: string; // Admin/Officer ID
  isImportant: boolean;
  district?: string;
  block?: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  rating: number; // 1-5
  comments?: string;
  submittedBy: string; // User ID
  submittedAt: string;
}

export interface Department {
  id: string;
  name: string;
  head: string; // User ID
  district: string;
  block: string;
}

export interface Assignment {
  id: string;
  complaintId: string;
  assignedTo: string; // Officer ID
  assignedBy: string; // Department Head ID
  assignedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}