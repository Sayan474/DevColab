import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { unwrap } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth(); // ← also grab loading
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // ← WAIT for auth to finish loading before doing anything
    if (loading) return;

    const handle = async () => {
      if (!isAuthenticated) {
        localStorage.setItem('pendingInviteToken', token);
        navigate(`/login?invite=${token}`);
        return;
      }

      try {
        const data = unwrap(await api.get(`/invites/accept/${token}`));
        console.log("INVITE RESPONSE:", data);
        if (data.registered === false) {
          localStorage.setItem('pendingInviteToken', token);
          navigate(`/signup?invite=${token}`);
          return;
        }
        setStatus('success');
        setMessage(data.message || 'You joined the workspace!');
        setTimeout(() => navigate('/dashboard'), 2500);
      } catch (err) {
        console.log('INVITE ERROR', err);
        // ← Check if user just needs to log in (not registered)
        const serverMsg = err?.response?.data?.message || '';
        if (err?.response?.status === 404 || serverMsg.toLowerCase().includes('invalid')) {
          setStatus('error');
          setMessage('This invite link is invalid or has already been used.');
        } else {
          setStatus('error');
          setMessage(serverMsg || 'Invite is invalid or expired.');
        }
      }
    };

    handle();
  }, [token, isAuthenticated, loading]); // ← loading in dependency array

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="surface rounded-2xl p-10 max-w-md w-full text-center space-y-4 border border-dark-border">
        {status === 'loading' && (
          <p className="text-gray-400 animate-pulse">Validating your invite...</p>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl">🎉</div>
            <h2 className="text-xl font-bold">You're in!</h2>
            <p className="text-gray-400">{message}</p>
            <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <h2 className="text-xl font-bold">Invite Failed</h2>
            <p className="text-gray-400">{message}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-xl bg-primary text-white text-sm"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 rounded-xl border border-dark-border text-sm"
              >
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;