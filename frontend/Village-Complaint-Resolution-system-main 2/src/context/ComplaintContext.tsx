import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Complaint, ComplaintUpdate, User, ComplaintStatus, Assignment } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

interface ComplaintContextType {
  complaints: Complaint[];
  loading: boolean;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status' | 'updates'>) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, message?: string) => void;
  assignComplaint: (complaintId: string, officerId: string, departmentId: string) => void;
  assignToResolvingOfficer: (complaintId: string, resolvingOfficerId: string) => Promise<void>;
  reassignComplaint: (complaintId: string, newOfficerId: string) => void;
  addComplaintUpdate: (complaintId: string, content: string, isPublic: boolean) => void;
  getUserComplaints: () => Complaint[];
  getOfficerComplaints: () => Complaint[];
  getDepartmentComplaints: (departmentId: string) => Complaint[];
  getDistrictComplaints: (district: string) => Complaint[];
  getBlockComplaints: (district: string, block: string) => Complaint[];
  getComplaintById: (id: string) => Complaint | undefined;
  getAssignedComplaints: () => Complaint[];
  getPendingAssignments: () => Assignment[];
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('assignments', []);
  const [loading, setLoading] = useState(true);
  
  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/complaints', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert backend data to frontend format
          const formattedComplaints = data.map((complaint: any) => ({
            id: complaint.ComplaintID.toString(),
            title: complaint.Description,
            description: complaint.Description,
            status: complaint.Status.toUpperCase() as ComplaintStatus,
            priority: complaint.PriorityLevel?.toLowerCase() || 'medium',
            location: complaint.LocationDescription || '',
            submittedAt: complaint.Timestamp,
            assignedAt: complaint.AssignmentTimestamp,
            submittedBy: complaint.PersonID.toString(),
            department: complaint.DepartmentName,
            assignedTo: complaint.ResolvingOfficerID?.toString(),
            updates: []
          }));
          
