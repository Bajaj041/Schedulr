import type { EventType, Booking } from '../types';
import { StorageService } from './localStorage';
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

export const slotEngine = {
  /**
   * Check if a specific date has any available working time
   */
  isDateAvailable: (targetDate: Date, event: EventType): boolean => {
    const now = new Date();
    const today = startOfDay(now);
    const targetDay = startOfDay(targetDate);

    // Cannot book in the past
    if (targetDay < today) return false;

    // Check maximum booking window in future
    if (targetDay > addDays(today, event.maxDaysInFuture || 60)) return false;

    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const availability = StorageService.getAvailability();

    // 1. Check Date Overrides
    const override = availability.overrides.find(o => o.date === dateStr);
    if (override) {
      return override.isAvailable && (override.slots ? override.slots.length > 0 : false);
    }

    // 2. Check Weekly Schedule
    const dayOfWeek = targetDate.getDay();
    const dayConfig = availability.weeklyHours.find(d => d.dayOfWeek === dayOfWeek);
    return !!dayConfig && dayConfig.isEnabled && dayConfig.slots.length > 0;
  },

  /**
   * Calculate all open time slots for a specific date
   */
  getAvailableSlotsForDate: (targetDate: Date, event: EventType): AvailableSlot[] => {
    if (!slotEngine.isDateAvailable(targetDate, event)) {
      return [];
    }

    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const availability = StorageService.getAvailability();
    const now = new Date();
    const minimumAllowedTime = addHours(now, event.minimumNoticeHours || 0);

    // Get applicable time ranges for this date
    let timeRanges: { start: string; end: string }[] = [];
    const override = availability.overrides.find(o => o.date === dateStr);

    if (override && override.isAvailable && override.slots) {
      timeRanges = override.slots;
    } else {
      const dayOfWeek = targetDate.getDay();
      const dayConfig = availability.weeklyHours.find(d => d.dayOfWeek === dayOfWeek);
      if (dayConfig && dayConfig.isEnabled) {
        timeRanges = dayConfig.slots;
      }
    }

    if (timeRanges.length === 0) return [];

    // Get existing bookings for this host/date
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    const existingBookings = StorageService.getBookings().filter(b => {
      if (b.status === 'cancelled') return false;
      const bTime = parseISO(b.startTime);
      return bTime >= dayStart && bTime <= dayEnd;
    });

    const bufferBefore = Math.max(event.bufferBeforeMinutes || 0, availability.bufferBeforeMinutes || 0);
    const bufferAfter = Math.max(event.bufferAfterMinutes || 0, availability.bufferAfterMinutes || 0);
    const duration = event.durationMinutes;
    const stepMinutes = duration <= 30 ? 30 : 30; // 30 min increments

    const slots: AvailableSlot[] = [];

    for (const range of timeRanges) {
      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);

      let currentSlotTime = setMinutes(setHours(targetDate, startHour), startMin);
      const rangeEndTime = setMinutes(setHours(targetDate, endHour), endMin);

      while (true) {
        const slotEndTime = addMinutes(currentSlotTime, duration);

        // If slot exceeds the range end time, stop
        if (isAfter(slotEndTime, rangeEndTime)) break;

        // Check if slot is in the future past minimum notice
        const isPastNotice = isAfter(currentSlotTime, minimumAllowedTime);

        // Check conflict with existing bookings
        const slotWithBufferStart = addMinutes(currentSlotTime, -bufferBefore);
        const slotWithBufferEnd = addMinutes(slotEndTime, bufferAfter);

        const hasConflict = existingBookings.some(booking => {
          const bStart = parseISO(booking.startTime);
          const bEnd = parseISO(booking.endTime);
          // Check overlap: slotStart < bEnd && slotEnd > bStart
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

        // Advance to next slot increment
        currentSlotTime = addMinutes(currentSlotTime, stepMinutes);
      }
    }

    return slots;
  }
};
