import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { availabilityService } from '../../services/availabilityService';
import { AvailabilitySchedule, DaySchedule, DateOverride } from '../../types';
import { useToast } from '../../context/ToastContext';
import { GoogleCalendarSyncModal } from '../../components/common/GoogleCalendarSyncModal';

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export const AvailabilityPage: React.FC = () => {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<AvailabilitySchedule>(() => availabilityService.getSchedule());
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [overrideDate, setOverrideDate] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideAvailable, setOverrideAvailable] = useState(false);

  const handleToggleDay = (dayOfWeek: number) => {
    const updatedWeekly = schedule.weeklyHours.map(d => {
      if (d.dayOfWeek === dayOfWeek) {
        return {
          ...d,
          isEnabled: !d.isEnabled,
          slots: !d.isEnabled && d.slots.length === 0 ? [{ start: '09:00', end: '17:00' }] : d.slots
        };
      }
      return d;
    });

    const updated = availabilityService.updateWeeklyHours(updatedWeekly);
    setSchedule(updated);
    showToast('Weekly schedule updated', 'success');
  };

  const handleTimeChange = (dayOfWeek: number, slotIndex: number, field: 'start' | 'end', val: string) => {
    const updatedWeekly = schedule.weeklyHours.map(d => {
      if (d.dayOfWeek === dayOfWeek) {
        const newSlots = [...d.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: val };
        return { ...d, slots: newSlots };
      }
      return d;
    });

    const updated = availabilityService.updateWeeklyHours(updatedWeekly);
    setSchedule(updated);
  };

  const handleAddSlot = (dayOfWeek: number) => {
    const updatedWeekly = schedule.weeklyHours.map(d => {
      if (d.dayOfWeek === dayOfWeek) {
        return { ...d, slots: [...d.slots, { start: '13:00', end: '17:00' }] };
      }
      return d;
    });
    const updated = availabilityService.updateWeeklyHours(updatedWeekly);
    setSchedule(updated);
  };

  const handleRemoveSlot = (dayOfWeek: number, slotIndex: number) => {
    const updatedWeekly = schedule.weeklyHours.map(d => {
      if (d.dayOfWeek === dayOfWeek) {
        return { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) };
      }
      return d;
    });
    const updated = availabilityService.updateWeeklyHours(updatedWeekly);
    setSchedule(updated);
  };

  const handleBufferChange = (before: number, after: number) => {
    const updated = availabilityService.updateBuffers(before, after);
    setSchedule(updated);
    showToast('Buffer times saved', 'success');
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;

    const updated = availabilityService.addDateOverride({
      date: overrideDate,
      isAvailable: overrideAvailable,
      reason: overrideReason || (overrideAvailable ? 'Extra working hours' : 'Holiday / Out of office'),
      slots: overrideAvailable ? [{ start: '10:00', end: '16:00' }] : []
    });

    setSchedule(updated);
    setOverrideDate('');
    setOverrideReason('');
    showToast('Date override added', 'success');
  };

  const handleRemoveOverride = (id: string) => {
    const updated = availabilityService.removeDateOverride(id);
    setSchedule(updated);
    showToast('Date override removed', 'info');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Calendar & Availability
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Define recurring working hours, date-specific overrides, and buffer padding between meetings.
        </p>
      </div>

      {/* Connected Google Calendar Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white p-2 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                <path fill="#34A853" d="M9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <span>Google Calendar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  Connected - Checking for conflicts
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Primary calendar: aditya@work.com</div>
            </div>
          </div>

          <button
            onClick={() => setShowSyncModal(true)}
            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-[#222222] hover:bg-bright-gold-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Manage Sync Settings
          </button>
        </div>
      </div>

      {/* Weekly Working Hours Editor */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Weekly Working Hours</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set your active days and regular meeting time windows.
          </p>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
          {schedule.weeklyHours.map((day) => (
            <div
              key={day.dayOfWeek}
              className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Day Name + Toggle */}
              <div className="flex items-center gap-3 w-36">
                <button
                  type="button"
                  onClick={() => handleToggleDay(day.dayOfWeek)}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                    day.isEnabled ? 'bg-bright-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      day.isEnabled ? 'translate-x-4' : 'translate-x-0 bg-white'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${day.isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                  {day.dayName}
                </span>
              </div>

              {/* Time Slots */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {day.isEnabled ? (
                  day.slots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <select
                        value={slot.start}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, sIdx, 'start', e.target.value)}
                        className="bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-400">–</span>
                      <select
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, sIdx, 'end', e.target.value)}
                        className="bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>

                      {day.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.dayOfWeek, sIdx)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Unavailable</span>
                )}
              </div>

              {day.isEnabled && (
                <button
                  type="button"
                  onClick={() => handleAddSlot(day.dayOfWeek)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Add split time interval"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Buffer Times Controls */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Buffer Before Events
            </label>
            <select
              value={schedule.bufferBeforeMinutes}
              onChange={(e) => handleBufferChange(Number(e.target.value), schedule.bufferAfterMinutes)}
              className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={0}>0 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Buffer After Events
            </label>
            <select
              value={schedule.bufferAfterMinutes}
              onChange={(e) => handleBufferChange(schedule.bufferBeforeMinutes, Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={0}>0 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Overrides Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Date-Specific Overrides</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add specific dates when your availability changes (holidays, vacation, or special work days).
          </p>
        </div>

        {/* Add Override Form */}
        <form onSubmit={handleAddOverride} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
          <div className="w-full sm:w-44">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Date</label>
            <input
              type="date"
              required
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. National Holiday or Strategy Sprint"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-36">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status</label>
            <select
              value={overrideAvailable ? 'available' : 'unavailable'}
              onChange={(e) => setOverrideAvailable(e.target.value === 'available')}
              className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="unavailable">Unavailable (Blocked)</option>
              <option value="available">Available (Custom)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shrink-0 shadow-gold-sm transition-all"
          >
            Add Override
          </button>
        </form>

        {/* Overrides List */}
        <div className="space-y-2 pt-2">
          {schedule.overrides.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No date overrides configured.</p>
          ) : (
            schedule.overrides.map((ovr) => (
              <div
                key={ovr.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-bright-gold-600 dark:text-bright-gold-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{ovr.date}</span>
                  <span className="text-slate-500 dark:text-slate-400">({ovr.reason})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ovr.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {ovr.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveOverride(ovr.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <GoogleCalendarSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </div>
  );
};
