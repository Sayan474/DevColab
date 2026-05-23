import { useEffect, useState } from 'react';
import api, { unwrap } from '../lib/api';
import { disconnectSockets, refreshSocketAuth } from '../lib/socket';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrate = async () => {
    const token = localStorage.getItem('devcollab_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = unwrap(await api.get('/auth/me'));
      setUser(data.user);
      refreshSocketAuth();
    } catch {
      localStorage.removeItem('devcollab_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const login = async (email, password) => {
    setError('');
    const data = unwrap(await api.post('/auth/login', { email, password }));
    localStorage.setItem('devcollab_token', data.token);
    setUser(data.user);
    refreshSocketAuth();
    return data.user;
  };

  const register = async (name, email, password) => {
    setError('');
    const data = unwrap(await api.post('/auth/register', { name, email, password }));
    localStorage.setItem('devcollab_token', data.token);
    setUser(data.user);
    refreshSocketAuth();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('devcollab_token');
    disconnectSockets();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated: Boolean(user), login, register, logout, setUser, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
