import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Layers, 
  Puzzle, 
  Users2, 
  BarChart3, 
  Settings, 
  ExternalLink
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Event Types', href: '/app/event-types', icon: Layers },
    { name: 'Bookings', href: '/app/bookings', icon: CalendarDays },
    { name: 'Availability', href: '/app/availability', icon: Clock },
    { name: 'Integrations', href: '/app/integrations', icon: Puzzle },
    { name: 'Team', href: '/app/team', icon: Users2 },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0e0e0e] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/5">
          <BrandLogo isLight={theme === 'light'} size="md" />
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-bright-gold-500 text-slate-950 shadow-gold-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Host Profile Card */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <a
          href={`/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500 transition-all group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-bright-gold-500 shrink-0"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                /{user.username}
              </div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-bright-gold-500 transition-colors shrink-0" />
        </a>
      </div>
    </aside>
  );
};
