import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.appNotification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications.map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.appNotification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const notification = await prisma.appNotification.update({
      where: { id },
      data: { read: true }
    });
    res.json({
      ...notification,
      createdAt: notification.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.appNotification.deleteMany({
      where: { userId: req.user!.id }
    });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
