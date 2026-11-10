import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffRole, AuthUser } from '../types/complaint';

export interface PredefinedPersona {
  role: StaffRole;
  name: string;
  email: string;
  department: string;
  staffId: string;
  shift: string;
  description: string;
}

export const DEMO_PERSONAS: Record<StaffRole, PredefinedPersona> = {
  'Ward Staff': {
    role: 'Ward Staff',
    name: 'Ramesh K.',
    email: 'ramesh.k@voicecare.hospital',
    department: 'Sanitation & Maintenance',
    staffId: 'STF-8492',
    shift: 'Morning Shift (08:00 - 16:00)',
    description: 'Ward Operations & Sanitation Officer. Directly tasked with on-the-ground grievance resolution in Ward 3B, ICU, and Emergency Triage.',
  },
  'Department Head': {
    role: 'Department Head',
    name: 'Priya Nair',
    email: 'priya.nair@voicecare.hospital',
    department: 'Sanitation & Maintenance',
    staffId: 'DHD-2041',
    shift: 'Duty Operations (08:30 - 17:30)',
    description: 'Head of Sanitation & Maintenance. Supervises team workload, unassigned tickets queue, and department-specific proof-of-work reviews.',
  },
  'Hospital Administrator': {
    role: 'Hospital Administrator',
    name: 'Dr. Rajesh Varma',
    email: 'rajesh.varma@voicecare.hospital',
    department: 'Executive Administration & Quality Assurance',
    staffId: 'ADM-1001',
    shift: 'Executive On-Call (24/7)',
    description: 'Medical Superintendent & Quality Director. Global hospital access across all 5 departments, escalation queue, and central human review authority.',
  },
};

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: StaffRole, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: StaffRole) => void;
}

const STORAGE_KEY = 'voicecare_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as AuthUser;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.error('Failed to save session', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (role: StaffRole, email: string, _password?: string): Promise<boolean> => {
    // Simulated network/auth delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const persona = DEMO_PERSONAS[role];
    const user: AuthUser = {
      name: email.toLowerCase() === persona.email.toLowerCase() ? persona.name : (email.split('@')[0] || persona.name),
      email: email.trim(),
      role,
      department: persona.department,
      staffId: persona.staffId,
      shift: persona.shift,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: StaffRole) => {
    const persona = DEMO_PERSONAS[role];
    const updatedUser: AuthUser = {
      name: persona.name,
      email: persona.email,
      role,
      department: persona.department,
      staffId: persona.staffId,
      shift: persona.shift,
      loggedInAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
