import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { PublicNotice } from '../../types';
import { formatDate } from '../../utils/helpers';
import { motion } from 'framer-motion';

interface NoticeCardProps {
  notice: PublicNotice;
  onDelete?: (id: string) => void;
}

const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onDelete,
}) => {
  const {
    id,
    title,
    content,
    category,
    createdAt,
    isImportant,
  } = notice;
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border overflow-hidden shadow-sm ${
        isImportant
          ? 'border-accent-300 bg-accent-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="p-4">
        {isImportant && (
          <div className="flex items-center mb-2 text-accent-700 text-sm font-medium">
            <AlertTriangle size={16} className="mr-1" />
            <span>Important Notice</span>
          </div>
        )}
        
        <h3 className={`font-semibold text-lg ${isImportant ? 'text-accent-800' : 'text-gray-900'}`}>
          {title}
        </h3>
        
        <div className="mt-2 space-y-2">
          <p className={`text-sm ${isImportant ? 'text-accent-700' : 'text-gray-700'}`}>
            {content}
          </p>
          
          <div className="flex justify-between items-center pt-2 text-xs">
            <div className="flex items-center text-gray-500">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(createdAt)}</span>
            </div>
            
            <span className="text-gray-500 capitalize">{category}</span>
          </div>
        </div>
        
        {onDelete && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleDelete}
              className="text-xs text-error-600 hover:text-error-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoticeCard;