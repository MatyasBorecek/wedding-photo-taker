import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/ApiHelper';

const AuthContext = createContext({
  user: null,
  setUser: () => {
  },
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const { data } = await getCurrentUser();
      setUser(data);
      navigate(data?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      Cookies.remove('token');
      navigate('/register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
      navigate('/register');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};