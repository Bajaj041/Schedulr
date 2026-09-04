import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GoogleCalendarSyncModal } from '../../components/common/GoogleCalendarSyncModal';

const COMMON_TIMEZONES = [
  { name: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata' },
  { name: 'America/New_York (GMT-4:00)', value: 'America/New_York' },
  { name: 'America/Los_Angeles (GMT-7:00)', value: 'America/Los_Angeles' },
  { name: 'Europe/London (GMT+1:00)', value: 'Europe/London' },
  { name: 'Europe/Paris (GMT+2:00)', value: 'Europe/Paris' },
  { name: 'Asia/Tokyo (GMT+9:00)', value: 'Asia/Tokyo' },
  { name: 'Australia/Sydney (GMT+10:00)', value: 'Australia/Sydney' },
];

export const SettingsPage: React.FC = () => {
  const { user, updateUser, resetDemoData } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio || '');
  const [timezone, setTimezone] = useState(user.timezone);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      username,
      role,
      bio,
      timezone,
    });
    showToast('Profile settings saved successfully', 'success');
  };

  const handleResetData = () => {
    if (confirm('This will reset all localStorage state and restore realistic demo bookings. Proceed?')) {
      resetDemoData();
      showToast('Demo data restored!', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, public link username, default timezone, and developer options.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Profile Information</h3>

        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-bright-gold-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">/{user.username}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Username (Vanity URL)
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] overflow-hidden text-xs">
              <span className="px-3 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">schedulr.io/</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Public Bio / Intro
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shadow-gold-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Demo Reset Action */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-bright-gold-600 dark:text-bright-gold-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Demo Data & State Management</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Schedulr stores all your event types, bookings, availability rules, and simulated Google connections inside browser localStorage. If you wish to reset all sample data to its original fresh state, click below.
        </p>
        <button
          type="button"
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bright-gold-50 dark:bg-bright-gold-950/40 hover:bg-bright-gold-100 dark:hover:bg-bright-gold-950/70 text-slate-950 dark:text-bright-gold-300 border border-bright-gold-300 dark:border-bright-gold-500/30 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Demo Data to Initial State</span>
        </button>
      </div>

      <GoogleCalendarSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </div>
  );
};
