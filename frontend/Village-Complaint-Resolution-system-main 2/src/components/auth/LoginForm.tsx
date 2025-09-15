import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { AlertCircle, CheckCircle, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationState {
  from?: string;
}

type LoginType = 'villager' | 'officer';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from || '/';
  
  const [loginType, setLoginType] = useState<LoginType>('villager');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate based on login type
    if (loginType === 'villager') {
      if (!phoneNumber || !firstName || !lastName) {
        setError('Please enter phone number, first name, and last name');
        return;
      }
    } else {
      if (!phoneNumber || !firstName || !lastName || !password) {
        setError('Please enter phone number, name, and password');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const endpoint = loginType === 'villager' ? '/api/auth/login' : '/api/auth/officer/login';
      const body = loginType === 'villager' 
        ? { phoneNumber, firstName, lastName }
        : { phoneNumber, firstName, lastName, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Login failed');
      }
      setIsSuccess(true);
      setTimeout(() => {
        login(data.user);
        const role = data.user?.role;
        if (role === 'assigning_officer' || role === 'department_head') {
          navigate('/department-head');
        } else if (role === 'resolving_officer') {
          navigate('/resolution-officer');
        } else {
          navigate(from);
        }
      }, 1200);
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.');
      console.error('Login error:', err);
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
        <h2 className="text-white text-xl font-semibold">Login to E Samadhan</h2>
        <p className="text-primary-100 text-sm mt-1">Choose your login type</p>
      </div>
      
      <div className="bg-white p-6">
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Login Successful</h3>
            <p className="mt-1 text-sm text-gray-500">Redirecting you to the dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-error-50 border-l-4 border-error-500 text-error-700 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {from !== '/' && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                <p className="text-sm">Please log in to continue.</p>
              </div>
            )}

            {/* Login Type Selector */}
            <div className="mb-6">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLoginType('villager')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    loginType === 'villager'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Villager
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('officer')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    loginType === 'officer'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-2" />
                  Officer
                </button>
              </div>
            </div>
            
            {/* Villager Login Fields */}
            {loginType === 'villager' && (
              <>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Officer Login Fields */}
            {loginType === 'officer' && (
              <>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Password field only for officers */}
            {loginType === 'officer' && (
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter your password"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-primary-600 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Log in
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              {loginType === 'villager' ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-600 hover:underline">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  Need help accessing your account?{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    Contact Administrator
                  </a>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default LoginForm;