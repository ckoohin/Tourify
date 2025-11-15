import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api/v1/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` },
          });

          if (!res.ok) {
            throw new Error('Token verification failed');
          }

          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          console.error(e.message);
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      handleLoginSuccess,
      logout,
    }),
    [user, token, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : null}
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