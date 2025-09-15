import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary-50 border-t border-secondary-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-primary-600 font-bold text-xl">E Samadhan</span>
            </Link>
            <p className="text-secondary-800 text-sm">
              Empowering villages through digital complaint resolution and community engagement.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-600 hover:text-primary-600 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="text-secondary-600 hover:text-primary-600 text-sm">
                  Submit Complaint
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-secondary-600 hover:text-primary-600 text-sm">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-secondary-600 hover:text-primary-600 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary-600 hover:text-primary-600 text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-600 hover:text-primary-600 text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 tracking-wider uppercase mb-4">
              Language
            </h3>
            <select className="bg-white border border-secondary-200 text-secondary-800 py-1 px-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-secondary-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-secondary-600">
            &copy; {currentYear} E Samadhan. All rights reserved.
          </p>
          <div className="mt-3 sm:mt-0 flex items-center">
            <span className="text-sm text-secondary-600 flex items-center">
              Made with <Heart size={14} className="mx-1 text-red-500" /> for rural communities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;