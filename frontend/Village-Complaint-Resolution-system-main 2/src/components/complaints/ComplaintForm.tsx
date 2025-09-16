import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { AlertCircle, Upload } from 'lucide-react';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { motion } from 'framer-motion';

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: 'infrastructure', label: 'Roads & Infrastructure' },
  { value: 'sanitation', label: 'Sanitation & Waste' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water Supply' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

const priorities: { value: ComplaintPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const ComplaintForm: React.FC = () => {
  const { addComplaint } = useComplaints();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure' as ComplaintCategory,
    priority: 'medium' as ComplaintPriority,
    location: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/complaints/new' } });
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await addComplaint({
        ...formData,
        attachments: [],
      });
      
      // Show success & redirect
      navigate('/complaints', { state: { success: true } });
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-custom overflow-hidden">
          <div className="bg-primary-500 px-6 py-4">
            <h2 className="text-white text-xl font-semibold">Submit New Complaint</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Complaint Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-error-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Brief title of your complaint"
              />
              {errors.title && (
                <p className="mt-1 text-error-500 text-sm flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.title}
                </p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border ${
                  errors.description ? 'border-error-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Please provide details about your complaint"
              />
              {errors.description && (
                <p className="mt-1 text-error-500 text-sm flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.description}
                </p>
              )}
            </div>
            
            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority*
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Specific Location*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.location ? 'border-error-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Where exactly is the issue located?"
              />
              {errors.location && (
                <p className="mt-1 text-error-500 text-sm flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.location}
                </p>
              )}
            </div>
            
            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">
                  Drag and drop files, or click to select files
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG up to 5MB each (maximum 3 files)
                </p>
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
              >
                Submit Complaint
              </Button>
            </div>
          </form>
        </div>
        
        {/* Help text */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your complaint will be reviewed by the local administrators. Please provide as much detail as possible 
                  to help us address your issue promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintForm;