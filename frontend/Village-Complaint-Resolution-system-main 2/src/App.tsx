import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { NoticeProvider } from './context/NoticeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ComplaintsPage from './pages/ComplaintsPage';
import NewComplaintPage from './pages/NewComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OfficerDashboard from './pages/OfficerDashboard';
import DepartmentHeadDashboard from './pages/DepartmentHeadDashboard';
import ResolutionOfficerDashboard from './pages/ResolutionOfficerDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ComplaintProvider>
          <NoticeProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/complaints" element={<ComplaintsPage />} />
                  <Route path="/complaints/new" element={<NewComplaintPage />} />
                  <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
                  <Route path="/announcements" element={<AnnouncementsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/officer" element={<OfficerDashboard />} />
                  <Route path="/department-head" element={<DepartmentHeadDashboard />} />
                  <Route path="/resolution-officer" element={<ResolutionOfficerDashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NoticeProvider>
        </ComplaintProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;