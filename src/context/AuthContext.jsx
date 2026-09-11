import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';
import { currentUser as defaultFallbackUser } from '../data/mockUsers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('connectx_user');
      return saved ? JSON.parse(saved) : defaultFallbackUser;
    } catch {
      return defaultFallbackUser;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('connectx_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('connectx_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('connectx_token');
      if (savedToken) {
        try {
          const remoteUser = await authApi.getMe();
          if (remoteUser) {
            setUser(remoteUser);
            setIsAuthenticated(true);
            localStorage.setItem('connectx_user', JSON.stringify(remoteUser));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          // Only clear if 401
          if (err.status === 401) {
            localStorage.removeItem('connectx_token');
            localStorage.removeItem('connectx_user');
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  // Sync user changes to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('connectx_user', JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to save user session:', e);
      }
    }
  }, [user]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    const loggedUser = data.user;
    setUser(loggedUser);
    setIsAuthenticated(true);
    setToken(data.tokens?.accessToken);
    return loggedUser;
  };

  const signup = async (fullName, email, password) => {
    const data = await authApi.register(fullName, email, password);
    const newUser = data.user;
    setUser(newUser);
    setIsAuthenticated(true);
    setToken(data.tokens?.accessToken);
    return newUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Error during logout:', e);
    } finally {
      localStorage.removeItem('connectx_token');
      localStorage.removeItem('connectx_user');
      setUser(defaultFallbackUser);
      setIsAuthenticated(false);
      setToken(null);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const remoteUpdated = await authApi.updateProfile(updatedData);
      setUser(prev => ({ ...prev, ...remoteUpdated }));
      return remoteUpdated;
    } catch (err) {
      // Optimistic local update fallback
      setUser(prev => ({ ...prev, ...updatedData }));
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
