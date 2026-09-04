import React, { useState } from 'react';
import { Globe, ChevronDown, Search, Check } from 'lucide-react';

const COMMON_TIMEZONES = [
  { name: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata', region: 'India Standard Time' },
  { name: 'America/New_York (GMT-4:00)', value: 'America/New_York', region: 'Eastern Time' },
  { name: 'America/Los_Angeles (GMT-7:00)', value: 'America/Los_Angeles', region: 'Pacific Time' },
  { name: 'America/Chicago (GMT-5:00)', value: 'America/Chicago', region: 'Central Time' },
  { name: 'Europe/London (GMT+1:00)', value: 'Europe/London', region: 'British Time' },
  { name: 'Europe/Paris (GMT+2:00)', value: 'Europe/Paris', region: 'Central European Time' },
  { name: 'Europe/Berlin (GMT+2:00)', value: 'Europe/Berlin', region: 'Germany' },
  { name: 'Asia/Dubai (GMT+4:00)', value: 'Asia/Dubai', region: 'Gulf Standard Time' },
  { name: 'Asia/Singapore (GMT+8:00)', value: 'Asia/Singapore', region: 'Singapore Time' },
  { name: 'Asia/Tokyo (GMT+9:00)', value: 'Asia/Tokyo', region: 'Japan Standard Time' },
  { name: 'Australia/Sydney (GMT+10:00)', value: 'Australia/Sydney', region: 'Australian Eastern' },
];

interface TimezoneSelectProps {
  value: string;
  onChange: (tz: string) => void;
  isLight?: boolean;
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({ value, onChange, isLight = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentTz = COMMON_TIMEZONES.find((t) => t.value === value) || {
    name: `${value} (Local)`,
    value: value,
    region: 'Auto-detected'
  };

  const filtered = COMMON_TIMEZONES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span className="truncate max-w-[200px]">Timezone: {currentTz.name}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-auto" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute bottom-full left-0 mb-2 w-72 rounded-2xl shadow-2xl border z-50 p-2 overflow-hidden animate-in zoom-in-95 duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <div className="p-1 mb-2">
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search timezone or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filtered.map((tz) => {
                const isSelected = tz.value === value;
                return (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => {
                      onChange(tz.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-500 text-white font-semibold'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="truncate">{tz.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                        {tz.region}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
