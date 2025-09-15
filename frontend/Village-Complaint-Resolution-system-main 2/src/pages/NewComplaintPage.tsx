import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ComplaintForm from '../components/complaints/ComplaintForm';

const NewComplaintPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/complaints" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} className="mr-1" />
          Back to complaints
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a New Complaint</h1>
        <p className="text-gray-600 mt-1">
          Fill out the form below to submit your complaint to the village administration.
        </p>
      </div>
      
      <ComplaintForm />
    </div>
  );
};

export default NewComplaintPage;