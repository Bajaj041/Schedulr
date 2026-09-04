import { User, EventType, Booking, AvailabilitySchedule, Integration, TeamMember, AppNotification } from '../types';

export const STORAGE_KEYS = {
  VERSION: 'schedulr_storage_v3',
  AUTH: 'schedulr_auth',
  USER: 'schedulr_user',
  EVENT_TYPES: 'schedulr_event_types',
  BOOKINGS: 'schedulr_bookings',
  AVAILABILITY: 'schedulr_availability',
  INTEGRATIONS: 'schedulr_integrations',
  TEAM: 'schedulr_team',
  NOTIFICATIONS: 'schedulr_notifications',
  THEME: 'schedulr_theme',
};

const DEFAULT_USER: User = {
  id: 'user_1',
  name: 'Aditya Bajaj',
  email: 'aditya@work.com',
  username: 'aditya',
  role: 'Owner',
  timezone: 'Asia/Kolkata',
  bio: 'Product Designer & Engineering Lead. Booking product syncs, architectural reviews, and quick catch-ups.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isGoogleConnected: false,
  createdAt: new Date().toISOString(),
};

const DEFAULT_AVAILABILITY: AvailabilitySchedule = {
  id: 'sch_default',
  userId: 'user_1',
  name: 'Working Hours',
  isDefault: true,
  timezone: 'Asia/Kolkata',
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 15,
  weeklyHours: [
    { dayOfWeek: 0, dayName: 'Sunday', isEnabled: false, slots: [] },
    { dayOfWeek: 1, dayName: 'Monday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 2, dayName: 'Tuesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 3, dayName: 'Wednesday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 4, dayName: 'Thursday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { dayOfWeek: 5, dayName: 'Friday', isEnabled: true, slots: [{ start: '09:00', end: '16:00' }] },
    { dayOfWeek: 6, dayName: 'Saturday', isEnabled: false, slots: [] },
  ],
  overrides: [],
};

const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'int_1',
    provider: 'google_calendar',
    name: 'Google Calendar & Meet',
    category: 'calendar',
    icon: 'Calendar',
    description: 'Sync your Google Calendar to detect busy times and auto-generate real Google Meet links.',
    isConnected: false,
    syncConflicts: true,
    writeEvents: true,
  },
  {
    id: 'int_2',
    provider: 'outlook_calendar',
    name: 'Microsoft Outlook Calendar',
    category: 'calendar',
    icon: 'Calendar',
    description: 'Sync with Microsoft 365 or Outlook.com calendar to prevent double bookings.',
    isConnected: false,
    syncConflicts: true,
    writeEvents: true,
  },
  {
    id: 'int_3',
    provider: 'zoom',
    name: 'Zoom Video Conferencing',
    category: 'video',
    icon: 'Video',
    description: 'Automatically create Zoom meetings with unique passcodes for scheduled appointments.',
    isConnected: false,
    syncConflicts: false,
    writeEvents: false,
  },
  {
    id: 'int_4',
    provider: 'slack',
    name: 'Slack Notifications',
    category: 'communication',
    icon: 'MessageSquare',
    description: 'Receive real-time instant alerts in your Slack channels when bookings are scheduled or rescheduled.',
    isConnected: false,
    syncConflicts: false,
    writeEvents: false,
  }
];

// Safe JSON parser
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage key "${key}":`, e);
  }
}

export const StorageService = {
  // Initialize storage and clean out any legacy mock data
  initializeSeedData: (): void => {
    const isV3Clean = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!isV3Clean) {
      // Clear legacy sample bookings, team members, notifications, and events
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.TEAM);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.EVENT_TYPES);
      localStorage.setItem(STORAGE_KEYS.VERSION, '3.0');
    }

    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      setStored(STORAGE_KEYS.USER, DEFAULT_USER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH)) {
      setStored(STORAGE_KEYS.AUTH, true);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENT_TYPES)) {
      setStored(STORAGE_KEYS.EVENT_TYPES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      setStored(STORAGE_KEYS.BOOKINGS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AVAILABILITY)) {
      setStored(STORAGE_KEYS.AVAILABILITY, DEFAULT_AVAILABILITY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTEGRATIONS)) {
      setStored(STORAGE_KEYS.INTEGRATIONS, DEFAULT_INTEGRATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAM)) {
      setStored(STORAGE_KEYS.TEAM, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, []);
    }
  },

  // Clear data to empty state
  resetDemoData: (): void => {
    setStored(STORAGE_KEYS.EVENT_TYPES, []);
    setStored(STORAGE_KEYS.BOOKINGS, []);
    setStored(STORAGE_KEYS.TEAM, []);
    setStored(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  // Generic Getters/Setters
  getUser: (): User => getStored<User>(STORAGE_KEYS.USER, DEFAULT_USER),
  setUser: (user: User) => setStored(STORAGE_KEYS.USER, user),

  getAuth: (): boolean => getStored<boolean>(STORAGE_KEYS.AUTH, true),
  setAuth: (auth: boolean) => setStored(STORAGE_KEYS.AUTH, auth),

  getEventTypes: (): EventType[] => getStored<EventType[]>(STORAGE_KEYS.EVENT_TYPES, []),
  setEventTypes: (types: EventType[]) => setStored(STORAGE_KEYS.EVENT_TYPES, types),

  getBookings: (): Booking[] => getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []),
  setBookings: (bookings: Booking[]) => setStored(STORAGE_KEYS.BOOKINGS, bookings),

  getAvailability: (): AvailabilitySchedule => getStored<AvailabilitySchedule>(STORAGE_KEYS.AVAILABILITY, DEFAULT_AVAILABILITY),
  setAvailability: (availability: AvailabilitySchedule) => setStored(STORAGE_KEYS.AVAILABILITY, availability),

  getIntegrations: (): Integration[] => getStored<Integration[]>(STORAGE_KEYS.INTEGRATIONS, DEFAULT_INTEGRATIONS),
  setIntegrations: (integrations: Integration[]) => setStored(STORAGE_KEYS.INTEGRATIONS, integrations),

  getTeam: (): TeamMember[] => getStored<TeamMember[]>(STORAGE_KEYS.TEAM, []),
  setTeam: (team: TeamMember[]) => setStored(STORAGE_KEYS.TEAM, team),

  getNotifications: (): AppNotification[] => getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
  setNotifications: (notifications: AppNotification[]) => setStored(STORAGE_KEYS.NOTIFICATIONS, notifications),
};
