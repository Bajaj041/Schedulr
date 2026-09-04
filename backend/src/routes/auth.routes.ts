import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'schedulr_super_secret_jwt_key_2026_dev_prod';

// Register Host
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, username, timezone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: username || email.split('@')[0] }]
      }
    });

    if (existing) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanUsername = (username || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        username: cleanUsername,
        timezone: timezone || 'Asia/Kolkata',
      }
    });

    // Create default availability schedule
    await prisma.availabilitySchedule.create({
      data: {
        userId: user.id,
        name: 'Working Hours',
        isDefault: true,
        timezone: user.timezone,
        weeklyHours: JSON.stringify([
          { dayOfWeek: 0, dayName: 'Sunday', isEnabled: false, slots: [] },
          { dayOfWeek: 1, dayName: 'Monday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          { dayOfWeek: 2, dayName: 'Tuesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          { dayOfWeek: 3, dayName: 'Wednesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          { dayOfWeek: 4, dayName: 'Thursday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          { dayOfWeek: 5, dayName: 'Friday', isEnabled: true, slots: [{ start: '09:00', end: '16:00' }] },
          { dayOfWeek: 6, dayName: 'Saturday', isEnabled: false, slots: [] },
        ]),
      }
    });

    // Create default 30min event type
    await prisma.eventType.create({
      data: {
        userId: user.id,
        title: '30-Minute Meeting',
        slug: '30min',
        description: '30 minute meeting session.',
        durationMinutes: 30,
        color: '#f59e0b',
        locationType: 'google_meet',
        isActive: true,
        customQuestions: JSON.stringify([]),
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        username: user.username,
        role: user.role,
        timezone: user.timezone,
        bio: user.bio,
        isGoogleConnected: user.isGoogleConnected,
        googleEmail: user.googleEmail,
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Host
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }]
      }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.passwordHash && password) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        username: user.username,
        role: user.role,
        timezone: user.timezone,
        bio: user.bio,
        isGoogleConnected: user.isGoogleConnected,
        googleEmail: user.googleEmail,
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Current User Profile (/auth/me)
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      username: user.username,
      role: user.role,
      timezone: user.timezone,
      bio: user.bio,
      isGoogleConnected: user.isGoogleConnected,
      googleEmail: user.googleEmail,
      createdAt: user.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Profile
router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, username, timezone, bio, avatarUrl, isGoogleConnected, googleEmail } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user?.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(timezone && { timezone }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(isGoogleConnected !== undefined && { isGoogleConnected }),
        ...(googleEmail !== undefined && { googleEmail }),
      }
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      username: user.username,
      role: user.role,
      timezone: user.timezone,
      bio: user.bio,
      isGoogleConnected: user.isGoogleConnected,
      googleEmail: user.googleEmail,
      createdAt: user.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error in update profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
