import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const USERS: Record<Role, User> = {
  PATIENT: { id: 'u_patient', name: 'Alex Patient', role: 'PATIENT', phone: '555-1001' },
  DRIVER: { id: 'd1', name: 'John Smith', role: 'DRIVER', phone: '555-0201' }, // Matches demo ambulance d1
  DISPATCHER: { id: 'u_dispatch', name: 'Central Dispatch', role: 'DISPATCHER' },
  HOSPITAL: { id: 'h1', name: 'City General Admin', role: 'HOSPITAL' },
  ADMIN: { id: 'u_admin', name: 'System Admin', role: 'ADMIN' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('el_current_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const login = (role: Role) => {
    const u = USERS[role];
    setUser(u);
    localStorage.setItem('el_current_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('el_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
