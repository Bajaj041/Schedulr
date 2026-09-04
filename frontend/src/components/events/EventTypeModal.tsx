import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { EventType, LocationType, CustomQuestion } from '../../types';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';

interface EventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventType | null;
  onSaved: (event: EventType) => void;
}

const COLOR_OPTIONS = [
  '#ffdd00', // Bright Gold
  '#ccb100', // Deep Gold
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
];

export const EventTypeModal: React.FC<EventTypeModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSaved,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'details' | 'availability' | 'questions'>('details');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [color, setColor] = useState('#ffdd00');
  const [locationType, setLocationType] = useState<LocationType>('google_meet');
  const [bufferBeforeMinutes, setBufferBeforeMinutes] = useState(10);
  const [bufferAfterMinutes, setBufferAfterMinutes] = useState(10);
  const [minimumNoticeHours, setMinimumNoticeHours] = useState(2);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setSlug(eventToEdit.slug);
      setDescription(eventToEdit.description);
      setDurationMinutes(eventToEdit.durationMinutes);
      setColor(eventToEdit.color || '#ffdd00');
      setLocationType(eventToEdit.locationType);
      setBufferBeforeMinutes(eventToEdit.bufferBeforeMinutes);
      setBufferAfterMinutes(eventToEdit.bufferAfterMinutes);
      setMinimumNoticeHours(eventToEdit.minimumNoticeHours);
      setQuestions(eventToEdit.customQuestions || []);
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setDurationMinutes(30);
      setColor('#ffdd00');
      setLocationType('google_meet');
      setBufferBeforeMinutes(10);
      setBufferAfterMinutes(10);
      setMinimumNoticeHours(2);
      setQuestions([
        {
          id: `q_${Date.now()}`,
          label: 'Please share anything that will help prepare for our meeting',
          type: 'textarea',
          required: false,
        }
      ]);
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!eventToEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddQuestion = () => {
    const newQ: CustomQuestion = {
      id: `q_${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      showToast('Please provide an event title and slug', 'error');
      return;
    }

    if (eventToEdit) {
      const updated = eventService.update(eventToEdit.id, {
        title,
        slug,
        description,
        durationMinutes,
        color,
        locationType,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        minimumNoticeHours,
        customQuestions: questions,
      });
      showToast('Event type updated successfully', 'success');
      onSaved(updated);
    } else {
      const created = eventService.create({
        userId: 'usr_aditya_101',
        title,
        slug,
        description,
        durationMinutes,
        color,
        locationType,
        isActive: true,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        minimumNoticeHours,
        maxDaysInFuture: 30,
        customQuestions: questions,
      });
      showToast('New event type created!', 'success');
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {eventToEdit ? 'Edit Event Type' : 'Create New Event Type'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure duration, Google Meet link, and intake form</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/10 px-6 gap-6 text-xs font-bold">
          {[
            { id: 'details', label: 'Event Details' },
            { id: 'availability', label: 'Limits & Buffers' },
            { id: 'questions', label: 'Booking Questions' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-bright-gold-500 text-bright-gold-700 dark:text-bright-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {activeTab === 'details' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Min Discovery Call"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    URL Slug *
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] overflow-hidden text-xs">
                    <span className="px-3 text-slate-400 border-r border-slate-200 dark:border-white/10">
                      schedulr.io/aditya/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description shown to bookers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-bright-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationMinutes(d)}
                        className={`py-2 rounded-2xl text-xs font-black border transition-all ${
                          durationMinutes === d
                            ? 'bg-bright-gold-500 border-bright-gold-500 text-slate-950 shadow-gold-sm'
                            : 'bg-slate-50 dark:bg-[#202020] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-bright-gold-500'
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location / Video Conferencing
                  </label>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
                      </svg>
                      <span>Google Meet (Auto-generated link)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      Enabled
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Color Tag
                  </label>
                  <div className="flex items-center gap-2.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'availability' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Buffer Before Meeting
                    </label>
                    <select
                      value={bufferBeforeMinutes}
                      onChange={(e) => setBufferBeforeMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none"
                    >
                      <option value={0}>0 minutes</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Buffer After Meeting
                    </label>
                    <select
                      value={bufferAfterMinutes}
                      onChange={(e) => setBufferAfterMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none"
                    >
                      <option value={0}>0 minutes</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Minimum Advance Scheduling Notice
                  </label>
                  <select
                    value={minimumNoticeHours}
                    onChange={(e) => setMinimumNoticeHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202020] text-slate-900 dark:text-white text-xs focus:outline-none"
                  >
                    <option value={0}>No notice required</option>
                    <option value={1}>1 hour in advance</option>
                    <option value={2}>2 hours in advance</option>
                    <option value={4}>4 hours in advance</option>
                    <option value={24}>24 hours in advance</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add custom questions attendees must answer when booking:
                  </p>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs font-bold text-bright-gold-700 dark:text-bright-gold-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => handleUpdateQuestion(q.id, { label: e.target.value })}
                        placeholder="Question label..."
                        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleUpdateQuestion(q.id, { required: e.target.checked })}
                          className="rounded border-slate-300 dark:border-slate-700 text-bright-gold-500 focus:ring-bright-gold-500"
                        />
                        <span>Required field</span>
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(q.id, { type: e.target.value as any })}
                        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <option value="text">Single Line Text</option>
                        <option value="textarea">Multi-line Paragraph</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#151515] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-2xl bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 shadow-gold-sm transition-all"
            >
              Save & Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
