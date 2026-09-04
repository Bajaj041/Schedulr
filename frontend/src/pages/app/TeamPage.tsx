import React, { useState } from 'react';
import { 
  Users2, 
  Plus, 
  Trash2, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';
import { teamService } from '../../services/teamService';
import { TeamMember } from '../../types';
import { useToast } from '../../context/ToastContext';

export const TeamPage: React.FC = () => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(() => teamService.getAll());
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newMember = teamService.addMember({ name, email, role });
    setMembers([...members, newMember]);
    setName('');
    setEmail('');
    setIsInviteOpen(false);
    showToast(`Invitation sent to ${email}`, 'success');
  };

  const handleRoleChange = (id: string, newRole: 'Admin' | 'Member') => {
    const updated = teamService.updateRole(id, newRole);
    setMembers(members.map(m => m.id === id ? updated : m));
    showToast('Member role updated', 'info');
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      teamService.removeMember(id);
      setMembers(members.filter(m => m.id !== id));
      showToast('Team member removed', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Team Workspace & Routing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Collaborate on collective scheduling, round-robin availability, and managed booking templates.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shadow-gold-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Round Robin Info Banner */}
      <div className="p-5 rounded-3xl bg-bright-gold-50/60 dark:bg-[#1a1705] border border-bright-gold-200 dark:border-bright-gold-500/20 flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-bright-gold-500 text-slate-950 shrink-0 shadow-sm">
          <Users2 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Round-Robin & Collective Booking Mode</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Team members will be automatically pooled into collective round-robin distribution for multi-host discovery sessions.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-bright-gold-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        m.role === 'Owner'
                          ? 'bg-bright-gold-500/20 text-bright-gold-800 dark:text-bright-gold-300 border border-bright-gold-500/30'
                          : m.role === 'Admin'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-100 dark:bg-[#222222] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">Joined {m.joinedAt}</span>

                {m.role !== 'Owner' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                      className="bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemove(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Primary Account</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Invite Team Member</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add colleagues to manage shared schedules and collective availability.
            </p>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-xs font-bold text-slate-950 shadow-gold-sm"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
