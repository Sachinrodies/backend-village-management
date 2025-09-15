import React, { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import NoticeList from '../components/notices/NoticeList';
import NoticeForm from '../components/notices/NoticeForm';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  const toggleForm = () => {
    setShowForm(prev => !prev);
  };
  
  const handleFormSuccess = () => {
    setShowForm(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell size={24} className="mr-2 text-primary-500" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with important village announcements</p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <Button onClick={toggleForm}>
              <Plus size={18} className="mr-1" />
              {showForm ? 'Cancel' : 'New Announcement'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Admin notice form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <NoticeForm onSuccess={handleFormSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notices list */}
      <NoticeList />
    </div>
  );
};

export default AnnouncementsPage;