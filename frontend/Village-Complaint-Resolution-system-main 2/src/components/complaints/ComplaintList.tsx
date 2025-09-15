import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import ComplaintCard from './ComplaintCard';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../../types';
import { motion } from 'framer-motion';

interface FilterOptions {
  status: ComplaintStatus | 'all';
  category: ComplaintCategory | 'all';
  priority: ComplaintPriority | 'all';
  searchTerm: string;
}

const ComplaintList: React.FC = () => {
  const { complaints, getUserComplaints } = useComplaints();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchTerm: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Get complaints based on user role
  const userComplaints = isAuthenticated 
    ? (isAdmin ? complaints : getUserComplaints())
    : [];
  
  // Apply filters
  const filteredComplaints = userComplaints.filter(complaint => {
    // Status filter
    if (filters.status !== 'all' && complaint.status !== filters.status) {
      return false;
    }
    
    // Category filter
    if (filters.category !== 'all' && complaint.category !== filters.category) {
      return false;
    }
    
    // Priority filter
    if (filters.priority !== 'all' && complaint.priority !== filters.priority) {
      return false;
    }
    
    // Search term
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(searchTermLower) ||
        complaint.description.toLowerCase().includes(searchTermLower) ||
        complaint.location.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });
  
  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="mt-4">
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search complaints..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          
          {/* Filter toggle */}
          <button
            onClick={toggleFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-800 rounded-lg hover:bg-secondary-200 transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {/* Category filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Priority filter */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Complaints list */}
      {filteredComplaints.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredComplaints.map((complaint) => (
            <motion.div key={complaint.id} variants={itemVariants}>
              <ComplaintCard complaint={complaint} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.searchTerm || filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all'
              ? 'No complaints match your current filters. Try adjusting your search criteria.'
              : isAuthenticated 
                ? 'You have not submitted any complaints yet.'
                : 'Please log in to view your complaints.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;