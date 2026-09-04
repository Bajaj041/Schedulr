import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all event types for current host
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = eventTypes.map(e => ({
      ...e,
      customQuestions: JSON.parse(e.customQuestions || '[]'),
      createdAt: e.createdAt.toISOString()
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create event type
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      durationMinutes,
      color,
      locationType,
      locationValue,
      isActive,
      bufferBeforeMinutes,
      bufferAfterMinutes,
      minimumNoticeHours,
      maxDaysInFuture,
      customQuestions,
      requiresConfirmation
    } = req.body;

    const cleanSlug = (slug || title.toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9_-]/g, '');

    const event = await prisma.eventType.create({
      data: {
        userId: req.user!.id,
        title,
        slug: cleanSlug,
        description: description || '',
        durationMinutes: durationMinutes || 30,
        color: color || '#f59e0b',
        locationType: locationType || 'google_meet',
        locationValue,
        isActive: isActive !== undefined ? isActive : true,
        bufferBeforeMinutes: bufferBeforeMinutes || 0,
        bufferAfterMinutes: bufferAfterMinutes || 15,
        minimumNoticeHours: minimumNoticeHours || 2,
        maxDaysInFuture: maxDaysInFuture || 60,
        customQuestions: JSON.stringify(customQuestions || []),
        requiresConfirmation: requiresConfirmation || false,
      }
    });

    res.status(201).json({
      ...event,
      customQuestions: JSON.parse(event.customQuestions),
      createdAt: event.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating event type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update event type
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      title,
      slug,
      description,
      durationMinutes,
      color,
      locationType,
      locationValue,
      isActive,
      bufferBeforeMinutes,
      bufferAfterMinutes,
      minimumNoticeHours,
      maxDaysInFuture,
      customQuestions,
      requiresConfirmation
    } = req.body;

    const existing = await prisma.eventType.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ message: 'Event type not found' });
      return;
    }

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(color && { color }),
        ...(locationType && { locationType }),
        ...(locationValue !== undefined && { locationValue }),
        ...(isActive !== undefined && { isActive }),
        ...(bufferBeforeMinutes !== undefined && { bufferBeforeMinutes }),
        ...(bufferAfterMinutes !== undefined && { bufferAfterMinutes }),
        ...(minimumNoticeHours !== undefined && { minimumNoticeHours }),
        ...(maxDaysInFuture !== undefined && { maxDaysInFuture }),
        ...(customQuestions !== undefined && { customQuestions: JSON.stringify(customQuestions) }),
        ...(requiresConfirmation !== undefined && { requiresConfirmation }),
      }
    });

    res.json({
      ...updated,
      customQuestions: JSON.parse(updated.customQuestions),
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating event type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle active status
router.patch('/:id/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const event = await prisma.eventType.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!event) {
      res.status(404).json({ message: 'Event type not found' });
      return;
    }

    const updated = await prisma.eventType.update({
      where: { id },
      data: { isActive: !event.isActive }
    });

    res.json({
      ...updated,
      customQuestions: JSON.parse(updated.customQuestions),
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error toggling event type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event type
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const event = await prisma.eventType.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!event) {
      res.status(404).json({ message: 'Event type not found' });
      return;
    }

    await prisma.eventType.delete({ where: { id } });

    res.json({ success: true, message: 'Event type deleted' });
  } catch (error) {
    console.error('Error deleting event type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
