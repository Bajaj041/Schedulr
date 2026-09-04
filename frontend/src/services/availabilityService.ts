import { AvailabilitySchedule, DateOverride, DaySchedule } from '../types';
import { StorageService } from './localStorage';
import { api } from './api';

export const availabilityService = {
  getSchedule: (): AvailabilitySchedule => {
    return StorageService.getAvailability();
  },

  fetchSchedule: async (): Promise<AvailabilitySchedule> => {
    try {
      const schedule = await api.get<AvailabilitySchedule>('/availability');
      if (schedule && schedule.weeklyHours) {
        StorageService.setAvailability(schedule);
        return schedule;
      }
    } catch {}
    return StorageService.getAvailability();
  },

  updateWeeklyHours: (weeklyHours: DaySchedule[]): AvailabilitySchedule => {
    const current = StorageService.getAvailability();
    const updated = { ...current, weeklyHours };
    StorageService.setAvailability(updated);

    api.put('/availability/weekly', { weeklyHours }).catch(() => {});

    return updated;
  },

  updateBuffers: (bufferBeforeMinutes: number, bufferAfterMinutes: number): AvailabilitySchedule => {
    const current = StorageService.getAvailability();
    const updated = { ...current, bufferBeforeMinutes, bufferAfterMinutes };
    StorageService.setAvailability(updated);

    api.put('/availability/buffers', { bufferBeforeMinutes, bufferAfterMinutes }).catch(() => {});

    return updated;
  },

  updateTimezone: (timezone: string): AvailabilitySchedule => {
    const current = StorageService.getAvailability();
    const updated = { ...current, timezone };
    StorageService.setAvailability(updated);

    api.put('/availability/timezone', { timezone }).catch(() => {});

    return updated;
  },

  addDateOverride: (override: Omit<DateOverride, 'id'>): AvailabilitySchedule => {
    const current = StorageService.getAvailability();
    const newOverride: DateOverride = {
      ...override,
      id: `ovr_${Date.now()}`
    };
    const updated = {
      ...current,
      overrides: [...current.overrides.filter(o => o.date !== override.date), newOverride]
    };
    StorageService.setAvailability(updated);

    api.post<AvailabilitySchedule>('/availability/overrides', override).then(res => {
      if (res) StorageService.setAvailability(res);
    }).catch(() => {});

    return updated;
  },

  removeDateOverride: (id: string): AvailabilitySchedule => {
    const current = StorageService.getAvailability();
    const updated = {
      ...current,
      overrides: current.overrides.filter(o => o.id !== id)
    };
    StorageService.setAvailability(updated);

    api.delete(`/availability/overrides/${id}`).catch(() => {});

    return updated;
  }
};
