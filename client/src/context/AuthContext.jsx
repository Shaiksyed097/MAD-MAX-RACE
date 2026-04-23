import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.data);
        } catch (err) {
          console.error('Token invalid, logging out');
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = (tokenVal, userData) => {
    localStorage.setItem('token', tokenVal);
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to refresh user data');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
