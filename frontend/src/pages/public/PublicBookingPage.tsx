import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  Video, 
  CheckCircle, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import { api } from '../../services/api';
import { slotEngine, AvailableSlot } from '../../services/slotEngine';
import { EventType, User, Booking } from '../../types';
import { BookingCalendar } from '../../components/booking/BookingCalendar';
import { TimeSlotPicker } from '../../components/booking/TimeSlotPicker';
import { BookingIntakeForm } from '../../components/booking/BookingIntakeForm';
import { BookingConfirmation } from '../../components/booking/BookingConfirmation';
import { TimezoneSelect } from '../../components/booking/TimezoneSelect';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { GoogleLoginModal } from '../../components/common/GoogleLoginModal';
import { useTheme } from '../../context/ThemeContext';

export const PublicBookingPage: React.FC = () => {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  const { theme } = useTheme();

  const [host, setHost] = useState<User | null>(null);
  const [event, setEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');

  const [step, setStep] = useState<'select_slot' | 'intake_form' | 'confirmed'>('select_slot');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);

  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setHost(currentUser);
    setTimezone(currentUser.timezone || 'Asia/Kolkata');

    const foundEvent = eventService.getBySlug(eventSlug || '30min') || eventService.getAll()[0];
    if (foundEvent) {
      setEvent(foundEvent);
    }

    if (username && eventSlug) {
      api.get<{ host: User; event: EventType }>(`/public/${username}/${eventSlug}`).then(res => {
        if (res?.host) {
          setHost(res.host);
          setTimezone(res.host.timezone || 'Asia/Kolkata');
        }
        if (res?.event) {
          setEvent(res.event);
        }
      }).catch(() => {});
    }
  }, [username, eventSlug]);

  useEffect(() => {
    if (selectedDate && event) {
      const localSlots = slotEngine.getAvailableSlotsForDate(selectedDate, event);
      setAvailableSlots(localSlots);
      setSelectedSlot(null);

      if (username && eventSlug) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        api.get<AvailableSlot[]>(`/public/${username}/${eventSlug}/slots?date=${dateStr}`).then(serverSlots => {
          if (Array.isArray(serverSlots) && serverSlots.length > 0) {
            setAvailableSlots(serverSlots);
          }
        }).catch(() => {});
      }
    }
  }, [selectedDate, event, username, eventSlug]);

  if (!host || !event) {
    return (
      <div className="min-h-screen bg-[#f7f7f4] dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The event link you requested does not exist or may have been deactivated.
          </p>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-bright-gold-500 text-slate-950 text-xs font-bold"
          >
            Go to Schedulr Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] dark:bg-[#121212] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-bright-gold-500 selection:text-slate-950 transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo isLight={theme === 'light'} size="md" />

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setShowGoogleAuthModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 hover:border-bright-gold-500 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </header>

      {/* Main Booking Container */}
      <main className="w-full max-w-5xl mx-auto px-4 py-4 flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#181818] rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-300/40 dark:shadow-black/70 overflow-hidden p-6 sm:p-8 transition-all">
          {step === 'select_slot' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5">
              {/* Left Column: Host Details */}
              <div className="lg:col-span-4 pr-0 lg:pr-6 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={host.avatarUrl}
                    alt={host.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-bright-gold-500 shadow-sm"
                  />
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Host</div>
                    <div className="flex items-center gap-1.5 font-black text-base text-slate-900 dark:text-white">
                      <span>{host.name}</span>
                      <svg className="w-4 h-4 text-bright-gold-500 fill-bright-gold-500" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div className="text-[11px] text-slate-400">Verified Host</div>
                  </div>
                </div>

                <div className="pt-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {event.title}
                  </h1>
                </div>

                {/* Duration Badge */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-white/5">
                    <Clock className="w-3.5 h-3.5 text-bright-gold-600 dark:text-bright-gold-400" />
                    <span>{event.durationMinutes} min</span>
                  </div>
                </div>

                {/* Google Meet Badge */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                    </svg>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white">Google Meet</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Link generated automatically</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  {event.description}
                </p>

                {/* Timezone Switcher */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <TimezoneSelect
                    value={timezone}
                    onChange={setTimezone}
                    isLight={theme === 'light'}
                  />
                </div>
              </div>

              {/* Center Column: Interactive Calendar */}
              <div className="lg:col-span-5 pt-6 lg:pt-0 px-0 lg:px-6">
                <BookingCalendar
                  event={event}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => setSelectedDate(date)}
                  isLight={theme === 'light'}
                />
              </div>

              {/* Right Column: Time Slots */}
              <div className="lg:col-span-3 pt-6 lg:pt-0 pl-0 lg:pl-6">
                {selectedDate ? (
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
                    onConfirm={() => setStep('intake_form')}
                    isLight={theme === 'light'}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Select a date to view available time slots
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'intake_form' && selectedSlot && (
            <BookingIntakeForm
              event={event}
              host={host}
              slot={selectedSlot}
              timezone={timezone}
              onBack={() => setStep('select_slot')}
              onComplete={(booking) => {
                setConfirmedBooking(booking);
                setStep('confirmed');
              }}
              isLight={theme === 'light'}
            />
          )}

          {step === 'confirmed' && confirmedBooking && (
            <BookingConfirmation
              booking={confirmedBooking}
              host={host}
              onReset={() => {
                setStep('select_slot');
                setSelectedSlot(null);
              }}
              isLight={theme === 'light'}
            />
          )}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <span>Powered by </span>
        <span className="font-extrabold text-slate-700 dark:text-slate-300">Schedulr</span>
      </footer>

      {/* Google Sign In Modal */}
      <GoogleLoginModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
      />
    </div>
  );
};
