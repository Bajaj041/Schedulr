import { TeamMember } from '../types';
import { StorageService } from './localStorage';
import { api } from './api';

export const teamService = {
  getAll: (): TeamMember[] => {
    return StorageService.getTeam();
  },

  fetchAll: async (): Promise<TeamMember[]> => {
    try {
      const list = await api.get<TeamMember[]>('/team');
      if (Array.isArray(list)) {
        StorageService.setTeam(list);
        return list;
      }
    } catch {}
    return StorageService.getTeam();
  },

  addMember: (data: { name: string; email: string; role: 'Admin' | 'Member' }): TeamMember => {
    const list = StorageService.getTeam();
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'Invited',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    StorageService.setTeam([...list, newMember]);

    api.post<TeamMember>('/team', data).catch(() => {});

    return newMember;
  },

  updateRole: (id: string, role: 'Admin' | 'Member'): TeamMember => {
    const list = StorageService.getTeam();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const updated = { ...list[index], role };
    list[index] = updated;
    StorageService.setTeam([...list]);

    api.put(`/team/${id}/role`, { role }).catch(() => {});

    return updated;
  },

  removeMember: (id: string): void => {
    const list = StorageService.getTeam();
    StorageService.setTeam(list.filter(m => m.id !== id));

    api.delete(`/team/${id}`).catch(() => {});
  }
};
