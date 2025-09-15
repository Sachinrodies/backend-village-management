import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ComplaintList from '../components/complaints/ComplaintList';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationState {
  success?: boolean;
}

const ComplaintsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [showSuccess, setShowSuccess] = useState(!!state?.success);
  
  // Hide success message after 5 seconds
  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600 mt-1">View and manage your complaints</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Link to="/complaints/new">
            <Button>
              <Plus size={18} className="mr-1" />
              New Complaint
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-success-50 border-l-4 border-success-500 p-4 rounded">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-success-500 mr-3" />
                <div>
                  <p className="text-sm text-success-700">
                    Your complaint has been successfully submitted! We will review it shortly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Not authenticated message */}
      {!isAuthenticated && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-warning-500 mr-3" />
            <div>
              <p className="text-sm text-warning-700">
                Please log in to view your complaints or submit a new one.
              </p>
              <div className="mt-3">
                <Link to="/login" className="mr-4">
                  <Button size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Complaints list */}
      <ComplaintList />
    </div>
  );
};

export default ComplaintsPage;