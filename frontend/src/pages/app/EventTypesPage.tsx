import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Clock, 
  Video, 
  Link as LinkIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { EventType } from '../../types';
import { EventTypeModal } from '../../components/events/EventTypeModal';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

export const EventTypesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [eventTypes, setEventTypes] = useState<EventType[]>(() => eventService.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    eventService.fetchAll().then(list => setEventTypes(list));
  }, []);

  const handleCopy = (event: EventType) => {
    const url = `${window.location.origin}/${user.username}/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    showToast('Direct booking link copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (id: string) => {
    const updated = eventService.toggleActive(id);
    setEventTypes(eventTypes.map(e => e.id === id ? updated : e));
    showToast(`Event type ${updated.isActive ? 'activated' : 'deactivated'}`, 'info');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event type?')) {
      eventService.delete(id);
      setEventTypes(eventTypes.filter(e => e.id !== id));
      showToast('Event type deleted', 'info');
    }
  };

  const handleEdit = (event: EventType) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Event Types
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage the meeting durations, availability rules, and Google Meet links you share.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 text-xs font-bold shadow-gold-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Event Type</span>
        </button>
      </div>

      {/* Grid of Event Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((event) => (
          <div
            key={event.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500/50 shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Color Accent Bar on Top */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 bg-bright-gold-500"
            />

            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full bg-bright-gold-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {event.durationMinutes} minutes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggle(event.id)}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      event.isActive ? 'bg-bright-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        event.isActive ? 'translate-x-4' : 'translate-x-0 bg-white'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-bright-gold-600 dark:group-hover:text-bright-gold-400 transition-colors mb-2">
                {event.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {event.description}
              </p>

              {/* Slug Preview */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-4">
                <span className="truncate">/{user.username}/{event.slug}</span>
                <Link
                  to={`/${user.username}/${event.slug}`}
                  target="_blank"
                  className="text-bright-gold-700 dark:text-bright-gold-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                </svg>
                <span>Google Meet</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(event)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-bright-gold-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Copy link"
                >
                  {copiedId === event.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-bright-gold-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Edit event settings"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#222222] hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-500 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={editingEvent}
        onSaved={(saved) => {
          if (editingEvent) {
            setEventTypes(eventTypes.map(e => e.id === saved.id ? saved : e));
          } else {
            setEventTypes([saved, ...eventTypes]);
          }
        }}
      />
    </div>
  );
};
