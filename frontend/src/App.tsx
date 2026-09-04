import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { PublicBookingPage } from './pages/public/PublicBookingPage';
import { HostProfilePage } from './pages/public/HostProfilePage';
import { ReschedulePublicPage } from './pages/public/ReschedulePublicPage';
import { CancelPublicPage } from './pages/public/CancelPublicPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';

// App Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { EventTypesPage } from './pages/app/EventTypesPage';
import { BookingsPage } from './pages/app/BookingsPage';
import { AvailabilityPage } from './pages/app/AvailabilityPage';
import { IntegrationsPage } from './pages/app/IntegrationsPage';
import { TeamPage } from './pages/app/TeamPage';
import { AnalyticsPage } from './pages/app/AnalyticsPage';
import { SettingsPage } from './pages/app/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Default Route */}
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Host Protected Workspace */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="event-types" element={<EventTypesPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="availability" element={<AvailabilityPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Public Reschedule & Cancel routes */}
              <Route path="/reschedule/:bookingId" element={<ReschedulePublicPage />} />
              <Route path="/cancel/:bookingId" element={<CancelPublicPage />} />

              {/* Public Booking Pages */}
              <Route path="/:username" element={<HostProfilePage />} />
              <Route path="/:username/:eventSlug" element={<PublicBookingPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
