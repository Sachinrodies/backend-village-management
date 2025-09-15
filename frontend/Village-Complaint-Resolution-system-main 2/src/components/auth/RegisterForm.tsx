import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    PhoneNumber: '',
    Gender: '',
    DateOfBirth: '',
    Address: '',
    CensusVillageCode: '',
    Occupation: '',
    AadhaarNumber: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [villages, setVillages] = useState<Array<{ CensusVillageCode: string; VillageName: string }>>([]);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [villagesError, setVillagesError] = useState<string | null>(null);

  useEffect(() => {
    const loadVillages = async () => {
      try {
        setVillagesLoading(true);
        setVillagesError(null);
        const res = await fetch('/api/villages?limit=1000');
        if (!res.ok) throw new Error('Failed to load villages');
        const data = await res.json();
        setVillages(data || []);
      } catch (e) {
        setVillagesError((e as Error).message);
      } finally {
        setVillagesLoading(false);
      }
    };
    loadVillages();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    if (!formData.FirstName.trim()) newErrors.FirstName = 'First name is required';
    if (!formData.LastName.trim()) newErrors.LastName = 'Last name is required';
    if (!formData.PhoneNumber.trim()) newErrors.PhoneNumber = 'Phone number is required';
    if (formData.PhoneNumber && !/^[6-9]\d{9}$/.test(formData.PhoneNumber)) newErrors.PhoneNumber = 'Enter valid 10-digit Indian mobile number';
    if (!formData.Gender) newErrors.Gender = 'Gender is required';
    if (!formData.DateOfBirth) {
      newErrors.DateOfBirth = 'Date of birth is required';
    } else {
      // Expect YYYY-MM-DD
      const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(formData.DateOfBirth);
      if (!dobOk) newErrors.DateOfBirth = 'Use format YYYY-MM-DD';
    }
    if (!formData.CensusVillageCode) newErrors.CensusVillageCode = 'Village is required';
    // Password validation removed - villagers don't need passwords
    if (formData.AadhaarNumber && !/^\d{12}$/.test(formData.AadhaarNumber)) newErrors.AadhaarNumber = 'Enter valid 12-digit Aadhaar number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      // Map gender values to database format
      const submitData = {
        ...formData,
        Gender: formData.Gender === 'Male' ? 'M' : formData.Gender === 'Female' ? 'F' : 'O'
      };
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Registration failed');
      }
      setIsSuccess(true);
      setTimeout(() => {
        login(data.user);
        navigate('/');
      }, 1200);
      
    } catch (error) {
      setErrors({ form: (error as Error).message || 'Registration failed. Please try again later.' });
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto rounded-lg shadow-custom overflow-hidden"
    >
      <div className="bg-primary-500 px-6 py-4">
        <h2 className="text-white text-xl font-semibold">Create an Account</h2>
      </div>
      
      <div className="bg-white p-6">
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Registration Successful</h3>
            <p className="mt-1 text-sm text-gray-500">Your account has been created. Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <div className="mb-4 p-3 bg-error-50 border-l-4 border-error-500 text-error-700 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{errors.form}</span>
                </div>
              </div>
            )}
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.FirstName ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="Enter your first name"
                />
                {errors.FirstName && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.FirstName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="LastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.LastName ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="Enter your last name"
                />
                {errors.LastName && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.LastName}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="Gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender*
                </label>
                <select
                  id="Gender"
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.Gender ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.Gender && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.Gender}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="DateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  id="DateOfBirth"
                  name="DateOfBirth"
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.DateOfBirth ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {errors.DateOfBirth && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.DateOfBirth}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                id="PhoneNumber"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.PhoneNumber ? 'border-error-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="10-digit mobile number"
              />
              {errors.PhoneNumber && (
                <p className="mt-1 text-error-500 text-sm flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.PhoneNumber}
                </p>
              )}
            </div>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="CensusVillageCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Village*
                </label>
                <select
                  id="CensusVillageCode"
                  name="CensusVillageCode"
                  value={formData.CensusVillageCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.CensusVillageCode ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">{villagesLoading ? 'Loading villages...' : 'Select your village'}</option>
                  {villages.map(v => (
                    <option key={v.CensusVillageCode} value={v.CensusVillageCode}>
                      {v.VillageName} ({v.CensusVillageCode})
                    </option>
                  ))}
                </select>
                {villagesError && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {villagesError}
                  </p>
                )}
                {errors.CensusVillageCode && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.CensusVillageCode}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="Occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  id="Occupation"
                  name="Occupation"
                  value={formData.Occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Your occupation"
                />
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="AadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  id="AadhaarNumber"
                  name="AadhaarNumber"
                  value={formData.AadhaarNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.AadhaarNumber ? 'border-error-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="12-digit Aadhaar (optional)"
                />
                {errors.AadhaarNumber && (
                  <p className="mt-1 text-error-500 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.AadhaarNumber}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="Address"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Your address (optional)"
                />
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password field removed - villagers don't need passwords */}
              {/* Confirm Password field removed - villagers don't need passwords */}
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default RegisterForm;