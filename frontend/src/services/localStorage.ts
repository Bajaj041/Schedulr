import { 
  SEED_USER, 
  SEED_EVENT_TYPES, 
  getSeedBookings, 
  SEED_AVAILABILITY, 
  SEED_INTEGRATIONS, 
  SEED_TEAM, 
  SEED_NOTIFICATIONS 
} from '../data/seedData';
import { User, EventType, Booking, AvailabilitySchedule, Integration, TeamMember, AppNotification } from '../types';

export const STORAGE_KEYS = {
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
  // Initialize seed data on first visit
  initializeSeedData: (): void => {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      setStored(STORAGE_KEYS.USER, SEED_USER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH)) {
      setStored(STORAGE_KEYS.AUTH, true); // Default logged in for pleasant demo experience
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENT_TYPES)) {
      setStored(STORAGE_KEYS.EVENT_TYPES, SEED_EVENT_TYPES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      setStored(STORAGE_KEYS.BOOKINGS, getSeedBookings());
    }
    if (!localStorage.getItem(STORAGE_KEYS.AVAILABILITY)) {
      setStored(STORAGE_KEYS.AVAILABILITY, SEED_AVAILABILITY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTEGRATIONS)) {
      setStored(STORAGE_KEYS.INTEGRATIONS, SEED_INTEGRATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAM)) {
      setStored(STORAGE_KEYS.TEAM, SEED_TEAM);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    }
  },

  // Reset demo data
  resetDemoData: (): void => {
    setStored(STORAGE_KEYS.USER, SEED_USER);
    setStored(STORAGE_KEYS.AUTH, true);
    setStored(STORAGE_KEYS.EVENT_TYPES, SEED_EVENT_TYPES);
    setStored(STORAGE_KEYS.BOOKINGS, getSeedBookings());
    setStored(STORAGE_KEYS.AVAILABILITY, SEED_AVAILABILITY);
    setStored(STORAGE_KEYS.INTEGRATIONS, SEED_INTEGRATIONS);
    setStored(STORAGE_KEYS.TEAM, SEED_TEAM);
    setStored(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },

  // Generic Getters/Setters
  getUser: (): User => getStored<User>(STORAGE_KEYS.USER, SEED_USER),
  setUser: (user: User) => setStored(STORAGE_KEYS.USER, user),

  getAuth: (): boolean => getStored<boolean>(STORAGE_KEYS.AUTH, true),
  setAuth: (auth: boolean) => setStored(STORAGE_KEYS.AUTH, auth),

  getEventTypes: (): EventType[] => getStored<EventType[]>(STORAGE_KEYS.EVENT_TYPES, SEED_EVENT_TYPES),
  setEventTypes: (types: EventType[]) => setStored(STORAGE_KEYS.EVENT_TYPES, types),

  getBookings: (): Booking[] => getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []),
  setBookings: (bookings: Booking[]) => setStored(STORAGE_KEYS.BOOKINGS, bookings),

  getAvailability: (): AvailabilitySchedule => getStored<AvailabilitySchedule>(STORAGE_KEYS.AVAILABILITY, SEED_AVAILABILITY),
  setAvailability: (availability: AvailabilitySchedule) => setStored(STORAGE_KEYS.AVAILABILITY, availability),

  getIntegrations: (): Integration[] => getStored<Integration[]>(STORAGE_KEYS.INTEGRATIONS, SEED_INTEGRATIONS),
  setIntegrations: (integrations: Integration[]) => setStored(STORAGE_KEYS.INTEGRATIONS, integrations),

  getTeam: (): TeamMember[] => getStored<TeamMember[]>(STORAGE_KEYS.TEAM, SEED_TEAM),
  setTeam: (team: TeamMember[]) => setStored(STORAGE_KEYS.TEAM, team),

  getNotifications: (): AppNotification[] => getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
  setNotifications: (notifications: AppNotification[]) => setStored(STORAGE_KEYS.NOTIFICATIONS, notifications),
};
