import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Filter,
  UserCheck,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from 'date-fns';
import { getMockDepartments } from '../utils/helpers';

const DepartmentHeadDashboard: React.FC = () => {
  const { user, isDepartmentHead } = useAuth();
  const { complaints, assignComplaint } = useComplaints();
  const navigate = useNavigate();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  
  // Redirect if not department head
  React.useEffect(() => {
    if (!isDepartmentHead) {
      navigate('/');
    }
  }, [isDepartmentHead, navigate]);
  
  if (!isDepartmentHead || !user) {
    return null;
  }
  
  // Get department complaints
  const departmentComplaints = complaints.filter(
    c => c.department === user.department && 
        c.district === user.district && 
        c.block === user.block
  );
  
  // Get counts
  const pendingCount = departmentComplaints.filter(c => c.status === 'pending').length;
  const assignedCount = departmentComplaints.filter(c => c.status === 'assigned').length;
  const inProgressCount = departmentComplaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = departmentComplaints.filter(c => c.status === 'resolved').length;
  
  // Get resolution officers
  const resolutionOfficers = getMockDepartments()
    .find(d => d.id === user.department)
    ?.officers || [];
  
  // Filter complaints
  const filteredComplaints = departmentComplaints.filter(complaint => {
    if (selectedStatus !== 'all' && complaint.status !== selectedStatus) {
      return false;
    }
    if (selectedOfficer && complaint.resolutionOfficer !== selectedOfficer) {
      return false;
    }
    return true;
  });
  
  const handleAssign = async (complaintId: string, officerId: string) => {
    await assignComplaint(complaintId, officerId, user.department!);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Department Head Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage and assign complaints for {user.department} department in {user.block}, {user.district}
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="bg-warning-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Assignment</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{assignedCount}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-success-100 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Filters and Complaint List */}
      <Card>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                <option value="">All Officers</option>
                {resolutionOfficers.map(officer => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredComplaints.map(complaint => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDistance(new Date(complaint.submittedAt), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={
                    complaint.status === 'pending' ? 'warning' :
                    complaint.status === 'assigned' ? 'info' :
                    complaint.status === 'in-progress' ? 'primary' :
                    'success'
                  }>
                    {complaint.status}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Priority: {complaint.priority}</span>
                    <span>Location: {complaint.location}</span>
                  </div>
                  
                  {complaint.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <select
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        onChange={(e) => handleAssign(complaint.id, e.target.value)}
                      >
                        <option value="">Select Officer</option>
                        {resolutionOfficers.map(officer => (
                          <option key={officer.id} value={officer.id}>
                            {officer.name}
                          </option>
                        ))}
                      </select>
                      
                      <Button size="sm">
                        Assign
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                  >
                    <FileText size={16} className="mr-1" />
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {filteredComplaints.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No complaints match your current filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DepartmentHeadDashboard;