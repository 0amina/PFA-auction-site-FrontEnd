import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/global.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import AppRouter        from './router/AppRouter';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>   {/* ← wraps everything so useAuth() works anywhere */}
      <NotificationsProvider>   {/* ← live notifications (socket + history) */}
        <AppRouter />
      </NotificationsProvider>
    </AuthProvider>
  </React.StrictMode>,
);