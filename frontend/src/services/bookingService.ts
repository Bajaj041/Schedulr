import { Booking, BookingStatus } from '../types';
import { StorageService } from './localStorage';
import { notificationService } from './notificationService';
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns';
import { api } from './api';

// Helper to generate realistic Google Meet link
export const generateGoogleMeetLink = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${segment(3)}-${segment(4)}-${segment(3)}`;
};

export const bookingService = {
  getAll: (): Booking[] => {
    return StorageService.getBookings().sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  },

  fetchAll: async (): Promise<Booking[]> => {
    try {
      const list = await api.get<Booking[]>('/bookings');
      if (Array.isArray(list)) {
        StorageService.setBookings(list);
        return list;
      }
    } catch {}
    return bookingService.getAll();
  },

  getById: (id: string): Booking | undefined => {
    return StorageService.getBookings().find(b => b.id === id);
  },

  fetchPublicBooking: async (id: string): Promise<{ booking: Booking; host: any; eventType: any } | null> => {
    try {
      return await api.get<{ booking: Booking; host: any; eventType: any }>(`/public/bookings/${id}`);
    } catch {
      const localBooking = bookingService.getById(id);
      if (localBooking) {
        return {
          booking: localBooking,
          host: StorageService.getUser(),
          eventType: StorageService.getEventTypes().find(e => e.id === localBooking.eventTypeId) || null
        };
      }
      return null;
    }
  },

  getUpcoming: (): Booking[] => {
    const now = new Date();
    return StorageService.getBookings()
      .filter(b => b.status !== 'cancelled' && isAfter(parseISO(b.startTime), now))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },

  getPast: (): Booking[] => {
    const now = new Date();
    return StorageService.getBookings()
      .filter(b => b.status !== 'cancelled' && isBefore(parseISO(b.startTime), now))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  getCancelled: (): Booking[] => {
    return StorageService.getBookings()
      .filter(b => b.status === 'cancelled')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  getByDateRange: (start: Date, end: Date): Booking[] => {
    return StorageService.getBookings().filter(b => {
      if (b.status === 'cancelled') return false;
      const bStart = parseISO(b.startTime);
      return bStart >= start && bStart <= end;
    });
  },

  createBooking: (data: {
    eventTypeId: string;
    eventTitle: string;
    eventDuration: number;
    hostId: string;
    hostName: string;
    hostEmail: string;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
    attendeeNotes?: string;
    customAnswers?: Record<string, string>;
    startTime: string; // ISO
    timezone: string;
    locationType?: 'google_meet' | 'zoom' | 'phone' | 'in_person' | 'custom';
  }): Booking => {
    const startDate = parseISO(data.startTime);
    const endDate = addMinutes(startDate, data.eventDuration);
    
    const newBooking: Booking = {
      id: `bkg_${Date.now()}`,
      eventTypeId: data.eventTypeId,
      eventTitle: data.eventTitle,
      eventDuration: data.eventDuration,
      hostId: data.hostId,
      hostName: data.hostName,
      hostEmail: data.hostEmail,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      attendeePhone: data.attendeePhone,
      attendeeNotes: data.attendeeNotes,
      customAnswers: data.customAnswers,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      timezone: data.timezone,
      status: 'confirmed',
      meetingUrl: generateGoogleMeetLink(),
      locationType: data.locationType || 'google_meet',
      createdAt: new Date().toISOString(),
    };

    const currentList = StorageService.getBookings();
    StorageService.setBookings([newBooking, ...currentList]);

    // Create notification locally
    notificationService.add({
      title: 'New Booking Confirmed',
      message: `${newBooking.attendeeName} scheduled "${newBooking.eventTitle}" for ${new Date(newBooking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
      type: 'booking',
      bookingId: newBooking.id
    });

    // Call backend public booking API
    api.post<Booking>('/public/bookings', {
      eventTypeId: data.eventTypeId,
      startTime: data.startTime,
      timezone: data.timezone,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      attendeePhone: data.attendeePhone,
      attendeeNotes: data.attendeeNotes,
      customAnswers: data.customAnswers
    }).then(serverBooking => {
      if (serverBooking) {
        const updatedList = StorageService.getBookings().map(b => b.id === newBooking.id ? serverBooking : b);
        StorageService.setBookings(updatedList);
      }
    }).catch(() => {});

    return newBooking;
  },

  rescheduleBooking: (id: string, newStartTime: string): Booking => {
    const list = StorageService.getBookings();
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');

    const booking = list[index];
    const newStart = parseISO(newStartTime);
    const newEnd = addMinutes(newStart, booking.eventDuration);

    const updated: Booking = {
      ...booking,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
      status: 'confirmed',
    };

    list[index] = updated;
    StorageService.setBookings([...list]);

    notificationService.add({
      title: 'Booking Rescheduled',
      message: `${updated.attendeeName} rescheduled "${updated.eventTitle}" to ${new Date(updated.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
      type: 'reschedule',
      bookingId: updated.id
    });

    // Sync to backend
    api.post(`/public/bookings/${id}/reschedule`, { newStartTime }).catch(() => {
      api.patch(`/bookings/${id}/reschedule`, { newStartTime }).catch(() => {});
    });

    return updated;
  },

  cancelBooking: (id: string, reason?: string): Booking => {
    const list = StorageService.getBookings();
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');

    const booking = list[index];
    const updated: Booking = {
      ...booking,
      status: 'cancelled',
      cancelReason: reason || 'Cancelled by attendee/host'
    };

    list[index] = updated;
    StorageService.setBookings([...list]);

    notificationService.add({
      title: 'Booking Cancelled',
      message: `Booking with ${updated.attendeeName} for "${updated.eventTitle}" was cancelled.`,
      type: 'cancellation',
      bookingId: updated.id
    });

    // Sync to backend
    api.post(`/public/bookings/${id}/cancel`, { reason }).catch(() => {
      api.patch(`/bookings/${id}/cancel`, { reason }).catch(() => {});
    });

    return updated;
  },

  getAnalytics: () => {
    const all = StorageService.getBookings();
    const confirmed = all.filter(b => b.status === 'confirmed');
    const cancelled = all.filter(b => b.status === 'cancelled');

    const totalHours = confirmed.reduce((acc, curr) => acc + (curr.eventDuration / 60), 0);
    const conversionRate = all.length > 0 ? Math.round((confirmed.length / all.length) * 100) : 100;

    return {
      totalBookings: all.length,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      meetingHours: Math.round(totalHours * 10) / 10,
      completionRate: conversionRate,
      upcomingCount: bookingService.getUpcoming().length,
    };
  }
};
