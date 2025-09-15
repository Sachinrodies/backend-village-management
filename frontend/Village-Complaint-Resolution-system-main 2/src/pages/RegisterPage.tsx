import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-gray-600 mt-2">
          Join E Samadhan to submit complaints and access village services
        </p>
      </div>
      
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;