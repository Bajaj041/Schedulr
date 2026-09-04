import { AppNotification } from '../types';
import { StorageService } from './localStorage';
import { api } from './api';

export const notificationService = {
  getAll: (): AppNotification[] => {
    return StorageService.getNotifications();
  },

  fetchAll: async (): Promise<AppNotification[]> => {
    try {
      const list = await api.get<AppNotification[]>('/notifications');
      if (Array.isArray(list)) {
        StorageService.setNotifications(list);
        return list;
      }
    } catch {}
    return StorageService.getNotifications();
  },

  getUnreadCount: (): number => {
    return StorageService.getNotifications().filter(n => !n.read).length;
  },

  markAllAsRead: (): void => {
    const list = StorageService.getNotifications().map(n => ({ ...n, read: true }));
    StorageService.setNotifications(list);

    api.patch('/notifications/read-all').catch(() => {});
  },

  markAsRead: (id: string): void => {
    const list = StorageService.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    StorageService.setNotifications(list);

    api.patch(`/notifications/${id}/read`).catch(() => {});
  },

  add: (data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification => {
    const list = StorageService.getNotifications();
    const newNotification: AppNotification = {
      ...data,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    StorageService.setNotifications([newNotification, ...list]);
    return newNotification;
  },

  clearAll: (): void => {
    StorageService.setNotifications([]);

    api.delete('/notifications').catch(() => {});
  }
};