          setComplaints(formattedComplaints);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, []);
  
  const addComplaint = async (
    complaintData: Omit<Complaint, 'id' | 'submittedAt' | 'status' | 'updates'>
  ): Promise<void> => {
    if (!user) return;

    try {
      // Resolve DepartmentID from category → department name mapping
      const categoryToDepartmentName: Record<string, string> = {
        infrastructure: 'Public Works',
        sanitation: 'Sanitation',
        electricity: 'Electricity',
        water: 'Water Supply',
        education: 'Education',
        healthcare: 'Health',
        other: 'General Administration'
      };

      const targetDepartmentName = categoryToDepartmentName[(complaintData as any).category] || 'General Administration';

      let departmentId: number | undefined = undefined;
      try {
        const depRes = await fetch('/api/departments', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        if (depRes.ok) {
          const deps = await depRes.json();
          const match = deps.find((d: any) => (d.DepartmentName || '').toLowerCase() === targetDepartmentName.toLowerCase());
          if (match) departmentId = Number(match.DepartmentID);
        }
      } catch {}

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          PersonID: user.id,
          // Combine title and description so lists show meaningful text
          Description: complaintData.title
            ? `${complaintData.title}: ${complaintData.description}`
            : complaintData.description,
          PriorityLevel: (complaintData.priority || 'medium').toUpperCase(),
          LocationDescription: complaintData.location,
          DepartmentID: departmentId // if undefined, backend will fallback to default
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create complaint');
      }

      const result = await response.json();
      const createdId = (result.complaintId ?? result.id ?? generateId()).toString();

      const newComplaint: Complaint = {
        ...complaintData,
        id: createdId,
        status: 'NEW',
        submittedAt: new Date().toISOString(),
        submittedBy: user.id,
        // Align with backend mapping which uses Description for both title/description
        title: complaintData.title || complaintData.description,
        description: complaintData.description || complaintData.title || '',
        department: targetDepartmentName,
        updates: [],
      };

      setComplaints(prev => [...prev, newComplaint]);
    } catch (e) {
      alert('Failed to submit complaint. Please try again.');
    }
  };
  
  const updateComplaintStatus = async (id: string, status: ComplaintStatus, message?: string) => {
    if (!user) return;
    
    try {
      // Call backend API to update status
      const response = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: status,
          notes: message || `Status changed to ${status}`,
          officerId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update frontend state
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => {
          if (complaint.id === id) {
            const updates = [...complaint.updates];
            
            if (message) {
              updates.push({
                id: generateId(),
                complaintId: id,
                content: message,
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                isPublic: true
              });
            }
            
            return {
              ...complaint,
              status,
              ...(status === 'RESOLVED' && { resolvedAt: new Date().toISOString() }),
              updates
            };
          }
          return complaint;
        })
      );
    } catch (error) {
      alert('Failed to update status. Please try again.');
    }
  };
  
  const assignComplaint = (complaintId: string, officerId: string, departmentId: string) => {
    if (!user || !['admin', 'department_head'].includes(user.role)) return;
    
    const assignment: Assignment = {
      id: generateId(),
      complaintId,
      assignedTo: officerId,
      assignedBy: user.id,
      assignedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    setAssignments([...assignments, assignment]);
    
    setComplaints(prevComplaints =>
      prevComplaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            status: 'ASSIGNED',
            department: departmentId,
            assignedTo: officerId,
            assignedBy: user.id,
            assignedAt: new Date().toISOString()
          };
        }
        return complaint;
      })
    );
  };
  
  const reassignComplaint = (complaintId: string, newOfficerId: string) => {
    if (!user || !['admin', 'department_head'].includes(user.role)) return;
    
    setComplaints(prevComplaints =>
      prevComplaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            assignedTo: newOfficerId,
            assignedAt: new Date().toISOString()
          };
        }
        return complaint;
      })
    );
  };

  const assignToResolvingOfficer = async (complaintId: string, resolvingOfficerId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          AssigningOfficerID: user.id,
          ResolvingOfficerID: resolvingOfficerId
        })
      });
      if (!response.ok) {
        throw new Error('Failed to assign complaint');
      }
      setComplaints(prevComplaints => prevComplaints.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'ASSIGNED',
            assignedTo: resolvingOfficerId,
            assignedBy: user.id,
            assignedAt: new Date().toISOString()
          };
        }
        return c;
      }));
    } catch (e) {
      alert('Failed to assign complaint. Please try again.');
    }
  };
  
  const addComplaintUpdate = async (complaintId: string, content: string, isPublic: boolean) => {
    if (!user) return;
    
    try {
      // Call backend API to add update
      const response = await fetch(`/api/complaints/${complaintId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          content,
          isPublic,
          createdBy: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add update');
      }

      // Update frontend state
      const update: ComplaintUpdate = {
        id: generateId(),
        complaintId,
        content,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        isPublic
      };
      
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => {
          if (complaint.id === complaintId) {
            return {
              ...complaint,
              updates: [...complaint.updates, update]
            };
          }
          return complaint;
        })
      );
    } catch (error) {
      alert('Failed to add update. Please try again.');
    }
  };
  
  const getUserComplaints = () => {
    if (!user) return [];
    return complaints.filter(complaint => complaint.submittedBy === user.id);
  };
  
  const getOfficerComplaints = () => {
    if (!user) return [];
    
    // For officers, filter by assignment
    if (user.role === 'assigning_officer' || user.role === 'resolving_officer') {
      return complaints.filter(complaint => complaint.assignedTo === user.id);
    }
    
    // For other roles, use department filtering
    return complaints.filter(complaint => {
      switch (user.role) {
        case 'department_head':
          return complaint.department === user.department;
        case 'block_officer':
          return complaint.district === user.district && 
                 complaint.block === user.block;
        case 'district_officer':
          return complaint.district === user.district;
        case 'admin':
          return true;
        default:
          return false;
      }
    });
  };
  
  const getDepartmentComplaints = (departmentId: string) => {
    return complaints.filter(complaint => complaint.department === departmentId);
  };
  
  const getDistrictComplaints = (district: string) => {
    return complaints.filter(complaint => complaint.district === district);
  };
  
  const getBlockComplaints = (district: string, block: string) => {
    return complaints.filter(
      complaint => complaint.district === district && complaint.block === block
    );
  };
  
  const getComplaintById = (id: string) => {
    return complaints.find(complaint => complaint.id === id);
  };
  
  const getAssignedComplaints = () => {
    if (!user) return [];
    console.log('🔍 getAssignedComplaints Debug:');
    console.log('User ID:', user.id);
    console.log('All complaints:', complaints.map(c => ({ id: c.id, assignedTo: c.assignedTo, status: c.status })));
    const assigned = complaints.filter(complaint => complaint.assignedTo === user.id);
    console.log('Filtered assigned complaints:', assigned.length);
    return assigned;
  };
  
  const getPendingAssignments = () => {
    if (!user) return [];
    return assignments.filter(assignment => 
      assignment.status === 'pending' && 
      (assignment.assignedTo === user.id || assignment.assignedBy === user.id)
    );
  };
  
  return (
    <ComplaintContext.Provider 
      value={{ 
        complaints, 
        loading,
        addComplaint, 
        updateComplaintStatus, 
        assignComplaint, 
        assignToResolvingOfficer,
        reassignComplaint, 
        addComplaintUpdate, 
        getUserComplaints, 
        getOfficerComplaints, 
        getDepartmentComplaints, 
        getDistrictComplaints, 
        getBlockComplaints, 
        getComplaintById, 
        getAssignedComplaints, 
        getPendingAssignments 
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = (): ComplaintContextType => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};