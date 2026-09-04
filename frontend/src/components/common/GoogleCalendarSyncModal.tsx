import React, { useState } from 'react';
import { X, Check, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({ isOpen, onClose }) => {
  const { user, toggleGoogleSync } = useAuth();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([
    'Primary (aditya@work.com)',
    'Work Deadlines & Projects'
  ]);

  if (!isOpen) return null;

  const handleToggleCalendar = (calName: string) => {
    if (selectedCalendars.includes(calName)) {
      setSelectedCalendars(selectedCalendars.filter(c => c !== calName));
    } else {
      setSelectedCalendars([...selectedCalendars, calName]);
    }
  };

  const handleSyncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toggleGoogleSync(true, 'aditya@work.com');
      showToast('Google Calendar synced successfully! No conflicts found.', 'success');
      onClose();
    }, 800);
  };

  const handleDisconnect = () => {
    toggleGoogleSync(false);
    showToast('Google Calendar disconnected', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-2 flex items-center justify-center shadow-sm border border-slate-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                <path fill="#34A853" d="M9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Google Calendar Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Two-way real-time calendar synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status card */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  {user.isGoogleConnected ? 'Connected & Active' : 'Not Connected'}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400/80">
                  {user.googleEmail || 'aditya@work.com'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
              Live Sync
            </span>
          </div>

          {/* Conflict Checking Settings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Calendars checked for busy conflicts:
            </h4>
            <div className="space-y-2">
              {[
                { name: 'Primary (aditya@work.com)', desc: 'Main work calendar (Writes new events here)' },
                { name: 'Work Deadlines & Projects', desc: 'Syncs team milestones to block slots' },
                { name: 'Personal Events (aditya.personal@gmail.com)', desc: 'Prevents booking over personal time' }
              ].map((cal) => {
                const isSelected = selectedCalendars.includes(cal.name);
                return (
                  <div
                    key={cal.name}
                    onClick={() => handleToggleCalendar(cal.name)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 hover:border-bright-gold-500/40 cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{cal.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{cal.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-bright-gold-500 text-slate-950 shadow-sm' : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto Google Meet Toggle Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-bright-gold-500/20 border border-bright-gold-500/30 flex items-center justify-center text-bright-gold-700 dark:text-bright-gold-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              New bookings will automatically generate unique <strong>Google Meet</strong> video conference links and push them to your Google Calendar.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#151515] flex items-center justify-between">
          <button
            onClick={handleDisconnect}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline transition-colors"
          >
            Disconnect Account
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 shadow-gold-sm flex items-center gap-2 transition-all"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Save & Sync Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
