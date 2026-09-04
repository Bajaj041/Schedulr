import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Globe, 
  Video, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  RotateCcw, 
  XCircle,
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, User } from '../../types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendarHelpers';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

interface BookingConfirmationProps {
  booking: Booking;
  host: User;
  onReset: () => void;
  isLight?: boolean;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  host,
  onReset,
  isLight = true,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore in environments where canvas is restricted
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(booking.meetingUrl);
    setCopied(true);
    showToast('Google Meet link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const startTime = parseISO(booking.startTime);
  const endTime = parseISO(booking.endTime);
  const googleCalUrl = generateGoogleCalendarUrl(booking);

  return (
    <div className="w-full max-w-xl mx-auto py-4 text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-xl shadow-emerald-500/10 animate-in zoom-in-75 duration-300">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className={`text-2xl font-extrabold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        You are scheduled!
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        A calendar invitation and Google Meet link have been sent to{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.attendeeEmail}</span>.
      </p>

      {/* Meeting Summary Card */}
      <div
        className={`p-6 rounded-3xl border text-left space-y-4 mb-6 ${
          isLight
            ? 'bg-slate-50 border-slate-200 shadow-sm'
            : 'bg-slate-900/80 border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <img
            src={host.avatarUrl}
            alt={host.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30"
          />
          <div>
            <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {booking.eventTitle}
            </h3>
            <p className="text-xs text-slate-400">with {booking.hostName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{format(startTime, 'h:mm a')} – {format(endTime, 'h:mm a')}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Globe className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{booking.timezone}</span>
          </div>
        </div>

        {/* Google Meet Action Section */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
              </svg>
              <span>Google Meet Video Call</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-300 truncate">
              {booking.meetingUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Copy meeting link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <a
            href={booking.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <span>Join Google Meet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Calendar Add Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 hover:bg-brand-50/30 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          {/* Google Cal Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
          </svg>
          <span>Add to Google Calendar</span>
        </a>

        <button
          type="button"
          onClick={() => downloadIcsFile(booking)}
          className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 hover:bg-brand-50/30 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-500" />
          <span>Download .ics Invite</span>
        </button>
      </div>

      {/* Reschedule / Cancel / Book Another */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <Link
          to={`/reschedule/${booking.id}`}
          className="text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reschedule</span>
        </Link>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <Link
          to={`/cancel/${booking.id}`}
          className="text-slate-500 hover:text-rose-500 font-semibold flex items-center gap-1 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel Meeting</span>
        </Link>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <button
          type="button"
          onClick={onReset}
          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
        >
          Book another slot
        </button>
      </div>
    </div>
  );
};
