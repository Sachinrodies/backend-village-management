import React, { useState } from 'react';
import { useNotices } from '../../context/NoticeContext';
import NoticeCard from './NoticeCard';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NoticeList: React.FC = () => {
  const { getActiveNotices, deleteNotice } = useNotices();
  const { isAdmin } = useAuth();
  const [category, setCategory] = useState<string>('all');
  
  const notices = getActiveNotices();
  
  const filteredNotices = category === 'all'
    ? notices
    : notices.filter(notice => notice.category === category);
  
  const handleDelete = (id: string) => {
    deleteNotice(id);
  };
  
  // Get all unique categories
  const categories = ['all', ...new Set(notices.map(notice => notice.category))];
  
  return (
    <div>
      {/* Category filter */}
      {notices.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  category === cat
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Notices */}
      {filteredNotices.length > 0 ? (
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <NoticeCard 
                notice={notice} 
                onDelete={isAdmin ? handleDelete : undefined} 
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notices found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {category !== 'all'
              ? `There are no notices in the "${category}" category.`
              : notices.length === 0
              ? 'There are currently no active notices.'
              : 'No notices match your current filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NoticeList;