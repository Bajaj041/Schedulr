export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  username: string;
  role: string;
  timezone: string;
  bio?: string;
  isGoogleConnected: boolean;
  googleEmail?: string;
  createdAt: string;
}

export type LocationType = 'google_meet' | 'zoom' | 'phone' | 'in_person' | 'custom';

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface EventType {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  color: string;
  locationType: LocationType;
  locationValue?: string;
  isActive: boolean;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeHours: number;
  maxDaysInFuture: number;
  customQuestions: CustomQuestion[];
  requiresConfirmation?: boolean;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled';

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTitle: string;
  eventDuration: number;
  hostId: string;
  hostName: string;
  hostEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  attendeeNotes?: string;
  customAnswers?: Record<string, string>;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  timezone: string;
  status: BookingStatus;
  meetingUrl: string;
  locationType: LocationType;
  createdAt: string;
  cancelReason?: string;
}

export interface TimeRange {
  start: string; // "09:00" (24h)
  end: string;   // "17:00" (24h)
}

export interface DaySchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayName: string;
  isEnabled: boolean;
  slots: TimeRange[];
}

export interface DateOverride {
  id: string;
  date: string; // "YYYY-MM-DD"
  isAvailable: boolean;
  slots?: TimeRange[];
  reason?: string;
}

export interface AvailabilitySchedule {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  timezone: string;
  weeklyHours: DaySchedule[];
  overrides: DateOverride[];
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface Integration {
  id: string;
  provider: 'google_calendar' | 'outlook_calendar' | 'google_meet' | 'zoom' | 'stripe' | 'slack';
  name: string;
  category: 'calendar' | 'video' | 'payment' | 'communication';
  icon: string;
  description: string;
  isConnected: boolean;
  connectedEmail?: string;
  connectedAt?: string;
  syncConflicts?: boolean;
  writeEvents?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'Active' | 'Invited';
  joinedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'reschedule' | 'cancellation' | 'system';
  read: boolean;
  createdAt: string;
  bookingId?: string;
}
