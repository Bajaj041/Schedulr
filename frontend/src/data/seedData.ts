import { User, EventType, Booking, AvailabilitySchedule, Integration, TeamMember, AppNotification } from '../types';
import { addDays, setHours, setMinutes, startOfDay, subDays } from 'date-fns';

export const SEED_USER: User = {
  id: 'usr_aditya_101',
  name: 'Aditya Bajaj',
  email: 'aditya@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  username: 'aditya',
  role: 'Product Lead & Founder',
  timezone: 'Asia/Kolkata',
  bio: 'A detailed discovery session to outline your product goals and strategize on your development roadmap.',
  isGoogleConnected: true,
  googleEmail: 'aditya@work.com',
  createdAt: new Date().toISOString(),
};

export const SEED_EVENT_TYPES: EventType[] = [
  {
    id: 'evt_30min_strategy',
    userId: 'usr_aditya_101',
    title: '30 Min Strategy & Discovery Session',
    slug: '30min',
    description: 'A detailed discovery session to outline your product goals and strategize on your development roadmap.',
    durationMinutes: 30,
    color: '#6366f1', // Indigo
    locationType: 'google_meet',
    isActive: true,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 10,
    minimumNoticeHours: 2,
    maxDaysInFuture: 30,
    customQuestions: [
      {
        id: 'q_agenda',
        label: 'Please share anything that will help prepare for our meeting',
        type: 'textarea',
        required: false,
      },
      {
        id: 'q_company',
        label: 'Company or Project Name',
        type: 'text',
        required: true,
      }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt_15min_chat',
    userId: 'usr_aditya_101',
    title: '15 Min Quick Chat',
    slug: '15min',
    description: 'Quick sync, intro chat, or brief catchup on ongoing initiatives.',
    durationMinutes: 15,
    color: '#3b82f6', // Blue
    locationType: 'google_meet',
    isActive: true,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    minimumNoticeHours: 1,
    maxDaysInFuture: 14,
    customQuestions: [
      {
        id: 'q_topic',
        label: 'What specific topic do you want to cover?',
        type: 'text',
        required: true,
      }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt_60min_deepdive',
    userId: 'usr_aditya_101',
    title: '60 Min Architecture Deep Dive',
    slug: '60min',
    description: 'Full architecture review, system design analysis, and technical implementation planning.',
    durationMinutes: 60,
    color: '#8b5cf6', // Violet
    locationType: 'google_meet',
    isActive: true,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    minimumNoticeHours: 4,
    maxDaysInFuture: 45,
    customQuestions: [
      {
        id: 'q_repo',
        label: 'Repository or Project URL (if applicable)',
        type: 'text',
        required: false,
      },
      {
        id: 'q_prep',
        label: 'Key challenges or goals for this deep dive',
        type: 'textarea',
        required: true,
      }
    ],
    createdAt: new Date().toISOString(),
  }
];

export const getSeedBookings = (): Booking[] => {
  const now = new Date();
  const day1 = addDays(now, 1);
  const day2 = addDays(now, 2);
  const day5 = addDays(now, 5);
  const day7 = addDays(now, 7);
  const pastDay2 = subDays(now, 2);

  return [
    {
      id: 'bkg_001',
      eventTypeId: 'evt_30min_strategy',
      eventTitle: '30 Min Strategy & Discovery Session',
      eventDuration: 30,
      hostId: 'usr_aditya_101',
      hostName: 'Aditya Bajaj',
      hostEmail: 'aditya@example.com',
      attendeeName: 'Sarah Chen',
      attendeeEmail: 'sarah.chen@techcorp.io',
      attendeePhone: '+1 (555) 234-5678',
      attendeeNotes: 'Excited to discuss our Q4 developer roadmap and scheduling automations.',
      customAnswers: {
        'Company or Project Name': 'TechCorp Systems'
      },
      startTime: setMinutes(setHours(day1, 10), 0).toISOString(),
      endTime: setMinutes(setHours(day1, 10), 30).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'confirmed',
      meetingUrl: 'https://meet.google.com/xyt-mnoq-abc',
      locationType: 'google_meet',
      createdAt: subDays(now, 1).toISOString(),
    },
    {
      id: 'bkg_002',
      eventTypeId: 'evt_30min_strategy',
      eventTitle: '30 Min Strategy & Discovery Session',
      eventDuration: 30,
      hostId: 'usr_aditya_101',
      hostName: 'Aditya Bajaj',
      hostEmail: 'aditya@example.com',
      attendeeName: 'Alex Rodriguez',
      attendeeEmail: 'alex.r@venturelabs.co',
      attendeeNotes: 'Product demo walkthrough and enterprise API integration.',
      customAnswers: {
        'Company or Project Name': 'VentureLabs'
      },
      startTime: setMinutes(setHours(day2, 14), 0).toISOString(),
      endTime: setMinutes(setHours(day2, 14), 30).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'confirmed',
      meetingUrl: 'https://meet.google.com/pqr-kjlz-vwt',
      locationType: 'google_meet',
      createdAt: subDays(now, 2).toISOString(),
    },
    {
      id: 'bkg_003',
      eventTypeId: 'evt_60min_deepdive',
      eventTitle: '60 Min Architecture Deep Dive',
      eventDuration: 60,
      hostId: 'usr_aditya_101',
      hostName: 'Aditya Bajaj',
      hostEmail: 'aditya@example.com',
      attendeeName: 'Elena Rostova',
      attendeeEmail: 'elena@cloudscale.net',
      attendeeNotes: 'Reviewing microservices architecture and zero-downtime database migrations.',
      customAnswers: {
        'Key challenges or goals for this deep dive': 'Database sharding strategies'
      },
      startTime: setMinutes(setHours(day5, 15), 30).toISOString(),
      endTime: setMinutes(setHours(day5, 16), 30).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'confirmed',
      meetingUrl: 'https://meet.google.com/zxc-vbnm-qwe',
      locationType: 'google_meet',
      createdAt: subDays(now, 3).toISOString(),
    },
    {
      id: 'bkg_004',
      eventTypeId: 'evt_15min_chat',
      eventTitle: '15 Min Quick Chat',
      eventDuration: 15,
      hostId: 'usr_aditya_101',
      hostName: 'Aditya Bajaj',
      hostEmail: 'aditya@example.com',
      attendeeName: 'Marcus Vance',
      attendeeEmail: 'marcus@startupfund.vc',
      attendeeNotes: 'Introductory chat regarding angel syndicate and ecosystem partnerships.',
      customAnswers: {
        'What specific topic do you want to cover?': 'Syndicate participation'
      },
      startTime: setMinutes(setHours(day7, 11), 30).toISOString(),
      endTime: setMinutes(setHours(day7, 11), 45).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'confirmed',
      meetingUrl: 'https://meet.google.com/asd-fghj-klz',
      locationType: 'google_meet',
      createdAt: subDays(now, 1).toISOString(),
    },
    {
      id: 'bkg_005',
      eventTypeId: 'evt_30min_strategy',
      eventTitle: '30 Min Strategy & Discovery Session',
      eventDuration: 30,
      hostId: 'usr_aditya_101',
      hostName: 'Aditya Bajaj',
      hostEmail: 'aditya@example.com',
      attendeeName: 'Jessica Wu',
      attendeeEmail: 'jessica@fintechglobal.com',
      attendeeNotes: 'Completed sync regarding automated onboarding.',
      customAnswers: {
        'Company or Project Name': 'FintechGlobal'
      },
      startTime: setMinutes(setHours(pastDay2, 16), 0).toISOString(),
      endTime: setMinutes(setHours(pastDay2, 16), 30).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'confirmed',
      meetingUrl: 'https://meet.google.com/jkl-iopu-ytr',
      locationType: 'google_meet',
      createdAt: subDays(now, 5).toISOString(),
    }
  ];
};

export const SEED_AVAILABILITY: AvailabilitySchedule = {
  id: 'avail_default_001',
  userId: 'usr_aditya_101',
  name: 'Working Hours (Default)',
  isDefault: true,
  timezone: 'Asia/Kolkata',
  bufferBeforeMinutes: 10,
  bufferAfterMinutes: 10,
  weeklyHours: [
    { dayOfWeek: 1, dayName: 'Monday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 2, dayName: 'Tuesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 3, dayName: 'Wednesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 4, dayName: 'Thursday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 5, dayName: 'Friday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 6, dayName: 'Saturday', isEnabled: false, slots: [] },
    { dayOfWeek: 0, dayName: 'Sunday', isEnabled: false, slots: [] },
  ],
  overrides: []
};

export const SEED_INTEGRATIONS: Integration[] = [
  {
    id: 'int_google_cal',
    provider: 'google_calendar',
    name: 'Google Calendar',
    category: 'calendar',
    icon: 'google_calendar',
    description: 'Sync availability, check real-time conflicts, and write confirmed bookings.',
    isConnected: true,
    connectedEmail: 'aditya@work.com',
    connectedAt: new Date().toISOString(),
    syncConflicts: true,
    writeEvents: true,
  },
  {
    id: 'int_google_meet',
    provider: 'google_meet',
    name: 'Google Meet',
    category: 'video',
    icon: 'google_meet',
    description: 'Auto-generate unique Google Meet video links for all scheduled appointments.',
    isConnected: true,
    connectedEmail: 'aditya@work.com',
    connectedAt: new Date().toISOString(),
  },
  {
    id: 'int_outlook_cal',
    provider: 'outlook_calendar',
    name: 'Outlook / Office 365',
    category: 'calendar',
    icon: 'outlook',
    description: 'Check conflicts and sync appointments with Microsoft Outlook calendar.',
    isConnected: false,
  },
  {
    id: 'int_zoom',
    provider: 'zoom',
    name: 'Zoom Video',
    category: 'video',
    icon: 'zoom',
    description: 'Automatically generate Zoom meeting rooms with passcode protection.',
    isConnected: false,
  },
  {
    id: 'int_stripe',
    provider: 'stripe',
    name: 'Stripe Payments',
    category: 'payment',
    icon: 'stripe',
    description: 'Accept paid appointments and deposit consultation fees securely.',
    isConnected: false,
  },
  {
    id: 'int_slack',
    provider: 'slack',
    name: 'Slack Notifications',
    category: 'communication',
    icon: 'slack',
    description: 'Receive real-time Slack channel alerts when attendees schedule or cancel.',
    isConnected: false,
  }
];

export const SEED_TEAM: TeamMember[] = [
  {
    id: 'tm_001',
    name: 'Aditya Bajaj',
    email: 'aditya@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Owner',
    status: 'Active',
    joinedAt: '2024-01-15'
  },
  {
    id: 'tm_002',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.io',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Active',
    joinedAt: '2024-03-10'
  },
  {
    id: 'tm_003',
    name: 'Alex Rodriguez',
    email: 'alex.r@venturelabs.co',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'Active',
    joinedAt: '2024-06-20'
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_001',
    title: 'New Booking Confirmed',
    message: 'Sarah Chen booked "30 Min Strategy & Discovery Session" for tomorrow at 10:00 AM.',
    type: 'booking',
    read: false,
    createdAt: new Date().toISOString(),
    bookingId: 'bkg_001'
  },
  {
    id: 'notif_002',
    title: 'Google Calendar Synced',
    message: 'Successfully checked conflicts for aditya@work.com.',
    type: 'system',
    read: true,
    createdAt: subDays(new Date(), 1).toISOString(),
  }
];
