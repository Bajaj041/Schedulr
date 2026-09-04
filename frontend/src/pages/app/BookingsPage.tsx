import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Search, 
  RotateCcw, 
  XCircle, 
  Download, 
  CalendarCheck2
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';
import { format, parseISO } from 'date-fns';
import { downloadIcsFile } from '../../utils/calendarHelpers';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [search, setSearch] = useState('');

  const [bookings, setBookings] = useState<Booking[]>(() => bookingService.getAll());
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const refreshList = () => {
    setBookings(bookingService.getAll());
  };

  const upcomingList = bookings.filter(b => b.status !== 'cancelled' && new Date(b.startTime) > new Date());
  const pastList = bookings.filter(b => b.status !== 'cancelled' && new Date(b.startTime) <= new Date());
  const cancelledList = bookings.filter(b => b.status === 'cancelled');

  const currentList = tab === 'upcoming' ? upcomingList : tab === 'past' ? pastList : cancelledList;

  const filtered = currentList.filter(b =>
    b.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
    b.attendeeEmail.toLowerCase().includes(search.toLowerCase()) ||
    b.eventTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCancel) return;

    bookingService.cancelBooking(selectedBookingForCancel.id, cancelReason);
    setSelectedBookingForCancel(null);
    setCancelReason('');
    refreshList();
    showToast('Booking cancelled', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View upcoming calls, join Google Meet sessions, or manage reschedules.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attendee or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bright-gold-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-6 text-xs font-bold">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
          { id: 'past', label: `Past (${pastList.length})` },
          { id: 'cancelled', label: `Cancelled (${cancelledList.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-3 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-bright-gold-500 text-bright-gold-700 dark:text-bright-gold-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
            <CalendarCheck2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No {tab} bookings found.</p>
          </div>
        ) : (
          filtered.map((b) => {
            const start = parseISO(b.startTime);
            const end = parseISO(b.endTime);

            return (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500/40 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Attendee & Meeting info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-bright-gold-500/20 text-bright-gold-800 dark:text-bright-gold-300 flex items-center justify-center font-black text-sm border border-bright-gold-500/30">
                      {b.attendeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900 dark:text-white">{b.attendeeName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{b.attendeeEmail}</div>
                    </div>
                  </div>

                  <div className="font-bold text-xs text-bright-gold-700 dark:text-bright-gold-400 pt-1">
                    {b.eventTitle} ({b.eventDuration}m)
                  </div>

                  {b.attendeeNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-[#202020] p-2 rounded-xl max-w-xl">
                      "{b.attendeeNotes}"
                    </p>
                  )}

                  {b.cancelReason && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 p-2 rounded-xl max-w-xl">
                      Cancellation reason: {b.cancelReason}
                    </p>
                  )}
                </div>

                {/* Middle: Timing & Google Meet link */}
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-bright-gold-600 dark:text-bright-gold-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">{format(start, 'EEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-bright-gold-600 dark:text-bright-gold-400" />
                    <span>{format(start, 'h:mm a')} - {format(end, 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                    </svg>
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline truncate max-w-xs font-semibold"
                    >
                      {b.meetingUrl}
                    </a>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {b.status !== 'cancelled' && (
                    <>
                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>

                      <Link
                        to={`/reschedule/${b.id}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-bright-gold-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Reschedule"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedBookingForCancel(b)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Cancel meeting"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadIcsFile(b)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Download .ics"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Cancel Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Are you sure you want to cancel the meeting with {selectedBookingForCancel.attendeeName}?
            </p>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <textarea
                rows={3}
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
