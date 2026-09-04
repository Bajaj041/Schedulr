import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/localStorage';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => void;
  loginWithGoogle: (email?: string, name?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleGoogleSync: (connected: boolean, email?: string) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage on mount
  const [user, setUser] = useState<User>(() => {
    StorageService.initializeSeedData();
    return StorageService.getUser();
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return StorageService.getAuth();
  });

  useEffect(() => {
    StorageService.initializeSeedData();
    setUser(StorageService.getUser());
    setIsAuthenticated(StorageService.getAuth());
  }, []);

  const login = (email: string, password?: string) => {
    const res = userService.login(email, password);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = (email?: string, name?: string) => {
    const updated = userService.loginWithGoogle(email, name);
    setUser(updated);
    setIsAuthenticated(true);
  };

  const logout = () => {
    userService.logout();
    setIsAuthenticated(false);
  };

  const updateUser = (updates: Partial<User>) => {
    const updated = userService.updateCurrentUser(updates);
    setUser(updated);
  };

  const toggleGoogleSync = (connected: boolean, email?: string) => {
    const updated = userService.toggleGoogleSync(connected, email);
    setUser(updated);
  };

  const resetDemoData = () => {
    StorageService.resetDemoData();
    setUser(StorageService.getUser());
    setIsAuthenticated(StorageService.getAuth());
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        toggleGoogleSync,
        resetDemoData,
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
