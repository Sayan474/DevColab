import { useEffect, useState } from 'react';
import api, { clearAuthToken, clearSocketToken, setSocketToken, unwrap } from '../lib/api';
import { disconnectSockets, refreshSocketAuth } from '../lib/socket';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrate = async () => {
    // No token check needed — cookie is sent automatically by browser
    // Just call /auth/me and see if the cookie is valid
    try {
      const data = unwrap(await api.get('/auth/me'));
      setUser(data.user);
      refreshSocketAuth();
    } catch {
      // Cookie missing, expired, or invalid — not logged in
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
    // Backend sets httpOnly cookie automatically in response
    // We only get user back — no token in response body anymore
    const data = unwrap(await api.post('/auth/login', { email, password }));
    setUser(data.user);

    // Store a separate token for Socket.IO (can't use httpOnly cookies)
    // We ask the backend for a socket token separately
    setSocketToken(data.socketToken || '');
    refreshSocketAuth();
    return data.user;
  };

  const register = async (name, email, password) => {
    setError('');
    return unwrap(await api.post('/auth/register/start', { name, email, password }));
  };

  const startRegister = async (name, email, password) => {
    setError('');
    return unwrap(await api.post('/auth/register/start', { name, email, password }));
  };

  const verifyRegister = async (email, otp) => {
    setError('');
    const data = unwrap(await api.post('/auth/register/verify', { email, otp }));
    setUser(data.user);
    setSocketToken(data.socketToken || '');
    refreshSocketAuth();
    return data.user;
  };

  const resendRegisterOtp = async (email) => {
    setError('');
    return unwrap(await api.post('/auth/register/resend', { email }));
  };

  const logout = async () => {
    try {
      // Tell backend to clear the httpOnly cookie
      await api.post('/auth/logout');
    } catch {
      // Even if request fails, clear local state
    }
    clearAuthToken();
    clearSocketToken();
    disconnectSockets();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      startRegister,
      verifyRegister,
      resendRegisterOtp,
      logout,
      setUser,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
