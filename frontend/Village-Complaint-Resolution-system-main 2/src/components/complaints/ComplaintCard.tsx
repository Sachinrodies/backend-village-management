import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Complaint } from '../../types';
import Badge from '../ui/Badge';
import { 
  formatDate, 
  getStatusColor, 
  getPriorityColor,
  getStatusText
} from '../../utils/helpers';
import { motion } from 'framer-motion';

interface ComplaintCardProps {
  complaint: Complaint;
  showActions?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  showActions = true,
}) => {
  const {
    id,
    title,
    description,
    category,
    priority,
    location,
    status,
    submittedAt,
  } = complaint;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden shadow-custom border border-secondary-100 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {title}
          </h3>
          <div className="flex space-x-2">
            <Badge 
              variant={
                status === 'pending' ? 'warning' : 
                status === 'in-review' ? 'info' :
                status === 'resolved' ? 'success' : 'error'
              }
            >
              {getStatusText(status)}
            </Badge>
            
            <Badge 
              variant={
                priority === 'low' ? 'primary' : 
                priority === 'medium' ? 'warning' :
                priority === 'high' ? 'error' : 'error'
              }
              className="capitalize"
            >
              {priority}
            </Badge>
          </div>
        </div>
        
        <p className="mt-3 text-gray-700 text-sm line-clamp-2">
          {description}
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(submittedAt)}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center">
            <span className="capitalize">{category}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{status === 'resolved' ? 'Resolved' : 'Pending resolution'}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="mt-4 flex justify-end">
            <Link
              to={`/complaints/${id}`}
              className="flex items-center text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors duration-150"
            >
              View details
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ComplaintCard;