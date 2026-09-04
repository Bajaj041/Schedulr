import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' }
    });
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role } = req.body;

    const member = await prisma.teamMember.create({
      data: {
        userId: req.user!.id,
        name,
        email,
        role: role || 'Member',
        status: 'Invited',
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        joinedAt: new Date().toISOString().split('T')[0]
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/role', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    const member = await prisma.teamMember.update({
      where: { id },
      data: { role }
    });

    res.json(member);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.teamMember.delete({ where: { id } });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
