/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, saveApi, User, getToken, setToken, clearToken, checkServerHealth } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverOnline: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  syncToCloud: (gameState: any) => Promise<boolean>;
  loadFromCloud: () => Promise<any | null>;
  getCloudSaveInfo: () => Promise<{ hasSave: boolean; savedAt?: string } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check server health periodically
  useEffect(() => {
    const checkHealth = async () => {
      const online = await checkServerHealth();
      setServerOnline(online);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const result = await authApi.getCurrentUser();
      if (result.data) {
        setUser(result.data.user);
      } else {
        // Token invalid, clear it
        clearToken();
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    const result = await authApi.login(username, password);

    if (result.data) {
      setToken(result.data.token);
      setUser(result.data.user);
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    const result = await authApi.register(username, email, password);

    if (result.data) {
      setToken(result.data.token);
      setUser(result.data.user);
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncToCloud = useCallback(async (gameState: any): Promise<boolean> => {
    if (!user) return false;

    const result = await saveApi.saveTo(gameState);
    return !!result.data;
  }, [user]);

  const loadFromCloud = useCallback(async (): Promise<any | null> => {
    if (!user) return null;

    const result = await saveApi.loadSave();
    return result.data?.gameState || null;
  }, [user]);

  const getCloudSaveInfo = useCallback(async (): Promise<{ hasSave: boolean; savedAt?: string } | null> => {
    if (!user) return null;

    const result = await saveApi.getSaveInfo();
    return result.data || null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        serverOnline,
        error,
        login,
        register,
        logout,
        clearError,
        syncToCloud,
        loadFromCloud,
        getCloudSaveInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
