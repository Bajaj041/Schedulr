import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import { slotEngine, AvailableSlot } from '../../services/slotEngine';
import { Booking, EventType, User } from '../../types';
import { BookingCalendar } from '../../components/booking/BookingCalendar';
import { TimeSlotPicker } from '../../components/booking/TimeSlotPicker';
import { BookingConfirmation } from '../../components/booking/BookingConfirmation';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const ReschedulePublicPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<EventType | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const b = bookingService.getById(bookingId);
    if (b) {
      setBooking(b);
      const ev = eventService.getById(b.eventTypeId) || eventService.getAll()[0];
      setEvent(ev);
      const u = userService.getCurrentUser();
      setHost(u);
    }
    // Fetch from backend
    bookingService.fetchPublicBooking(bookingId).then(res => {
      if (res?.booking) {
        setBooking(res.booking);
        if (res.eventType) setEvent(res.eventType);
        if (res.host) setHost(res.host);
      }
    });
  }, [bookingId]);

  useEffect(() => {
    if (selectedDate && event) {
      const slots = slotEngine.getAvailableSlotsForDate(selectedDate, event);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [selectedDate, event]);

  const handleConfirmReschedule = () => {
    if (!booking || !selectedSlot) return;

    const updated = bookingService.rescheduleBooking(booking.id, selectedSlot.isoString);
    setBooking(updated);
    setIsDone(true);
    showToast('Meeting successfully rescheduled!', 'success');
  };

  if (!booking || !event || !host) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full bg-white dark:bg-[#181818] rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            We could not find the specified booking. It may have been removed.
          </p>
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

  return (
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-bright-gold-500 selection:text-slate-950 transition-colors duration-200">
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo isLight={theme === 'light'} size="md" />
        <ThemeToggle />
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 py-4 flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#181818] rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl p-6 sm:p-8">
          {!isDone ? (
            <div>
              {/* Header Info */}
              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-bright-gold-700 dark:text-bright-gold-400 mb-1">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reschedule Appointment</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {booking.eventTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Currently scheduled for: <span className="font-semibold text-slate-700 dark:text-slate-200">{format(parseISO(booking.startTime), 'EEEE, MMMM d, yyyy • h:mm a')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/bookings`}
                    className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Back to Bookings
                  </Link>
                </div>
              </div>

              {/* Calendar & Time Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Select a new date:
                  </h4>
                  <BookingCalendar
                    event={event}
                    selectedDate={selectedDate}
                    onSelectDate={(date) => setSelectedDate(date)}
                    isLight={theme === 'light'}
                  />
                </div>

                <div className="md:col-span-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Select a new time:
                  </h4>
                  {selectedDate && (
                    <TimeSlotPicker
                      selectedDate={selectedDate}
                      slots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSelectSlot={(slot) => setSelectedSlot(slot)}
                      onConfirm={handleConfirmReschedule}
                      isLight={theme === 'light'}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <BookingConfirmation
              booking={booking}
              host={host}
              onReset={() => setIsDone(false)}
              isLight={theme === 'light'}
            />
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <span>Powered by </span>
        <span className="font-extrabold text-slate-700 dark:text-slate-300">Schedulr</span>
      </footer>
    </div>
  );
};
