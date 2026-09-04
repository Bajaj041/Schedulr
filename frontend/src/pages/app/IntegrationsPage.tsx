import React, { useState } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  Calendar,
  Video,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { StorageService } from '../../services/localStorage';
import { Integration } from '../../types';
import { useToast } from '../../context/ToastContext';
import { GoogleCalendarSyncModal } from '../../components/common/GoogleCalendarSyncModal';

export const IntegrationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>(() => StorageService.getIntegrations());
  const [showGCalModal, setShowGCalModal] = useState(false);

  const handleToggleConnect = (intg: Integration) => {
    if (intg.provider === 'google_calendar' || intg.provider === 'google_meet') {
      setShowGCalModal(true);
      return;
    }

    const updated = integrations.map((i) => {
      if (i.id === intg.id) {
        const nextState = !i.isConnected;
        return {
          ...i,
          isConnected: nextState,
          connectedEmail: nextState ? 'aditya@work.com' : undefined,
          connectedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return i;
    });

    setIntegrations(updated);
    StorageService.setIntegrations(updated);
    showToast(
      `${intg.name} ${!intg.isConnected ? 'connected successfully' : 'disconnected'}`,
      !intg.isConnected ? 'success' : 'info'
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google_calendar':
        return (
          <div className="w-10 h-10 rounded-2xl bg-white p-2 flex items-center justify-center shadow-sm border border-slate-100">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
              <path fill="#34A853" d="M9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
            </svg>
          </div>
        );
      case 'google_meet':
        return (
          <div className="w-10 h-10 rounded-2xl bg-white p-2 flex items-center justify-center shadow-sm border border-slate-100">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#00832d" d="M19 8l-4 4v-3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3l4 4V8z"/>
            </svg>
          </div>
        );
      case 'outlook_calendar':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#0078D4] p-2 flex items-center justify-center text-white shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
        );
      case 'zoom':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#2D8CFF] p-2 flex items-center justify-center text-white shadow-sm">
            <Video className="w-6 h-6" />
          </div>
        );
      case 'stripe':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#635BFF] p-2 flex items-center justify-center text-white shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
        );
      case 'slack':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#4A154B] p-2 flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
        );
      default:
        return <Puzzle className="w-6 h-6 text-bright-gold-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Integrations & Apps
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect your calendars, video conferencing tools, payment gateways, and chat webhooks.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((intg) => (
          <div
            key={intg.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 hover:border-bright-gold-500/40 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                {getProviderIcon(intg.provider)}

                {intg.isConnected ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#202020] text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    Available
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                {intg.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {intg.description}
              </p>

              {intg.connectedEmail && (
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#202020] text-[11px] text-slate-700 dark:text-slate-300 font-mono mb-4 truncate border border-slate-200/60 dark:border-white/5">
                  Account: {intg.connectedEmail}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {intg.category}
              </span>

              <button
                type="button"
                onClick={() => handleToggleConnect(intg)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  intg.isConnected
                    ? 'bg-slate-100 dark:bg-[#222222] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                    : 'bg-bright-gold-500 hover:bg-bright-gold-400 text-slate-950 shadow-gold-sm'
                }`}
              >
                {intg.isConnected ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <GoogleCalendarSyncModal
        isOpen={showGCalModal}
        onClose={() => {
          setShowGCalModal(false);
          setIntegrations(StorageService.getIntegrations());
        }}
      />
    </div>
  );
};
