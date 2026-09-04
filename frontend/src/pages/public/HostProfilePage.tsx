import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowRight, Video } from 'lucide-react';
import { userService } from '../../services/userService';
import { eventService } from '../../services/eventService';
import { api } from '../../services/api';
import { User, EventType } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const HostProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { theme } = useTheme();
  const [host, setHost] = useState<User | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    const user = userService.getCurrentUser();
    setHost(user);
    setEventTypes(eventService.getActive());

    if (username) {
      api.get<{ host: User; eventTypes: EventType[] }>(`/public/${username}`).then(res => {
        if (res?.host) {
          setHost(res.host);
          if (res.eventTypes) setEventTypes(res.eventTypes);
        }
      }).catch(() => {});
    }
  }, [username]);

  if (!host) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-bright-gold-500 selection:text-slate-950 transition-colors duration-200">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo isLight={theme === 'light'} size="md" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400 hover:underline transition-colors"
          >
            Host Login
          </Link>
        </div>
      </header>

      {/* Profile Card Container */}
      <main className="w-full max-w-2xl mx-auto px-4 py-8 flex-1">
        <div className="bg-white dark:bg-[#181818] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl p-8 text-center mb-8 transition-all">
          <img
            src={host.avatarUrl}
            alt={host.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-bright-gold-500 shadow-md mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-1.5 font-black text-2xl text-slate-900 dark:text-white mb-1">
            <span>{host.name}</span>
            <svg className="w-5 h-5 text-bright-gold-500 fill-bright-gold-500" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3">{host.role}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            {host.bio || 'Welcome to my scheduling page. Please select an event below to book a time directly onto my calendar.'}
          </p>
        </div>

        {/* Event Types Directory */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
            Available Meeting Options
          </h2>

          {eventTypes.map((event) => (
            <Link
              key={event.id}
              to={`/${host.username}/${event.slug}`}
              className="block p-5 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-bright-gold-500"
                    />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-bright-gold-600 dark:text-bright-gold-400" />
                      <span>{event.durationMinutes} mins</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Google Meet</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#222222] group-hover:bg-bright-gold-500 text-slate-500 dark:text-slate-400 group-hover:text-slate-950 transition-colors shrink-0">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <span>Powered by </span>
        <span className="font-extrabold text-slate-700 dark:text-slate-300">Schedulr</span>
      </footer>
    </div>
  );
};
