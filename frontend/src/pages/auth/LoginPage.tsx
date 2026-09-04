import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { GoogleLoginModal } from '../../components/common/GoogleLoginModal';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('aditya@example.com');
  const [password, setPassword] = useState('password123');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    showToast('Logged in successfully!', 'success');
    navigate('/app/dashboard');
  };

  const handleGoogleSuccess = () => {
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-bright-gold-500 selection:text-slate-950 relative overflow-hidden transition-colors">
      {/* Background gold ambient lighting */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-bright-gold-500/10 dark:bg-bright-gold-500/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <BrandLogo isLight={theme === 'light'} size="md" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/aditya/30min"
            className="text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400 hover:underline transition-colors"
          >
            View Public Booking Demo →
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8 relative z-10">
        <div className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl shadow-slate-300/40 dark:shadow-black/70">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to manage your scheduling links & Google Calendar sync
            </p>
          </div>

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm hover:scale-[1.01]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="px-2 bg-white dark:bg-[#181818]">or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-bright-gold-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Demo ready</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-bright-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-black shadow-gold-sm transition-all hover:scale-[1.01]"
            >
              Sign In to Workspace
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-6 p-3 rounded-2xl bg-bright-gold-50/50 dark:bg-bright-gold-950/30 border border-bright-gold-200 dark:border-bright-gold-500/20 text-[11px] text-slate-600 dark:text-bright-gold-200 text-center">
            💡 <strong>Demo Mode:</strong> Any email/password will authenticate immediately with seed data.
          </div>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        © 2026 Schedulr Inc. Pure client-side prototype.
      </footer>

      <GoogleLoginModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};
