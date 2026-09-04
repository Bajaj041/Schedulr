import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { EventTypeModal } from '../components/events/EventTypeModal';
import { useToast } from '../context/ToastContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f7f2] dark:bg-[#121212] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f7f2] dark:bg-[#121212] transition-colors duration-200">
        <Navbar onOpenCreateEvent={() => setIsCreateModalOpen(true)} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick Create Event Modal */}
      <EventTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={(newEvent) => {
          showToast(`Event "${newEvent.title}" created successfully!`, 'success');
          // Reload page to reflect across components or state
          window.location.reload();
        }}
      />
    </div>
  );
};
