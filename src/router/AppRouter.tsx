// src/router/AppRouter.tsx
// Sidebar is now self-contained (renders its own toggle button + drawer).
// SidebarLayout no longer needs to render <Sidebar /> — it mounts itself
// at the app root via Navbar or just lives inside the layout without offset.

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar         from '../components/Navbar';
import Sidebar        from '../components/Sidebar';
import Footer         from '../components/Footer';
import ProtectedRoute from './ProtectedRoute';

import HomePage          from '../pages/HomePage';
import AuctionDetailPage from '../pages/AuctionDetailPage/Index';
import CreateAuctionPage from '../pages/CreateAuctionPage';
import AuthLayout        from '../pages/AuthPage/AuthLayout';
import SignUpPage        from '../pages/AuthPage/SignUpPage';
import LoginPage         from '../pages/AuthPage/LoginPage';
import NotificationsPage from '../pages/NotificationsPage';
import FavouritesPage    from '../pages/FavouritesPage';
import ProfilePage       from '../pages/ProfilePage';

// ─── Layouts ──────────────────────────────────────────────────────────────────

// Both layouts now use the same structure — Sidebar is a self-contained drawer
// that renders its own toggle tab fixed to the left edge. No offset needed.
function MainLayout() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
      <div className="pt-16 flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// ─── 404 ─────────────────────────────────────────────────────────────────────

const NotFoundPage = () => (
  <main className="flex items-center justify-center min-h-screen p-8">
    <div className="text-center">
      <h1 className="font-headline text-8xl font-black text-outline/30 mb-4">404</h1>
      <p className="font-headline text-2xl font-bold mb-2">Page not found.</p>
      <a href="/" className="text-primary font-bold font-body border-b border-primary">
        Back to auctions
      </a>
    </div>
  </main>
);

// ─── Router ───────────────────────────────────────────────────────────────────

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── All main pages share one layout ── */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          {/* static before dynamic */}
          <Route
            path="auctions/create"
            element={<ProtectedRoute roles={['seller']}><CreateAuctionPage /></ProtectedRoute>}
          />
          <Route path="auctions/:id" element={<AuctionDetailPage />} />
          <Route
            path="notifications"
            element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
          />
          <Route
            path="favourites"
            element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>}
          />
        </Route>

        {/* ── Auth — own minimal layout ── */}
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login"  element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}

// http://localhost:5173
// http://localhost:5173/notifications
// http://localhost:5173/favourites
// http://localhost:5173/auth/signup
// http://localhost:5173/auth/login
// http://localhost:5173/auctions/1
// http://localhost:5173/auctions/create