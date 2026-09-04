import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get availability schedule + overrides for current host
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    let schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true },
      include: { overrides: true }
    });

    if (!schedule) {
      schedule = await prisma.availabilitySchedule.create({
        data: {
          userId: req.user!.id,
          name: 'Working Hours',
          isDefault: true,
          timezone: 'Asia/Kolkata',
          weeklyHours: JSON.stringify([
            { dayOfWeek: 0, dayName: 'Sunday', isEnabled: false, slots: [] },
            { dayOfWeek: 1, dayName: 'Monday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            { dayOfWeek: 2, dayName: 'Tuesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            { dayOfWeek: 3, dayName: 'Wednesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            { dayOfWeek: 4, dayName: 'Thursday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            { dayOfWeek: 5, dayName: 'Friday', isEnabled: true, slots: [{ start: '09:00', end: '16:00' }] },
            { dayOfWeek: 6, dayName: 'Saturday', isEnabled: false, slots: [] },
          ]),
        },
        include: { overrides: true }
      });
    }

    res.json({
      id: schedule.id,
      userId: schedule.userId,
      name: schedule.name,
      isDefault: schedule.isDefault,
      timezone: schedule.timezone,
      weeklyHours: JSON.parse(schedule.weeklyHours),
      bufferBeforeMinutes: schedule.bufferBeforeMinutes,
      bufferAfterMinutes: schedule.bufferAfterMinutes,
      overrides: schedule.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update weekly schedule
router.put('/weekly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { weeklyHours } = req.body;

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    const updated = await prisma.availabilitySchedule.update({
      where: { id: schedule.id },
      data: { weeklyHours: JSON.stringify(weeklyHours) },
      include: { overrides: true }
    });

    res.json({
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      isDefault: updated.isDefault,
      timezone: updated.timezone,
      weeklyHours: JSON.parse(updated.weeklyHours),
      bufferBeforeMinutes: updated.bufferBeforeMinutes,
      bufferAfterMinutes: updated.bufferAfterMinutes,
      overrides: updated.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error updating weekly hours:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update buffers
router.put('/buffers', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bufferBeforeMinutes, bufferAfterMinutes } = req.body;

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    const updated = await prisma.availabilitySchedule.update({
      where: { id: schedule.id },
      data: {
        bufferBeforeMinutes: Number(bufferBeforeMinutes) || 0,
        bufferAfterMinutes: Number(bufferAfterMinutes) || 0
      },
      include: { overrides: true }
    });

    res.json({
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      isDefault: updated.isDefault,
      timezone: updated.timezone,
      weeklyHours: JSON.parse(updated.weeklyHours),
      bufferBeforeMinutes: updated.bufferBeforeMinutes,
      bufferAfterMinutes: updated.bufferAfterMinutes,
      overrides: updated.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error updating buffers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update timezone
router.put('/timezone', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { timezone } = req.body;

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    const updated = await prisma.availabilitySchedule.update({
      where: { id: schedule.id },
      data: { timezone },
      include: { overrides: true }
    });

    res.json({
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      isDefault: updated.isDefault,
      timezone: updated.timezone,
      weeklyHours: JSON.parse(updated.weeklyHours),
      bufferBeforeMinutes: updated.bufferBeforeMinutes,
      bufferAfterMinutes: updated.bufferAfterMinutes,
      overrides: updated.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error updating timezone:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add or replace date override
router.post('/overrides', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, isAvailable, slots, reason } = req.body;

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Delete existing override for this date if present
    await prisma.dateOverride.deleteMany({
      where: { scheduleId: schedule.id, date }
    });

    await prisma.dateOverride.create({
      data: {
        scheduleId: schedule.id,
        date,
        isAvailable: isAvailable ?? false,
        slots: slots ? JSON.stringify(slots) : null,
        reason: reason || null
      }
    });

    const refreshed = await prisma.availabilitySchedule.findUnique({
      where: { id: schedule.id },
      include: { overrides: true }
    });

    res.status(201).json({
      id: refreshed!.id,
      userId: refreshed!.userId,
      name: refreshed!.name,
      isDefault: refreshed!.isDefault,
      timezone: refreshed!.timezone,
      weeklyHours: JSON.parse(refreshed!.weeklyHours),
      bufferBeforeMinutes: refreshed!.bufferBeforeMinutes,
      bufferAfterMinutes: refreshed!.bufferAfterMinutes,
      overrides: refreshed!.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error adding date override:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete date override
router.delete('/overrides/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    await prisma.dateOverride.deleteMany({
      where: { id, scheduleId: schedule.id }
    });

    const refreshed = await prisma.availabilitySchedule.findUnique({
      where: { id: schedule.id },
      include: { overrides: true }
    });

    res.json({
      id: refreshed!.id,
      userId: refreshed!.userId,
      name: refreshed!.name,
      isDefault: refreshed!.isDefault,
      timezone: refreshed!.timezone,
      weeklyHours: JSON.parse(refreshed!.weeklyHours),
      bufferBeforeMinutes: refreshed!.bufferBeforeMinutes,
      bufferAfterMinutes: refreshed!.bufferAfterMinutes,
      overrides: refreshed!.overrides.map(o => ({
        id: o.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots ? JSON.parse(o.slots) : undefined,
        reason: o.reason || undefined
      }))
    });
  } catch (error) {
    console.error('Error removing date override:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
