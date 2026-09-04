import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { userId: req.user!.id }
    });
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:provider/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const provider = req.params.provider as string;
    const { isConnected, connectedEmail } = req.body;

    const integration = await prisma.integration.findFirst({
      where: { userId: req.user!.id, provider }
    });

    if (!integration) {
      res.status(404).json({ message: 'Integration not found' });
      return;
    }

    const updated = await prisma.integration.update({
      where: { id: integration.id },
      data: {
        isConnected: Boolean(isConnected),
        connectedEmail: isConnected ? (connectedEmail || integration.connectedEmail) : null,
        connectedAt: isConnected ? new Date() : null
      }
    });

    // Also sync user record if Google
    if (provider === 'google_calendar' || provider === 'google_meet') {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          isGoogleConnected: Boolean(isConnected),
          googleEmail: isConnected ? (connectedEmail || integration.connectedEmail) : null
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error toggling integration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
