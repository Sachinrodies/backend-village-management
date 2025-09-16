import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, FileText, Bell, User, LogOut, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import logoUrl from '../../assets/e-samadhan.svg';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin, isDepartmentHead, isResolutionOfficer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Navigation links based on user role
  const navigationLinks = [
    { title: 'Home', path: '/', icon: <Home size={18} /> },
    { title: 'Complaints', path: '/complaints', icon: <FileText size={18} /> },
    { title: 'Announcements', path: '/announcements', icon: <Bell size={18} /> },
    ...(isAdmin ? [{ title: 'Admin', path: '/admin', icon: <FileQuestion size={18} /> }] : []),
  ];
  
  // Check if the link is active
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logoUrl} alt="E Samadhan" className="h-10 w-auto" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePath(link.path)
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {link.icon}
                <span>{link.title}</span>
              </Link>
            ))}
            {(isDepartmentHead || isResolutionOfficer) && (
              <Link
                to="/officer"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePath('/officer')
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <span>Officer Dashboard</span>
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePath('/admin')
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>
          
          {/* User section or login/register */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-gray-500 text-xs">{user?.village} {isAdmin && '(Admin)'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100"
                  aria-label="Log out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-white"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-3 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isActivePath(link.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.title}</span>
                </Link>
              ))}
              {(isDepartmentHead || isResolutionOfficer) && (
                <Link
                  to="/officer"
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isActivePath('/officer')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Officer Dashboard</span>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isActivePath('/admin')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </nav>
            
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.name}</p>
                    <p className="text-gray-500 text-xs">{user?.village} {isAdmin && '(Admin)'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full p-2 text-left rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-3 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;