import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { GoogleCalendarSyncModal } from './GoogleCalendarSyncModal';
import { ThemeToggle } from './ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenCreateEvent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent }) => {
  const { user, logout, resetDemoData } = useAuth();
  const navigate = useNavigate();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  
  const notifications = notificationService.getAll();
  const unreadCount = notificationService.getUnreadCount();

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 transition-colors">
        {/* Left: Search Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bookings, event types, or contacts..."
              className="w-full bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bright-gold-500 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle (Styled exactly like screenshot) */}
          <div className="mr-2 hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Quick Create Event Button */}
          {onOpenCreateEvent && (
            <button
              onClick={onOpenCreateEvent}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shadow-gold-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Event</span>
            </button>
          )}

          {/* Connected Google Account Badge Pill */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 hover:border-bright-gold-500/50 transition-all group"
            title="Google Calendar Sync Status"
          >
            <div className="w-5 h-5 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                <path fill="#34A853" d="M9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors flex items-center gap-1">
                <span>Google Calendar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {user.googleEmail || user.email}
              </div>
            </div>
          </button>

          {/* View Public Profile */}
          <Link
            to={`/${user.username}`}
            target="_blank"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 hover:border-bright-gold-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
          >
            <span>My Link</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-300 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-bright-gold-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Notifications</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-bright-gold-700 dark:text-bright-gold-400 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                          !n.read ? 'bg-bright-gold-50/50 dark:bg-bright-gold-950/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 hover:border-bright-gold-500 transition-all"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-bright-gold-500"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 text-slate-800 dark:text-slate-200 animate-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                </div>
                <div className="sm:hidden px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Theme</span>
                  <ThemeToggle showLabels={false} />
                </div>
                <Link
                  to="/app/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    resetDemoData();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-amber-600 dark:text-amber-400 transition-colors text-left"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Demo Data
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </>
  );
};
