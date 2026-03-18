import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUserFromDB, registerUserInDB, getUserByIdFromDB } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean; 
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string, role: 'user' | 'publisher') => Promise<boolean>;
  logout: () => void;
  authError: string | null;
  loadingSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore Session on App Load
  useEffect(() => {
    const restoreSession = async () => {
      const storedUserId = localStorage.getItem('arbnoor_session_uid');
      if (storedUserId) {
        try {
          const dbUser = await getUserByIdFromDB(storedUserId);
          if (dbUser) {
            setUser(dbUser);
          } else {
            // Invalid session ID in local storage
            localStorage.removeItem('arbnoor_session_uid');
            setUser(null);
          }
        } catch (e) {
          console.error("Session restore failed", e);
          localStorage.removeItem('arbnoor_session_uid');
          setUser(null);
        }
      } else {
        // No session found
        setUser(null);
      }
      setLoadingSession(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const dbUser = await getUserFromDB(email);
      
      if (!dbUser) {
        setAuthError("Account not found.");
        return false;
      }

      if (dbUser.password !== pass) {
        setAuthError("Incorrect password.");
        return false;
      }

      // Success
      setUser(dbUser);
      localStorage.setItem('arbnoor_session_uid', dbUser.id);
      return true;

    } catch (e) {
      console.error(e);
      setAuthError("Login failed due to database error.");
      return false;
    }
  };

  const signup = async (email: string, pass: string, name: string, role: 'user' | 'publisher'): Promise<boolean> => {
    setAuthError(null);
    try {
      const newUser: User = {
        id: crypto.randomUUID(), // Unique ID
        email,
        password: pass,
        name: name || (role === 'publisher' ? 'Publisher' : 'Listener'),
        role: role,
        createdAt: Date.now()
      };

      await registerUserInDB(newUser);
      
      // Auto Login
      setUser(newUser);
      localStorage.setItem('arbnoor_session_uid', newUser.id);
      return true;

    } catch (e: any) {
      if (e.message === "Email already registered") {
        setAuthError("An account with this email already exists.");
      } else {
        setAuthError("Registration failed. Please try again.");
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('arbnoor_session_uid');
    setUser(null);
  };

  const isAdmin = user?.role === 'publisher';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, authError, loadingSession }}>
      {children}
    </AuthContext.Provider>
  );
};