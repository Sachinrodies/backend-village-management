import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ComplaintCard from '../components/complaints/ComplaintCard';
import { PieChart, Calendar, ListFilter, TrendingUp, UserCheck } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);
  
  if (!isAdmin || !user) {
    return null;
  }
  
  // Get counts for status
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inReviewCount = complaints.filter(c => c.status === 'in-review').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = complaints.filter(c => c.status === 'rejected').length;
  
  // Get counts for categories
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(complaint => {
    categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
  });
  
  // Filter complaints based on status
  const filteredComplaints = statusFilter === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === statusFilter);
  
  // Sort complaints by date (newest first) and then by status (pending first)
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    // First sort by status priority
    const statusPriority: Record<string, number> = {
      'pending': 0,
      'in-review': 1,
      'resolved': 2,
      'rejected': 3,
    };
    
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date (newest first)
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage village complaints and notices</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full mr-4">
              <ListFilter className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="bg-warning-100 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="bg-success-100 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Review</p>
              <p className="text-2xl font-bold text-gray-900">{inReviewCount}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Category Distribution */}
        <Card className="lg:col-span-1">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <PieChart className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Complaint Categories</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${(count / complaints.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="ml-4 min-w-[100px]">
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                    <span className="text-xs text-gray-500 ml-2">({count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Status Filter and Actions */}
        <Card className="lg:col-span-2">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Complaints</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={statusFilter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({complaints.length})
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({pendingCount})
              </Button>
              <Button 
                variant={statusFilter === 'in-review' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('in-review')}
              >
                In Review ({inReviewCount})
              </Button>
              <Button 
                variant={statusFilter === 'resolved' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('resolved')}
              >
                Resolved ({resolvedCount})
              </Button>
              <Button 
                variant={statusFilter === 'rejected' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected ({rejectedCount})
              </Button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {sortedComplaints.slice(0, 5).map(complaint => (
                <ComplaintCard 
                  key={complaint.id} 
                  complaint={complaint}
                />
              ))}
              
              {sortedComplaints.length > 5 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/complaints')}
                  >
                    View All Complaints
                  </Button>
                </div>
              )}
              
              {sortedComplaints.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No complaints match the selected filter.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Links */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => navigate('/announcements')}
              >
                Manage Announcements
              </Button>
              
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate('/complaints')}
              >
                View All Complaints
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Admin Info */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Information</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Admin:</span> {user.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Village:</span> {user.village}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;