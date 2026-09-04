import {
  format,
  addMinutes,
  setHours,
  setMinutes,
  isAfter,
  addHours,
  addDays,
  startOfDay,
  endOfDay,
  parseISO
} from 'date-fns';

export interface AvailableSlot {
  time12: string;      // e.g. "09:30 AM"
  time24: string;      // e.g. "09:30"
  isoString: string;   // Full ISO string for booking
  isAvailable: boolean;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isEnabled: boolean;
  slots: { start: string; end: string }[];
}

export interface DateOverride {
  date: string;
  isAvailable: boolean;
  slots?: { start: string; end: string }[];
  reason?: string;
}

export const serverSlotEngine = {
  /**
   * Check if a specific date has any available working schedule
   */
  isDateAvailable: (
    targetDate: Date,
    event: { maxDaysInFuture: number },
    schedule: { weeklyHours: DaySchedule[]; overrides: DateOverride[] }
  ): boolean => {
    const now = new Date();
    const today = startOfDay(now);
    const targetDay = startOfDay(targetDate);

    // Cannot book in the past
    if (targetDay < today) return false;

    // Check maximum booking window in future
    if (targetDay > addDays(today, event.maxDaysInFuture || 60)) return false;

    const dateStr = format(targetDate, 'yyyy-MM-dd');

    // 1. Check Date Overrides
    const override = schedule.overrides.find(o => o.date === dateStr);
    if (override) {
      return override.isAvailable && (override.slots ? override.slots.length > 0 : false);
    }

    // 2. Check Weekly Schedule
    const dayOfWeek = targetDate.getDay();
    const dayConfig = schedule.weeklyHours.find(d => d.dayOfWeek === dayOfWeek);
    return !!dayConfig && dayConfig.isEnabled && dayConfig.slots.length > 0;
  },

  /**
   * Calculate all open time slots for a specific date
   */
  getAvailableSlotsForDate: (
    targetDate: Date,
    event: {
      durationMinutes: number;
      bufferBeforeMinutes: number;
      bufferAfterMinutes: number;
      minimumNoticeHours: number;
      maxDaysInFuture: number;
    },
    schedule: {
      weeklyHours: DaySchedule[];
      overrides: DateOverride[];
      bufferBeforeMinutes: number;
      bufferAfterMinutes: number;
    },
    existingBookings: { startTime: Date | string; endTime: Date | string; status: string }[]
  ): AvailableSlot[] => {
    if (!serverSlotEngine.isDateAvailable(targetDate, event, schedule)) {
      return [];
    }

    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const now = new Date();
    const minimumAllowedTime = addHours(now, event.minimumNoticeHours || 0);

    // Get applicable time ranges for this date
    let timeRanges: { start: string; end: string }[] = [];
    const override = schedule.overrides.find(o => o.date === dateStr);

    if (override && override.isAvailable && override.slots) {
      timeRanges = override.slots;
    } else {
      const dayOfWeek = targetDate.getDay();
      const dayConfig = schedule.weeklyHours.find(d => d.dayOfWeek === dayOfWeek);
      if (dayConfig && dayConfig.isEnabled) {
        timeRanges = dayConfig.slots;
      }
    }

    if (timeRanges.length === 0) return [];

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Filter existing active bookings for this day
    const activeBookings = existingBookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const bTime = typeof b.startTime === 'string' ? parseISO(b.startTime) : b.startTime;
      return bTime >= dayStart && bTime <= dayEnd;
    });

    const bufferBefore = Math.max(event.bufferBeforeMinutes || 0, schedule.bufferBeforeMinutes || 0);
    const bufferAfter = Math.max(event.bufferAfterMinutes || 0, schedule.bufferAfterMinutes || 0);
    const duration = event.durationMinutes;
    const stepMinutes = duration <= 30 ? 30 : 30; // 30 min slot stepping

    const slots: AvailableSlot[] = [];

    for (const range of timeRanges) {
      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);

      let currentSlotTime = setMinutes(setHours(targetDate, startHour), startMin);
      const rangeEndTime = setMinutes(setHours(targetDate, endHour), endMin);

      while (true) {
        const slotEndTime = addMinutes(currentSlotTime, duration);

        // If slot exceeds range end time, break
        if (isAfter(slotEndTime, rangeEndTime)) break;

        // Check minimum notice requirement
        const isPastNotice = isAfter(currentSlotTime, minimumAllowedTime);

        // Conflict check with existing bookings (including buffers)
        const slotWithBufferStart = addMinutes(currentSlotTime, -bufferBefore);
        const slotWithBufferEnd = addMinutes(slotEndTime, bufferAfter);

        const hasConflict = activeBookings.some(booking => {
          const bStart = typeof booking.startTime === 'string' ? parseISO(booking.startTime) : booking.startTime;
          const bEnd = typeof booking.endTime === 'string' ? parseISO(booking.endTime) : booking.endTime;
          // Overlap: slotStart < bEnd && slotEnd > bStart
          return slotWithBufferStart < bEnd && slotWithBufferEnd > bStart;
        });

        if (isPastNotice && !hasConflict) {
          slots.push({
            time12: format(currentSlotTime, 'hh:mm a'),
            time24: format(currentSlotTime, 'HH:mm'),
            isoString: currentSlotTime.toISOString(),
            isAvailable: true
          });
        }

        currentSlotTime = addMinutes(currentSlotTime, stepMinutes);
      }
    }

    return slots;
  }
};
