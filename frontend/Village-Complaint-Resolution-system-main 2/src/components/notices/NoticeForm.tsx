import React, { useState } from 'react';
import { useNotices } from '../../context/NoticeContext';
import Button from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface NoticeFormProps {
  onSuccess?: () => void;
}

const NoticeForm: React.FC<NoticeFormProps> = ({ onSuccess }) => {
  const { addNotice } = useNotices();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isImportant: false,
    expiresAt: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
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
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotice({
        ...formData,
        expiresAt: formData.expiresAt || undefined,
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        isImportant: false,
        expiresAt: '',
      });
      
      // Callback on success
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error adding notice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-custom p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Announcement</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
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
            placeholder="Announcement title"
          />
          {errors.title && (
            <p className="mt-1 text-error-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.title}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border ${
              errors.content ? 'border-error-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
            placeholder="Announcement details"
          />
          {errors.content && (
            <p className="mt-1 text-error-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.content}
            </p>
          )}
        </div>
        
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
              <option value="general">General</option>
              <option value="meeting">Meeting</option>
              <option value="development">Development</option>
              <option value="emergency">Emergency</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="election">Election</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isImportant"
              name="isImportant"
              checked={formData.isImportant}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-700">
              Mark as important announcement
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Publish Announcement
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoticeForm;