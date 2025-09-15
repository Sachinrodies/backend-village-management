import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Complaint, ComplaintUpdate, User, ComplaintStatus, Assignment } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

interface ComplaintContextType {
  complaints: Complaint[];
  loading: boolean;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status' | 'updates'>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, message?: string) => void;
  assignComplaint: (complaintId: string, officerId: string, departmentId: string) => void;
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
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('assignments', []);
  const [loading, setLoading] = useState(true);
  
  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/complaints');
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert backend data to frontend format
          const formattedComplaints = data.map((complaint: any) => ({
            id: complaint.ComplaintID.toString(),
            title: complaint.Description,
            description: complaint.Description,
            status: complaint.Status.toUpperCase(),
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
  
  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'submittedAt' | 'status' | 'updates'>) => {
    if (!user) return;
    
    const newComplaint: Complaint = {
      ...complaintData,
      id: generateId(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: user.id,
      updates: [],
    };
    
    setComplaints([...complaints, newComplaint]);
  };
  
  const updateComplaintStatus = async (id: string, status: ComplaintStatus, message?: string) => {
    if (!user) return;
    
    try {
      // Call backend API to update status
      const response = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
              ...(status === 'resolved' && { resolvedAt: new Date().toISOString() }),
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
            status: 'assigned',
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
  
  const addComplaintUpdate = async (complaintId: string, content: string, isPublic: boolean) => {
    if (!user) return;
    
    try {
      // Call backend API to add update
      const response = await fetch(`/api/complaints/${complaintId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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