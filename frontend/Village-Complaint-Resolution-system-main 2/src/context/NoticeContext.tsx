import React, { createContext, useContext, ReactNode } from 'react';
import { PublicNotice } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

interface NoticeContextType {
  notices: PublicNotice[];
  addNotice: (notice: Omit<PublicNotice, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteNotice: (id: string) => void;
  getActiveNotices: () => PublicNotice[];
}

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

export const NoticeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notices, setNotices] = useLocalStorage<PublicNotice[]>('notices', []);
  
  const addNotice = (noticeData: Omit<PublicNotice, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user || user.role !== 'admin') return;
    
    const newNotice: PublicNotice = {
      ...noticeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    setNotices([...notices, newNotice]);
  };
  
  const deleteNotice = (id: string) => {
    if (!user || user.role !== 'admin') return;
    setNotices(notices.filter(notice => notice.id !== id));
  };
  
  const getActiveNotices = () => {
    const now = new Date().toISOString();
    return notices.filter(notice => !notice.expiresAt || notice.expiresAt > now);
  };
  
  return (
    <NoticeContext.Provider 
      value={{ 
        notices, 
        addNotice, 
        deleteNotice,
        getActiveNotices
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotices = (): NoticeContextType => {
  const context = useContext(NoticeContext);
  if (context === undefined) {
    throw new Error('useNotices must be used within a NoticeProvider');
  }
  return context;
};