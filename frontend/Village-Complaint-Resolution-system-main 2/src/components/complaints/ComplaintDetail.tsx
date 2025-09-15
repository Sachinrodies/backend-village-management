import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import FeedbackForm from './FeedbackForm';
import { 
  Calendar, 
  MapPin, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  AlertTriangle,
  User,
  Star
} from 'lucide-react';
import { 
  formatDate, 
  formatTime, 
  getStatusColor, 
  getStatusText 
} from '../../utils/helpers';
import { ComplaintStatus } from '../../types';
import { motion } from 'framer-motion';

const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById, updateComplaintStatus, addComplaintUpdate } = useComplaints();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const complaint = getComplaintById(id || '');
  
  const [updateMessage, setUpdateMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState<{rating: number, comments: string}[]>([]);
  
  if (!complaint) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-error-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Complaint not found</h3>
        <p className="mt-1 text-gray-500">
          The complaint you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate('/complaints')}
        >
          Back to complaints
        </Button>
      </div>
    );
  }
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handleStatusChange = (newStatus: ComplaintStatus) => {
    if (!isAdmin) return;
    
    updateComplaintStatus(complaint.id, newStatus, `Status changed to ${getStatusText(newStatus)}`);
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      addComplaintUpdate(complaint.id, updateMessage, isPublic);
      setUpdateMessage('');
    } catch (error) {
      console.error('Error adding update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = (rating: number, comments: string) => {
    // Add feedback to local state (in real app, this would call API)
    setFeedback([...feedback, { rating, comments }]);
    setShowFeedbackForm(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <button
        onClick={handleBackClick}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to complaints</span>
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Main complaint card */}
          <Card className="mb-6">
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
              <Badge 
                variant={
                  complaint.status === 'pending' ? 'warning' : 
                  complaint.status === 'in-review' ? 'info' :
                  complaint.status === 'resolved' ? 'success' : 'error'
                }
                size="lg"
              >
                {getStatusText(complaint.status)}
              </Badge>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-gray-800 capitalize">{complaint.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <p className="text-gray-800 capitalize">{complaint.priority}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <div className="flex items-center text-gray-800">
                  <MapPin size={16} className="mr-1 text-gray-500" />
                  <span>{complaint.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submitted On</h3>
                <div className="flex items-center text-gray-800">
                  <Calendar size={16} className="mr-1 text-gray-500" />
                  <span>{formatDate(complaint.submittedAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Admin actions */}
            {isAdmin && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Admin Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={complaint.status === 'in-review' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange('in-review')}
                    disabled={complaint.status === 'in-review'}
                  >
                    <Clock size={16} className="mr-1" />
                    Mark In Review
                  </Button>
                  <Button 
                    variant={complaint.status === 'resolved' ? 'success' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange('resolved')}
                    disabled={complaint.status === 'resolved'}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Mark Resolved
                  </Button>
                  <Button 
                    variant={complaint.status === 'rejected' ? 'danger' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={complaint.status === 'rejected'}
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
            
            {/* Updates section */}
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MessageCircle size={18} className="mr-2" />
                Updates and Comments
              </h2>
              
              {complaint.updates.length > 0 ? (
                <div className="space-y-4">
                  {complaint.updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-primary-200 pl-4 py-1">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-700">{update.content}</p>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User size={12} className="mr-1" />
                        <span className="mr-2">{update.createdBy === user?.id ? 'You' : 'Admin'}</span>
                        <span>{formatDate(update.createdAt)} at {formatTime(update.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic py-2">No updates yet.</p>
              )}
              
              {/* Add update form */}
              <form onSubmit={handleUpdateSubmit} className="mt-6">
                <div className="mb-3">
                  <label htmlFor="updateMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Add an update or comment
                  </label>
                  <textarea
                    id="updateMessage"
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter your update or comment..."
                  />
                </div>
                
                {isAdmin && (
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Make this update visible to all
                    </label>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!updateMessage.trim()}
                  >
                    Add Update
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Status timeline */}
          <Card className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Complaint Timeline</h2>
            
            <div className="relative pb-6">
              <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
              
              <div className="relative pl-10 mb-6">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">1</span>
                </div>
                <h3 className="text-sm font-medium text-gray-800">Complaint Submitted</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDate(complaint.submittedAt)}</p>
                <p className="text-sm text-gray-600 mt-1">Your complaint has been received and is awaiting review.</p>
              </div>
              
              {(complaint.status === 'in-review' || complaint.status === 'resolved' || complaint.status === 'rejected') && (
                <div className="relative pl-10 mb-6">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                    <span className="text-accent-600 font-medium text-sm">2</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800">Under Review</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {complaint.updates.find(u => u.content.includes('Status changed to In Review'))?.createdAt
                      ? formatDate(complaint.updates.find(u => u.content.includes('Status changed to In Review'))?.createdAt || '')
                      : 'Date not available'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Your complaint is being reviewed by our team.</p>
                </div>
              )}
              
              {(complaint.status === 'resolved' || complaint.status === 'rejected') && (
                <div className="relative pl-10">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                    <span className="text-success-600 font-medium text-sm">3</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {complaint.status === 'resolved' ? 'Resolved' : 'Rejected'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {complaint.resolvedAt ? formatDate(complaint.resolvedAt) : 'Date not available'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {complaint.status === 'resolved' 
                      ? 'Your complaint has been successfully resolved.' 
                      : 'Your complaint could not be processed. See comments for details.'}
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Help info */}
          <Card variant="bordered">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Need More Help?</h2>
            <p className="text-gray-600 text-sm mb-4">
              If you have questions about this complaint or need additional assistance, please contact your local administrator.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
              <p className="text-sm text-gray-600 mt-1">Email: admin@gramseva.org</p>
              <p className="text-sm text-gray-600">Phone: +91 9876543210</p>
            </div>
          </Card>

          {/* Feedback Section */}
          {complaint.status === 'resolved' && (
            <Card className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Feedback
                </h2>
                {!showFeedbackForm && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    Add Feedback
                  </Button>
                )}
              </div>
              
              {showFeedbackForm ? (
                <FeedbackForm
                  complaintId={complaint.id}
                  onSubmit={handleFeedbackSubmit}
                  onCancel={() => setShowFeedbackForm(false)}
                />
              ) : (
                <div>
                  {feedback.length > 0 ? (
                    <div className="space-y-3">
                      {feedback.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < item.rating ? 'fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {item.rating}/5
                            </span>
                          </div>
                          {item.comments && (
                            <p className="text-sm text-gray-700">{item.comments}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No feedback submitted yet.</p>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintDetail;