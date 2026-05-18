import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/global.css';

import { AuthProvider } from './context/AuthContext';
import AppRouter        from './router/AppRouter';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>   {/* ← wraps everything so useAuth() works anywhere */}
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>,
);