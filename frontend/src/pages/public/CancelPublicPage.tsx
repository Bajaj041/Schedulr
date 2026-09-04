import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { XCircle, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const CancelPublicPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const b = bookingService.getById(bookingId);
    if (b) {
      setBooking(b);
      if (b.status === 'cancelled') {
        setIsCancelled(true);
      }
    }
    // Fetch from backend
    bookingService.fetchPublicBooking(bookingId).then(res => {
      if (res?.booking) {
        setBooking(res.booking);
        if (res.booking.status === 'cancelled') {
          setIsCancelled(true);
        }
      }
    });
  }, [bookingId]);

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    bookingService.cancelBooking(booking.id, reason);
    setIsCancelled(true);
    showToast('Meeting cancelled successfully', 'info');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full bg-white dark:bg-[#181818] rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-2xl bg-bright-gold-500 text-slate-950 text-xs font-bold shadow-gold-sm"
          >
            Go to Schedulr Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const startTime = parseISO(booking.startTime);

  return (
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-bright-gold-500 selection:text-slate-950 transition-colors duration-200">
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo isLight={theme === 'light'} size="md" />
        <ThemeToggle />
      </header>

      <main className="w-full max-w-xl mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#181818] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl p-8 transition-all">
          {!isCancelled ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <XCircle className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                Cancel Appointment?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to cancel this scheduled meeting with{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{booking.hostName}</span>?
              </p>

              {/* Meeting Details Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{booking.eventTitle}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-bright-gold-600 dark:text-bright-gold-400" />
                  <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-bright-gold-600 dark:text-bright-gold-400" />
                  <span>{format(startTime, 'h:mm a')} ({booking.timezone})</span>
                </div>
              </div>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reason for Cancellation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Scheduling conflict, project completed, etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/app/bookings`}
                    className="w-1/2 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 text-center transition-colors"
                  >
                    Nevermind, Keep
                  </Link>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-500 mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Meeting Cancelled</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
                This meeting has been removed from the schedule. Both you and the host will not receive further notifications.
              </p>
              <Link
                to={`/`}
                className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-bright-gold-500 text-slate-950 text-xs font-black shadow-gold-sm hover:bg-bright-gold-400 transition-all"
              >
                Schedule a New Meeting
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <span>Powered by </span>
        <span className="font-extrabold text-slate-700 dark:text-slate-300">Schedulr</span>
      </footer>
    </div>
  );
};
