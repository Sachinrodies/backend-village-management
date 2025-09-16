import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { canManageComplaint, canAssignComplaints, canViewDistrictData, canViewBlockData } from '../utils/helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDistrictOfficer: boolean;
  isBlockOfficer: boolean;
  isDepartmentHead: boolean;
  isResolutionOfficer: boolean;
  canManageComplaint: (complaint: any) => boolean;
  canAssignComplaints: boolean;
  canViewDistrictData: boolean;
  canViewBlockData: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [token, setToken] = useLocalStorage<string | null>('token', null);
  
  const login = (userData: User, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
  };
  
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isDistrictOfficer = isAuthenticated && user?.role === 'district_officer';
  const isBlockOfficer = isAuthenticated && user?.role === 'block_officer';
  const isDepartmentHead = isAuthenticated && (user?.role === 'department_head' || user?.role === 'assigning_officer');
  const isResolutionOfficer = isAuthenticated && user?.role === 'resolving_officer';
  
  return (
    <AuthContext.Provider 
      value={{ 
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isDistrictOfficer,
        isBlockOfficer,
        isDepartmentHead,
        isResolutionOfficer,
        canManageComplaint: (complaint) => canManageComplaint(user!, complaint),
        canAssignComplaints: canAssignComplaints(user!),
        canViewDistrictData: canViewDistrictData(user!),
        canViewBlockData: canViewBlockData(user!)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};