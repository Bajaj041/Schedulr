import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  TrendingUp,
  Wand2,
  Phone,
  Camera,
  Heart,
  Glasses,
  Shapes,
  Eye,
  Settings,
  Share2,
  CalendarCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { EventType, Booking } from '../../types';
import { EventTypeModal } from '../../components/events/EventTypeModal';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [eventTypes, setEventTypes] = useState<EventType[]>(() => eventService.getAll());
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>(() => bookingService.getUpcoming());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const analytics = bookingService.getAnalytics();

  const handleCopyLink = (event: EventType) => {
    const url = `${window.location.origin}/${user.username}/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    showToast('Booking link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    const updated = eventService.toggleActive(id);
    setEventTypes(eventTypes.map(e => e.id === id ? updated : e));
    showToast(`Event type ${updated.isActive ? 'activated' : 'deactivated'}`, 'info');
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-bold text-slate-900 dark:text-slate-100">{user.name}</span>. Here is your Bright Gold scheduling workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shadow-gold-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Event Type</span>
          </button>
        </div>
      </div>

      {/* Palette Inspiration 3-Card Showcase Grid (Directly matching user screenshots) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Hero Banner */}
        <div
          className={`p-7 rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden ${
            theme === 'dark'
              ? 'gold-hero-card-dark text-white'
              : 'gold-hero-card-light text-slate-950'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-black/30 flex items-center justify-center mb-6">
              <Wand2 className="w-6 h-6 text-bright-gold-400 dark:text-bright-gold-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-snug mb-3">
              Increase your bookings by 3x
            </h2>
            <p className="text-xs text-slate-700 dark:text-bright-gold-100/80 leading-relaxed max-w-xs">
              Our smart availability engine helps you eliminate scheduling friction and book client meetings faster.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`w-full py-3 px-5 rounded-2xl text-xs font-bold transition-all text-center shadow-md ${
                theme === 'dark'
                  ? 'bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 shadow-gold-sm'
                  : 'bg-bright-gold-600 hover:bg-bright-gold-500 text-white shadow-bright-gold-600/20'
              }`}
            >
              Quick Create Event
            </button>
          </div>
        </div>

        {/* Card 2: Categories / Meeting Types Grid */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 transition-all">
          <h3 className="font-black text-sm text-slate-900 dark:text-white mb-6">
            Categories & Channels
          </h3>

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Video Sync', icon: Camera, slug: '30min' },
              { label: 'Consult', icon: Heart, slug: '60min' },
              { label: 'Deep Dive', icon: Glasses, slug: '60min' },
              { label: 'Quick Chat', icon: Shapes, slug: '15min' },
              { label: 'Review', icon: Eye, slug: '30min' },
              { label: 'Settings', icon: Settings, slug: '' },
              { label: 'Share Link', icon: Share2, slug: '' },
              { label: 'Strategy', icon: Wand2, slug: '30min' },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                      theme === 'dark' ? 'gold-icon-circle-dark' : 'gold-icon-circle-light'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate max-w-[60px]">
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Metrics & Progress Bars */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 transition-all space-y-5">
          {[
            {
              title: 'Strategy & Discovery',
              icon: Camera,
              value: '$10.000',
              current: '$8.250',
              remaining: '$1.750',
              pct: 82,
            },
            {
              title: 'Architecture Consults',
              icon: Glasses,
              value: '$40.000',
              current: '$19.500',
              remaining: '$20.500',
              pct: 48,
            },
            {
              title: 'Advisory & Reviews',
              icon: Heart,
              value: '$5.500',
              current: '$3.000',
              remaining: '$2.500',
              pct: 55,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-bright-gold-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#2b2b2b] overflow-hidden">
                  <div
                    className="h-full bg-bright-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{item.current}</span>
                  <span>{item.remaining}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Event Types & Upcoming Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Event Types */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Event Types</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({eventTypes.length})</span>
            </h2>
            <Link
              to="/app/event-types"
              className="text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400 hover:underline transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventTypes.map((event) => (
              <div
                key={event.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500/50 transition-all flex flex-col justify-between group relative shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full bg-bright-gold-500"
                      />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {event.durationMinutes} min
                      </span>
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(event.id)}
                      className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                        event.isActive ? 'bg-bright-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                          event.isActive ? 'translate-x-4' : 'translate-x-0 bg-white'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors mb-1.5">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {event.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                    </svg>
                    <span>Google Meet</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(event)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-bright-gold-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                      title="Copy link"
                    >
                      {copiedId === event.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-[11px] text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/${user.username}/${event.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Open booking page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Agenda Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Upcoming Agenda
            </h2>
            <Link
              to="/app/bookings"
              className="text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400 hover:underline transition-colors"
            >
              See all →
            </Link>
          </div>

          <div className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-sm">
            {upcomingBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No upcoming bookings scheduled.
              </div>
            ) : (
              upcomingBookings.slice(0, 4).map((bkg) => {
                const startTime = parseISO(bkg.startTime);
                return (
                  <div
                    key={bkg.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 hover:border-bright-gold-500/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors">
                        {bkg.attendeeName}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bright-gold-500/20 text-bright-gold-800 dark:text-bright-gold-300 font-bold">
                        {format(startTime, 'h:mm a')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                      {bkg.eventTitle}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {format(startTime, 'MMM d, yyyy')}
                      </span>
                      <a
                        href={bkg.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meet</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Event Type Modal */}
      <EventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(newEvent) => {
          setEventTypes([newEvent, ...eventTypes]);
        }}
      />
    </div>
  );
};
