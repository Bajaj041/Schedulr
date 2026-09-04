import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const WEEKLY_HOURS = [
  {
    dayOfWeek: 0,
    dayName: 'Sunday',
    isEnabled: false,
    slots: []
  },
  {
    dayOfWeek: 1,
    dayName: 'Monday',
    isEnabled: true,
    slots: [{ start: '09:00', end: '17:00' }]
  },
  {
    dayOfWeek: 2,
    dayName: 'Tuesday',
    isEnabled: true,
    slots: [{ start: '09:00', end: '17:00' }]
  },
  {
    dayOfWeek: 3,
    dayName: 'Wednesday',
    isEnabled: true,
    slots: [{ start: '09:00', end: '17:00' }]
  },
  {
    dayOfWeek: 4,
    dayName: 'Thursday',
    isEnabled: true,
    slots: [{ start: '09:00', end: '17:00' }]
  },
  {
    dayOfWeek: 5,
    dayName: 'Friday',
    isEnabled: true,
    slots: [{ start: '09:00', end: '16:00' }]
  },
  {
    dayOfWeek: 6,
    dayName: 'Saturday',
    isEnabled: false,
    slots: []
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables
  await prisma.appNotification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Default User
  const user = await prisma.user.create({
    data: {
      id: 'usr_001',
      name: 'Aditya Bajaj',
      email: 'aditya@work.com',
      passwordHash: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      username: 'aditya',
      role: 'Owner',
      timezone: 'Asia/Kolkata',
      bio: 'Product Designer & Engineering Student building sleek, modern productivity tools.',
      isGoogleConnected: true,
      googleEmail: 'aditya@work.com',
    }
  });

  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // 2. Create Event Types
  const event1 = await prisma.eventType.create({
    data: {
      id: 'evt_15min',
      userId: user.id,
      title: 'Quick Catchup',
      slug: '15min',
      description: 'A brief 15-minute sync or coffee chat for quick alignment, introductions, or Q&A.',
      durationMinutes: 15,
      color: '#f59e0b',
      locationType: 'google_meet',
      isActive: true,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      minimumNoticeHours: 1,
      maxDaysInFuture: 30,
      customQuestions: JSON.stringify([
        {
          id: 'q1',
          label: 'What would you like to discuss?',
          type: 'textarea',
          required: true
        }
      ])
    }
  });

  const event2 = await prisma.eventType.create({
    data: {
      id: 'evt_30min',
      userId: user.id,
      title: '30-Minute Strategy Session',
      slug: '30min',
      description: 'Standard deep-dive meeting to discuss product requirements, roadmap reviews, or technical architecture.',
      durationMinutes: 30,
      color: '#fbbf24',
      locationType: 'google_meet',
      isActive: true,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 15,
      minimumNoticeHours: 2,
      maxDaysInFuture: 60,
      customQuestions: JSON.stringify([
        {
          id: 'q1',
          label: 'Company or Project Name',
          type: 'text',
          required: true
        },
        {
          id: 'q2',
          label: 'Meeting Agenda / Topic',
          type: 'textarea',
          required: true
        },
        {
          id: 'q3',
          label: 'How did you hear about me?',
          type: 'select',
          required: false,
          options: ['Twitter / X', 'LinkedIn', 'GitHub', 'Referral', 'Other']
        }
      ])
    }
  });

  const event3 = await prisma.eventType.create({
    data: {
      id: 'evt_60min',
      userId: user.id,
      title: '1-Hour Architecture & Code Review',
      slug: '60min',
      description: 'In-depth comprehensive technical consultation, system architecture review, or live pair programming.',
      durationMinutes: 60,
      color: '#d97706',
      locationType: 'google_meet',
      isActive: true,
      bufferBeforeMinutes: 10,
      bufferAfterMinutes: 20,
      minimumNoticeHours: 4,
      maxDaysInFuture: 45,
      customQuestions: JSON.stringify([
        {
          id: 'q1',
          label: 'GitHub Repo URL or Design Link',
          type: 'text',
          required: false
        },
        {
          id: 'q2',
          label: 'Detailed Context & Scope',
          type: 'textarea',
          required: true
        }
      ])
    }
  });

  console.log(`📅 Created 3 Event Types`);

  // 3. Create Availability Schedule
  const schedule = await prisma.availabilitySchedule.create({
    data: {
      id: 'sched_default',
      userId: user.id,
      name: 'Working Hours',
      isDefault: true,
      timezone: 'Asia/Kolkata',
      weeklyHours: JSON.stringify(WEEKLY_HOURS),
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 15,
    }
  });

  console.log(`⏰ Created Availability Schedule`);

  // 4. Create Integrations
  await prisma.integration.createMany({
    data: [
      {
        userId: user.id,
        provider: 'google_calendar',
        name: 'Google Calendar',
        category: 'calendar',
        icon: 'google_calendar',
        description: 'Sync your primary Google Calendar to auto-block busy times and create invites.',
        isConnected: true,
        connectedEmail: 'aditya@work.com',
        connectedAt: new Date(),
        syncConflicts: true,
        writeEvents: true
      },
      {
        userId: user.id,
        provider: 'google_meet',
        name: 'Google Meet',
        category: 'video',
        icon: 'google_meet',
        description: 'Automatically generate Google Meet links for confirmed bookings.',
        isConnected: true,
        connectedEmail: 'aditya@work.com',
        connectedAt: new Date(),
        syncConflicts: false,
        writeEvents: true
      },
      {
        userId: user.id,
        provider: 'zoom',
        name: 'Zoom Video',
        category: 'video',
        icon: 'zoom',
        description: 'Create unique Zoom meeting rooms for your virtual sessions.',
        isConnected: false,
        syncConflicts: false,
        writeEvents: false
      },
      {
        userId: user.id,
        provider: 'slack',
        name: 'Slack',
        category: 'communication',
        icon: 'slack',
        description: 'Receive instant notifications in your Slack channels on booking activity.',
        isConnected: false,
        syncConflicts: false,
        writeEvents: false
      }
    ]
  });

  console.log(`🔌 Created Integrations`);

  // 5. Create Sample Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        userId: user.id,
        name: 'Aditya Bajaj',
        email: 'aditya@work.com',
        role: 'Owner',
        status: 'Active',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-01-15'
      },
      {
        userId: user.id,
        name: 'Sarah Jenkins',
        email: 'sarah@designlab.io',
        role: 'Admin',
        status: 'Active',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-02-01'
      },
      {
        userId: user.id,
        name: 'Alex Rivera',
        email: 'alex@engineering.co',
        role: 'Member',
        status: 'Invited',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-02-28'
      }
    ]
  });

  console.log(`👥 Created Team Members`);

  // 6. Create Sample Bookings (Tomorrow & Day after)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 30);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 30, 0, 0);

  const dayAfterEnd = new Date(dayAfter);
  dayAfterEnd.setMinutes(dayAfterEnd.getMinutes() + 60);

  await prisma.booking.createMany({
    data: [
      {
        id: 'bkg_sample_1',
        eventTypeId: event2.id,
        eventTitle: '30-Minute Strategy Session',
        eventDuration: 30,
        hostId: user.id,
        hostName: user.name,
        hostEmail: user.email,
        attendeeName: 'Marcus Vance',
        attendeeEmail: 'marcus@startupfund.vc',
        attendeeNotes: 'Discussing Series A investor deck feedback and UI demo review.',
        startTime: tomorrow,
        endTime: tomorrowEnd,
        timezone: 'Asia/Kolkata',
        status: 'confirmed',
        meetingUrl: 'https://meet.google.com/abc-wxyz-qrs',
        locationType: 'google_meet'
      },
      {
        id: 'bkg_sample_2',
        eventTypeId: event3.id,
        eventTitle: '1-Hour Architecture & Code Review',
        eventDuration: 60,
        hostId: user.id,
        hostName: user.name,
        hostEmail: user.email,
        attendeeName: 'Elena Rostova',
        attendeeEmail: 'elena@techcorp.de',
        attendeeNotes: 'System architecture review and caching strategies with Redis.',
        startTime: dayAfter,
        endTime: dayAfterEnd,
        timezone: 'Asia/Kolkata',
        status: 'confirmed',
        meetingUrl: 'https://meet.google.com/def-uvwx-lmn',
        locationType: 'google_meet'
      }
    ]
  });

  console.log(`✅ Database successfully seeded!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
