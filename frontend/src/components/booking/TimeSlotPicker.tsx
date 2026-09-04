import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock, ArrowRight } from 'lucide-react';
import { AvailableSlot } from '../../services/slotEngine';

interface TimeSlotPickerProps {
  selectedDate: Date;
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  onConfirm: () => void;
  isLight?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  slots,
  selectedSlot,
  onSelectSlot,
  onConfirm,
}) => {
  const [is24Hour, setIs24Hour] = useState(false);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header: Date + 12h/24h toggle */}
      <div className="flex items-center justify-between mb-4 pb-1">
        <h4 className="text-sm font-extrabold truncate text-slate-900 dark:text-white">
          {format(selectedDate, 'EEE, MMM d')}
        </h4>

        {/* 12h / 24h Switcher */}
        <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#202020] text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setIs24Hour(false)}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              !is24Hour
                ? 'bg-white dark:bg-[#121212] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            12h
          </button>
          <button
            type="button"
            onClick={() => setIs24Hour(true)}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              is24Hour
                ? 'bg-white dark:bg-[#121212] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24h
          </button>
        </div>
      </div>

      {/* Slots List */}
      <div className="flex-1 overflow-y-auto max-h-[290px] pr-1 space-y-2">
        {slots.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No open time slots on this day.</p>
          </div>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlot?.isoString === slot.isoString;
            const displayTime = is24Hour ? slot.time24 : slot.time12;

            return (
              <button
                key={slot.isoString}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-between border transition-all duration-150 ${
                  isSelected
                    ? 'bg-bright-gold-500 border-bright-gold-500 text-slate-950 shadow-gold-sm scale-[1.02]'
                    : 'bg-white dark:bg-[#1c1c1c] border-slate-200 dark:border-white/5 hover:border-bright-gold-500/60 hover:text-bright-gold-600 dark:hover:text-bright-gold-300 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{displayTime}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3] text-slate-950" />}
              </button>
            );
          })
        )}
      </div>

      {/* Next Continue Button */}
      {selectedSlot && (
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-black shadow-gold-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-200"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
};
