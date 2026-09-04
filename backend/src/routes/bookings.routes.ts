import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { addMinutes, parseISO } from 'date-fns';
import { emailService } from '../services/emailService.js';

const router = Router();

// Get all bookings for host
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { hostId: req.user!.id },
      orderBy: { startTime: 'desc' }
    });

    const parsed = bookings.map(b => ({
      ...b,
      customAnswers: b.customAnswers ? JSON.parse(b.customAnswers) : undefined,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      createdAt: b.createdAt.toISOString(),
      cancelReason: b.cancelReason || undefined,
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analytics summary
router.get('/analytics', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const all = await prisma.booking.findMany({
      where: { hostId: req.user!.id }
    });

    const confirmed = all.filter(b => b.status === 'confirmed');
    const cancelled = all.filter(b => b.status === 'cancelled');

    const now = new Date();
    const upcoming = confirmed.filter(b => new Date(b.startTime) > now);

    const totalHours = confirmed.reduce((acc, curr) => acc + (curr.eventDuration / 60), 0);
    const completionRate = all.length > 0 ? Math.round((confirmed.length / all.length) * 100) : 100;

    res.json({
      totalBookings: all.length,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      meetingHours: Math.round(totalHours * 10) / 10,
      completionRate,
      upcomingCount: upcoming.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reschedule booking
router.patch('/:id/reschedule', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { newStartTime } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id, hostId: req.user!.id }
    });

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

    // Create notification
    await prisma.appNotification.create({
      data: {
        userId: req.user!.id,
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
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id, hostId: req.user!.id }
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelReason: reason || 'Cancelled by host'
      }
    });

    await emailService.sendCancellationNotice({
      eventTitle: updated.eventTitle,
      hostName: updated.hostName,
      hostEmail: updated.hostEmail,
      attendeeName: updated.attendeeName,
      attendeeEmail: updated.attendeeEmail,
      reason: updated.cancelReason || undefined
    });

    // Create notification
    await prisma.appNotification.create({
      data: {
        userId: req.user!.id,
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
      createdAt: updated.createdAt.toISOString(),
      cancelReason: updated.cancelReason
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
