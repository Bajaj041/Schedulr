import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Globe, 
  Video, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { EventType, User, Booking } from '../../types';
import { AvailableSlot } from '../../services/slotEngine';
import { bookingService } from '../../services/bookingService';
import { GoogleLoginModal } from '../common/GoogleLoginModal';
import { useToast } from '../../context/ToastContext';

interface BookingIntakeFormProps {
  event: EventType;
  host: User;
  slot: AvailableSlot;
  timezone: string;
  onBack: () => void;
  onComplete: (booking: Booking) => void;
  isLight?: boolean;
}

export const BookingIntakeForm: React.FC<BookingIntakeFormProps> = ({
  event,
  host,
  slot,
  timezone,
  onBack,
  onComplete,
  isLight = true,
}) => {
  const { showToast } = useToast();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotDate = parseISO(slot.isoString);

  const handleGoogleSuccess = (account: { name: string; email: string }) => {
    setName(account.name);
    setEmail(account.email);
    showToast(`Autofilled details from Google account: ${account.email}`, 'info');
  };

  const handleCustomAnswerChange = (questionLabel: string, value: string) => {
    setCustomAnswers(prev => ({ ...prev, [questionLabel]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Please fill in your name and email', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = bookingService.createBooking({
        eventTypeId: event.id,
        eventTitle: event.title,
        eventDuration: event.durationMinutes,
        hostId: host.id,
        hostName: host.name,
        hostEmail: host.email,
        attendeeName: name,
        attendeeEmail: email,
        attendeePhone: phone || undefined,
        attendeeNotes: notes || undefined,
        customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
        startTime: slot.isoString,
        timezone: timezone,
        locationType: event.locationType,
      });

      setIsSubmitting(false);
      showToast('Booking successfully confirmed & invitation sent!', 'success');
      onComplete(newBooking);
    }, 600);
  };

  return (
    <>
      <div className="w-full">
        {/* Top Back Navigation */}
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to date & time selection</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Meeting Summary Card */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={host.avatarUrl}
                alt={host.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30"
              />
              <div>
                <div className="text-xs text-slate-400">Host</div>
                <div className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {host.name}
                </div>
              </div>
            </div>

            <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {event.title}
            </h3>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{event.durationMinutes} Minutes</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{format(slotDate, 'EEEE, MMMM d, yyyy • h:mm a')}</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Globe className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{timezone}</span>
              </div>

              {/* Google Meet indicator */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 mt-2">
                <div className="w-7 h-7 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                  </svg>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Google Meet</span> video link provided upon confirmation.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Intake Form */}
          <div className="md:col-span-7">
            {/* Google 1-Click Fast Fill */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className={`w-full py-2.5 px-4 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-semibold transition-all ${
                  isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-white'
                }`}
              >
                {/* Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google to autofill</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
                  <span className={`px-2 ${isLight ? 'bg-white' : 'bg-slate-900'}`}>or enter details</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                      : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                      : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                      : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Dynamic Custom Questions configured on Event Type */}
              {event.customQuestions?.map((q) => (
                <div key={q.id}>
                  <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {q.label} {q.required && '*'}
                  </label>
                  {q.type === 'textarea' ? (
                    <textarea
                      required={q.required}
                      rows={3}
                      placeholder="Type your response..."
                      value={customAnswers[q.label] || ''}
                      onChange={(e) => handleCustomAnswerChange(q.label, e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                          : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                      } focus:outline-none`}
                    />
                  ) : (
                    <input
                      type="text"
                      required={q.required}
                      placeholder="Type your answer..."
                      value={customAnswers[q.label] || ''}
                      onChange={(e) => handleCustomAnswerChange(q.label, e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                          : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                      } focus:outline-none`}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Additional Notes / Agenda
                </label>
                <textarea
                  rows={2}
                  placeholder="Anything specific you would like to discuss?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500'
                      : 'bg-slate-800/80 border-slate-700 text-white focus:ring-2 focus:ring-brand-500'
                  } focus:outline-none`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Scheduling Appointment...</span>
                    </div>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Calendar invites and Google Meet links will be sent instantly.</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Google Sign In Modal */}
      <GoogleLoginModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
        customTitle="Autofill with Google"
      />
    </>
  );
};
