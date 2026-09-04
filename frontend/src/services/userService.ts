import { User } from '../types';
import { StorageService } from './localStorage';
import { api, setToken } from './api';

export const userService = {
  getCurrentUser: (): User => {
    return StorageService.getUser();
  },

  fetchCurrentUser: async (): Promise<User> => {
    try {
      const user = await api.get<User>('/auth/me');
      StorageService.setUser(user);
      return user;
    } catch {
      return StorageService.getUser();
    }
  },

  updateCurrentUser: (updates: Partial<User>): User => {
    const current = StorageService.getUser();
    const updated = { ...current, ...updates };
    StorageService.setUser(updated);

    // Sync to backend asynchronously
    api.put<User>('/auth/me', updates).catch(() => {});

    return updated;
  },

  isAuthenticated: (): boolean => {
    return StorageService.getAuth();
  },

  login: (email: string, password?: string): { success: boolean; user: User } => {
    const current = StorageService.getUser();
    const user = { ...current, email: email || current.email };
    StorageService.setUser(user);
    StorageService.setAuth(true);

    // Call backend login
    api.post<{ token: string; user: User }>('/auth/login', { email, password: password || 'password123' })
      .then(res => {
        if (res.token) {
          setToken(res.token);
          StorageService.setUser(res.user);
        }
      })
      .catch(() => {});

    return { success: true, user };
  },

  loginWithGoogle: (googleEmail: string = 'aditya@work.com', googleName: string = 'Aditya Bajaj'): User => {
    const current = StorageService.getUser();
    const updated: User = {
      ...current,
      name: googleName,
      email: googleEmail,
      isGoogleConnected: true,
      googleEmail: googleEmail,
    };
    StorageService.setUser(updated);
    StorageService.setAuth(true);
    
    // Also update Google Calendar integration
    const integrations = StorageService.getIntegrations();
    const updatedIntegrations = integrations.map(i => {
      if (i.provider === 'google_calendar' || i.provider === 'google_meet') {
        return {
          ...i,
          isConnected: true,
          connectedEmail: googleEmail,
          connectedAt: new Date().toISOString()
        };
      }
      return i;
    });
    StorageService.setIntegrations(updatedIntegrations);

    // Sync to backend
    api.patch('/integrations/google_calendar/toggle', { isConnected: true, connectedEmail: googleEmail }).catch(() => {});

    return updated;
  },

  logout: (): void => {
    StorageService.setAuth(false);
    setToken(null);
  },

  toggleGoogleSync: (connected: boolean, email?: string): User => {
    const current = StorageService.getUser();
    const updated = {
      ...current,
      isGoogleConnected: connected,
      googleEmail: connected ? (email || current.googleEmail || current.email) : undefined
    };
    StorageService.setUser(updated);
    
    // Update integration state
    const integrations = StorageService.getIntegrations();
    const updatedIntegrations = integrations.map(i => {
      if (i.provider === 'google_calendar' || i.provider === 'google_meet') {
        return {
          ...i,
          isConnected: connected,
          connectedEmail: connected ? updated.googleEmail : undefined,
          connectedAt: connected ? new Date().toISOString() : undefined
        };
      }
      return i;
    });
    StorageService.setIntegrations(updatedIntegrations);

    api.patch('/integrations/google_calendar/toggle', { isConnected: connected, connectedEmail: updated.googleEmail }).catch(() => {});
    
    return updated;
  }
};
