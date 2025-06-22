import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { LocalStorageService, User } from '../services/localStorageService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Omit<User, 'password'> | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
  isAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(() => {
    const savedUser = localStorage.getItem('bankAppUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Inicializar datos por defecto al cargar la aplicación
  useEffect(() => {
    LocalStorageService.initializeData();
  }, []);

  const isAuthenticated = !!user;

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = LocalStorageService.getUsers();
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bankAppUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bankAppUser');
  };

  const isAdmin = (): boolean => {
    return user?.is_admin || false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};