import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Filter,
  FileText,
  MessageSquare,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from 'date-fns';
import { ComplaintStatus } from '../types';

const ResolutionOfficerDashboard: React.FC = () => {
  const { user, isResolutionOfficer } = useAuth();
  const { complaints, getAssignedComplaints, updateComplaintStatus, addComplaintUpdate } = useComplaints();
  const navigate = useNavigate();
  
  // Helper function to safely format dates
  const formatDateSafely = (dateString: string | undefined, fallback: string) => {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return formatDistance(date, new Date(), { addSuffix: true });
  };
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [updateMessage, setUpdateMessage] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  
  // Redirect if not resolution officer
  React.useEffect(() => {
    if (!isResolutionOfficer) {
      navigate('/');
    }
  }, [isResolutionOfficer, navigate]);
  
  if (!isResolutionOfficer || !user) {
    return null;
  }
  
  const assignedComplaints = getAssignedComplaints();
  
  // Debug logging
  console.log('🔍 Resolving Officer Debug:');
  console.log('User:', user);
  console.log('isResolutionOfficer:', isResolutionOfficer);
  console.log('All complaints:', complaints.length);
  console.log('Assigned complaints:', assignedComplaints.length);
  console.log('User ID:', user?.id);
  
  // Get counts
  const assignedCount = assignedComplaints.filter(c => c.status === 'ASSIGNED' || c.status === 'NEW').length;
  const inProgressCount = assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = assignedComplaints.filter(c => c.status === 'RESOLVED').length;
  
  // Filter complaints
  const filteredComplaints = assignedComplaints.filter(complaint => 
    selectedStatus === 'all' || complaint.status === selectedStatus
  );
  
  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    await updateComplaintStatus(complaintId, newStatus);
  };
  
  const handleAddUpdate = async (complaintId: string) => {
    if (!updateMessage.trim()) return;
    
    await addComplaintUpdate(complaintId, updateMessage, true);
    setUpdateMessage('');
    setSelectedComplaint(null);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resolution Officer Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {user.name} - Manage and resolve assigned complaints
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-2">Your Role:</h3>
          <p className="text-sm text-gray-600">
            As a Resolution Officer, you can update complaint status, add progress updates, 
            and mark complaints as resolved. Use the action buttons below each complaint to manage them.
          </p>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
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
          <div className="flex items-center mb-6">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="NEW">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Complaints</h3>
                  <p className="text-gray-600">
                    {assignedComplaints.length === 0 
                      ? "You don't have any complaints assigned to you yet."
                      : "No complaints match the selected filter."
                    }
                  </p>
                </div>
              </div>
            ) : (
              filteredComplaints.map(complaint => (
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
                      {complaint.assignedAt ? 
                        `Assigned ${formatDateSafely(complaint.assignedAt, 'recently')}` :
                        `Submitted ${formatDateSafely(complaint.submittedAt, 'recently')}`
                      }
                    </p>
                  </div>
                  <Badge variant={
                    complaint.status === 'ASSIGNED' || complaint.status === 'NEW' ? 'info' :
                    complaint.status === 'IN_PROGRESS' ? 'primary' :
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
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {(complaint.status === 'ASSIGNED' || complaint.status === 'NEW') && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                      >
                        Start Resolution
                      </Button>
                    )}
                    
                    {complaint.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                      >
                        ✅ Mark Resolved
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setSelectedComplaint(complaint.id)}
                    >
                      <MessageSquare size={16} className="mr-1" />
                      📝 Add Update
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                    >
                      <FileText size={16} className="mr-1" />
                      👁️ View Details
                    </Button>
                  </div>
                </div>
                
                {selectedComplaint === complaint.id && (
                  <div className="mt-4 border-t pt-4">
                    <textarea
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Add an update about the resolution progress..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedComplaint(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddUpdate(complaint.id)}
                      >
                        Add Update
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResolutionOfficerDashboard;