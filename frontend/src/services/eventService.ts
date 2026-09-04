import { EventType } from '../types';
import { StorageService } from './localStorage';
import { api } from './api';

export const eventService = {
  getAll: (): EventType[] => {
    return StorageService.getEventTypes();
  },

  fetchAll: async (): Promise<EventType[]> => {
    try {
      const list = await api.get<EventType[]>('/events');
      if (Array.isArray(list) && list.length > 0) {
        StorageService.setEventTypes(list);
        return list;
      }
    } catch {}
    return StorageService.getEventTypes();
  },

  getActive: (): EventType[] => {
    return StorageService.getEventTypes().filter(e => e.isActive);
  },

  getById: (id: string): EventType | undefined => {
    return StorageService.getEventTypes().find(e => e.id === id);
  },

  getBySlug: (slug: string): EventType | undefined => {
    return StorageService.getEventTypes().find(e => e.slug.toLowerCase() === slug.toLowerCase());
  },

  create: (data: Omit<EventType, 'id' | 'createdAt'>): EventType => {
    const list = StorageService.getEventTypes();
    const newEvent: EventType = {
      ...data,
      id: `evt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    StorageService.setEventTypes([newEvent, ...list]);

    // Async sync with backend
    api.post<EventType>('/events', data).then(created => {
      const currentList = StorageService.getEventTypes().map(e => e.id === newEvent.id ? created : e);
      StorageService.setEventTypes(currentList);
    }).catch(() => {});

    return newEvent;
  },

  update: (id: string, updates: Partial<EventType>): EventType => {
    const list = StorageService.getEventTypes();
    const index = list.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event type not found');
    
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    StorageService.setEventTypes([...list]);

    // Async sync with backend
    api.put<EventType>(`/events/${id}`, updates).catch(() => {});

    return updated;
  },

  toggleActive: (id: string): EventType => {
    const list = StorageService.getEventTypes();
    const event = list.find(e => e.id === id);
    if (!event) throw new Error('Event type not found');
    
    const updated = { ...event, isActive: !event.isActive };
    const newList = list.map(e => e.id === id ? updated : e);
    StorageService.setEventTypes(newList);

    api.patch(`/events/${id}/toggle`).catch(() => {});

    return updated;
  },

  delete: (id: string): void => {
    const list = StorageService.getEventTypes();
    StorageService.setEventTypes(list.filter(e => e.id !== id));

    api.delete(`/events/${id}`).catch(() => {});
  }
};
