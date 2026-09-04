import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '../../services/api';
import { StorageService } from '../../services/localStorage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      showToast(`Google Sign-In failed: ${error}`, 'error');
      navigate('/login');
      return;
    }

    if (token && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        setToken(token);
        StorageService.setUser(parsedUser);
        StorageService.setAuth(true);
        updateUser(parsedUser);
        showToast(`Welcome back, ${parsedUser.name}!`, 'success');
        navigate('/app/dashboard', { replace: true });
      } catch (err) {
        console.error('Error parsing user data from callback:', err);
        showToast('Authentication failed. Please try again.', 'error');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, showToast, updateUser]);

  return (
    <div className="min-h-screen bg-[#f7f7f4] dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-3 border-bright-gold-500 border-t-transparent animate-spin" />
        <h2 className="text-xl font-black tracking-tight">Authenticating with Google...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Syncing your calendar and profile securely. Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
};
