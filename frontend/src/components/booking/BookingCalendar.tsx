import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfDay 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventType } from '../../types';
import { slotEngine } from '../../services/slotEngine';

interface BookingCalendarProps {
  event: EventType;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  isLight?: boolean;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  event,
  selectedDate,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = startOfDay(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="w-full select-none">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="text-xs font-semibold py-1 text-slate-400 dark:text-slate-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isAvailable = isCurrentMonth && slotEngine.isDateAvailable(day, event);
          const isPast = isBefore(day, today);

          if (!isCurrentMonth) {
            return (
              <div
                key={day.toISOString()}
                className="h-10 flex items-center justify-center text-xs font-medium rounded-xl opacity-20 text-slate-400 dark:text-slate-600"
              >
                {format(day, 'd')}
              </div>
            );
          }

          if (isPast || !isAvailable) {
            return (
              <div
                key={day.toISOString()}
                className="h-10 flex items-center justify-center text-xs font-medium rounded-xl text-slate-300 dark:text-slate-700 cursor-not-allowed"
              >
                {format(day, 'd')}
              </div>
            );
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`relative h-10 w-full flex flex-col items-center justify-center rounded-2xl text-xs font-black transition-all duration-150 ${
                isSelected
                  ? 'bg-bright-gold-500 text-slate-950 shadow-gold-sm scale-105'
                  : 'bg-bright-gold-50/60 dark:bg-[#201d07] hover:bg-bright-gold-100 dark:hover:bg-[#2e2908] text-slate-900 dark:text-bright-gold-300 border border-bright-gold-200/60 dark:border-bright-gold-500/20 hover:scale-105'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {/* Availability Indicator Dot */}
              {!isSelected && (
                <span className="w-1 h-1 rounded-full bg-bright-gold-600 dark:bg-bright-gold-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
