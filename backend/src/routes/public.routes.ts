import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { serverSlotEngine } from '../services/slotEngine.js';
import { googleCalendarService } from '../services/googleCalendar.js';
import { emailService } from '../services/emailService.js';
import { addMinutes, parseISO, startOfDay, endOfDay } from 'date-fns';

const router = Router();

// Get public host profile and active event types
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const username = (req.params.username as string).toLowerCase();

    const host = await prisma.user.findFirst({
      where: { username }
    });

    if (!host) {
      res.status(404).json({ message: 'Host not found' });
      return;
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: host.id, isActive: true },
      orderBy: { durationMinutes: 'asc' }
    });

    res.json({
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        username: host.username,
        avatarUrl: host.avatarUrl,
        bio: host.bio,
        timezone: host.timezone,
        isGoogleConnected: host.isGoogleConnected
      },
      eventTypes: eventTypes.map(e => ({
        ...e,
        customQuestions: JSON.parse(e.customQuestions || '[]'),
        createdAt: e.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error in public host profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get public event details by username and slug
router.get('/:username/:eventSlug', async (req: Request, res: Response) => {
  try {
    const username = (req.params.username as string).toLowerCase();
    const eventSlug = (req.params.eventSlug as string).toLowerCase();

    const host = await prisma.user.findFirst({
      where: { username }
    });

    if (!host) {
      res.status(404).json({ message: 'Host not found' });
      return;
    }

    const event = await prisma.eventType.findFirst({
      where: { userId: host.id, slug: eventSlug }
    });

    if (!event) {
      res.status(404).json({ message: 'Event type not found' });
      return;
    }

    res.json({
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        username: host.username,
        avatarUrl: host.avatarUrl,
        bio: host.bio,
        timezone: host.timezone,
        isGoogleConnected: host.isGoogleConnected
      },
      event: {
        ...event,
        customQuestions: JSON.parse(event.customQuestions || '[]'),
        createdAt: event.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in public event details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Calculate available slots for date
router.get('/:username/:eventSlug/slots', async (req: Request, res: Response) => {
  try {
    const username = (req.params.username as string).toLowerCase();
    const eventSlug = (req.params.eventSlug as string).toLowerCase();
    const { date } = req.query; // "YYYY-MM-DD"

    if (!date || typeof date !== 'string') {
      res.status(400).json({ message: 'Target date query param is required (YYYY-MM-DD)' });
      return;
    }

    const host = await prisma.user.findFirst({
      where: { username }
    });

    if (!host) {
      res.status(404).json({ message: 'Host not found' });
      return;
    }

    const event = await prisma.eventType.findFirst({
      where: { userId: host.id, slug: eventSlug }
    });

    if (!event || !event.isActive) {
      res.status(404).json({ message: 'Event not available' });
      return;
    }

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: host.id, isDefault: true },
      include: { overrides: true }
    });

    if (!schedule) {
      res.json([]);
      return;
    }

    const targetDate = new Date(`${date}T00:00:00`);

    // Fetch existing bookings for this host
    const existingBookings = await prisma.booking.findMany({
      where: {
        hostId: host.id,
        status: { not: 'cancelled' },
        startTime: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate)
        }
      }
    });

    const parsedWeeklyHours = JSON.parse(schedule.weeklyHours);
    const parsedOverrides = schedule.overrides.map(o => ({
      date: o.date,
      isAvailable: o.isAvailable,
      slots: o.slots ? JSON.parse(o.slots) : undefined,
      reason: o.reason || undefined
    }));

    const slots = serverSlotEngine.getAvailableSlotsForDate(
      targetDate,
      {
        durationMinutes: event.durationMinutes,
        bufferBeforeMinutes: event.bufferBeforeMinutes,
        bufferAfterMinutes: event.bufferAfterMinutes,
        minimumNoticeHours: event.minimumNoticeHours,
        maxDaysInFuture: event.maxDaysInFuture
      },
      {
        weeklyHours: parsedWeeklyHours,
        overrides: parsedOverrides,
        bufferBeforeMinutes: schedule.bufferBeforeMinutes,
        bufferAfterMinutes: schedule.bufferAfterMinutes
      },
      existingBookings
    );

    res.json(slots);
  } catch (error) {
    console.error('Error computing public slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new public booking with race condition prevention
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const {
      eventTypeId,
      startTime,
      timezone,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      attendeeNotes,
      customAnswers
    } = req.body;

    if (!eventTypeId || !startTime || !attendeeName || !attendeeEmail) {
      res.status(400).json({ message: 'Missing required booking fields' });
      return;
    }

    const event = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true }
    });

    if (!event) {
      res.status(404).json({ message: 'Event type not found' });
      return;
    }

    const host = event.user;
    const startDate = parseISO(startTime);
    const endDate = addMinutes(startDate, event.durationMinutes);

    // Atomic transaction to ensure slot hasn't been taken in parallel
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          hostId: host.id,
          status: { not: 'cancelled' },
          startTime: { lt: endDate },
          endTime: { gt: startDate }
        }
      });

      if (conflict) {
        throw new Error('SLOT_ALREADY_TAKEN');
      }

      // Generate Meeting URL and optionally Google Calendar event
      const calRes = await googleCalendarService.createCalendarEvent({
        refreshToken: host.googleRefreshToken,
        summary: `${event.title} with ${attendeeName}`,
        description: `Booking scheduled via Schedulr.\nAttendee Notes: ${attendeeNotes || 'None'}`,
        startTime: startDate,
        endTime: endDate,
        attendeeEmail,
        attendeeName,
        hostEmail: host.email
      });

      const newBooking = await tx.booking.create({
        data: {
          eventTypeId: event.id,
          eventTitle: event.title,
          eventDuration: event.durationMinutes,
          hostId: host.id,
          hostName: host.name,
          hostEmail: host.email,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          attendeeNotes,
          customAnswers: customAnswers ? JSON.stringify(customAnswers) : null,
          startTime: startDate,
          endTime: endDate,
          timezone: timezone || host.timezone,
          status: 'confirmed',
          meetingUrl: calRes.meetingUrl,
          locationType: event.locationType,
          googleEventId: calRes.googleEventId
        }
      });

      // Add Host Notification
      await tx.appNotification.create({
        data: {
          userId: host.id,
          title: 'New Booking Confirmed',
          message: `${attendeeName} scheduled "${event.title}" for ${startDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
          type: 'booking',
          bookingId: newBooking.id
        }
      });

      return newBooking;
    });

    // Send confirmation email asynchronously
    emailService.sendBookingConfirmation({
      bookingId: booking.id,
      eventTitle: booking.eventTitle,
      startTime: startDate,
      endTime: endDate,
      hostName: booking.hostName,
      hostEmail: booking.hostEmail,
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      meetingUrl: booking.meetingUrl
    }).catch(err => console.warn('Email dispatch warning:', err));

    res.status(201).json({
      ...booking,
      customAnswers: booking.customAnswers ? JSON.parse(booking.customAnswers) : undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      createdAt: booking.createdAt.toISOString()
    });
  } catch (error: any) {
    if (error.message === 'SLOT_ALREADY_TAKEN') {
      res.status(409).json({ message: 'The selected time slot is no longer available. Please select another time.' });
      return;
    }
    console.error('Error creating public booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get booking details for Public Reschedule & Cancel views
router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
        host: true
      }
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({
      booking: {
        ...booking,
        customAnswers: booking.customAnswers ? JSON.parse(booking.customAnswers) : undefined,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        createdAt: booking.createdAt.toISOString(),
      },
      host: {
        id: booking.host.id,
        name: booking.host.name,
        email: booking.host.email,
        username: booking.host.username,
        avatarUrl: booking.host.avatarUrl,
        timezone: booking.host.timezone
      },
      eventType: booking.eventType ? {
        ...booking.eventType,
        customQuestions: JSON.parse(booking.eventType.customQuestions || '[]'),
        createdAt: booking.eventType.createdAt.toISOString()
      } : null
    });
  } catch (error) {
    console.error('Error fetching public booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public Guest Reschedule
router.post('/bookings/:id/reschedule', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { newStartTime } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const startDate = parseISO(newStartTime);
    const endDate = addMinutes(startDate, booking.eventDuration);

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        startTime: startDate,
        endTime: endDate,
        status: 'confirmed'
      }
    });

    await prisma.appNotification.create({
      data: {
        userId: booking.hostId,
        title: 'Booking Rescheduled',
        message: `${updated.attendeeName} rescheduled "${updated.eventTitle}" to ${startDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
        type: 'reschedule',
        bookingId: updated.id
      }
    });

    res.json({
      ...updated,
      customAnswers: updated.customAnswers ? JSON.parse(updated.customAnswers) : undefined,
      startTime: updated.startTime.toISOString(),
      endTime: updated.endTime.toISOString(),
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error in public reschedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public Guest Cancel
router.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelReason: reason || 'Cancelled by attendee'
      }
    });

    await prisma.appNotification.create({
      data: {
        userId: booking.hostId,
        title: 'Booking Cancelled',
        message: `Booking with ${updated.attendeeName} for "${updated.eventTitle}" was cancelled.`,
        type: 'cancellation',
        bookingId: updated.id
      }
    });

    res.json({
      ...updated,
      customAnswers: updated.customAnswers ? JSON.parse(updated.customAnswers) : undefined,
      startTime: updated.startTime.toISOString(),
      endTime: updated.endTime.toISOString(),
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error in public cancel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
