import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bell, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import NoticeList from '../components/notices/NoticeList';
import { motion } from 'framer-motion';
import villageHero from '../assets/village_img.jpg';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { getUserComplaints } = useComplaints();
  
  const userComplaints = isAuthenticated ? getUserComplaints() : [];
  const pendingComplaints = userComplaints.filter(c => c.status !== 'resolved').length;
  const resolvedComplaints = userComplaints.filter(c => c.status === 'resolved').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl overflow-hidden shadow-lg mb-10 relative"
      >
        <img
          src={villageHero}
          alt="Indian village landscape"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary-900/60" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Welcome to E Samadhan: Your Village Complaint Resolution System
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              A simple and effective way to submit and track complaints for better village governance and development.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/complaints/new">
                <Button size="lg">
                  Submit a Complaint
                </Button>
              </Link>
              <Link to="/announcements">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                  View Announcements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Stats section - Only for authenticated users */}
      {isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="bg-primary-100 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{userComplaints.length}</p>
                <p className="text-sm text-gray-500 mt-1">Total Complaints</p>
              </div>
            </Card>
            
            <Card className="bg-white">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="bg-warning-100 p-3 rounded-full mb-4">
                  <Bell className="h-6 w-6 text-warning-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingComplaints}</p>
                <p className="text-sm text-gray-500 mt-1">Pending Resolution</p>
              </div>
            </Card>
            
            <Card className="bg-white">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="bg-success-100 p-3 rounded-full mb-4">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{resolvedComplaints}</p>
                <p className="text-sm text-gray-500 mt-1">Resolved Issues</p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
      
      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How GramSeva Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-primary-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <span className="text-primary-700 font-bold text-xl">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Your Complaint</h3>
            <p className="text-gray-600">
              Easily submit your complaints through our user-friendly form. Provide details and select the appropriate category.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-primary-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <span className="text-primary-700 font-bold text-xl">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Get real-time status updates on your complaints. Stay informed as your issues move through the resolution process.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-primary-50 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
              <span className="text-primary-700 font-bold text-xl">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolution & Feedback</h3>
            <p className="text-gray-600">
              Once resolved, provide feedback on the resolution. Help improve the process for the entire community.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Latest Announcements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Announcements</h2>
          <Link to="/announcements" className="text-primary-600 hover:text-primary-800 flex items-center">
            <span className="mr-1">View all</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        
        <NoticeList />
      </motion.div>
      
      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-secondary-50 rounded-lg p-8 border border-secondary-100"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center p-2 bg-secondary-100 rounded-full mb-4">
            <TrendingUp size={24} className="text-secondary-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join the effort to improve our village
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Together we can make our village better by actively participating in the governance process. Submit your complaints and track their resolution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg">
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/complaints/new">
                <Button size="lg">
                  Submit a New Complaint
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;