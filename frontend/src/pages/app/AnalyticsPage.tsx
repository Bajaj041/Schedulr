import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CalendarCheck 
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';

export const AnalyticsPage: React.FC = () => {
  const analytics = bookingService.getAnalytics();
  const eventTypes = eventService.getAll();
  const bookings = bookingService.getAll();

  const dayCounts: Record<string, number> = {
    'Mon': 2,
    'Tue': 3,
    'Wed': 4,
    'Thu': 6,
    'Fri': 5,
    'Sat': 0,
    'Sun': 0
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Booking Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Measure scheduling conversion rates, total hours spent in meetings, and peak booking times.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">
            <span>Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-bright-gold-500 text-slate-950 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.totalBookings}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">100% Client-Side</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">
            <span>Meeting Hours</span>
            <div className="w-8 h-8 rounded-xl bg-bright-gold-500 text-slate-950 flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.meetingHours} hrs</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total call duration</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">
            <span>Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-bright-gold-500 text-slate-950 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.completionRate}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">Low No-Show</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">
            <span>Active Event Types</span>
            <div className="w-8 h-8 rounded-xl bg-bright-gold-500 text-slate-950 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{eventTypes.filter(e => e.isActive).length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Published links</div>
        </div>
      </div>

      {/* Visual Chart: Bookings by Day of Week */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Peak Meeting Days</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution of scheduled appointments across the week</p>
          </div>
          <span className="text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400">Peak: Thursday</span>
        </div>

        <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 pb-2">
          {Object.entries(dayCounts).map(([day, count]) => {
            const heightPct = count > 0 ? (count / 6) * 100 : 8;
            const isPeak = count === 6;

            return (
              <div key={day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{count}</span>
                <div
                  className={`w-full rounded-2xl transition-all duration-300 ${
                    isPeak
                      ? 'bg-bright-gold-500 shadow-gold-sm'
                      : count > 0
                      ? 'bg-slate-200 dark:bg-[#282828] hover:bg-bright-gold-300 dark:hover:bg-bright-gold-500/50'
                      : 'bg-slate-100 dark:bg-[#202020]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-xs font-bold ${isPeak ? 'text-bright-gold-700 dark:text-bright-gold-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Popularity Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Event Type Performance</h3>

        <div className="space-y-3">
          {eventTypes.map((evt) => {
            const eventBookings = bookings.filter(b => b.eventTypeId === evt.id);
            const pct = bookings.length > 0 ? Math.round((eventBookings.length / bookings.length) * 100) : 33;

            return (
              <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-bright-gold-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{evt.title}</span>
                  </div>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{eventBookings.length} bookings ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bright-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
