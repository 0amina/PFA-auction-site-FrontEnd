// src/router/AppRouter.tsx
// Sidebar is self-contained (renders its own toggle button + drawer).
// Marketplace pages share MainLayout. Admin lives in its own AdminLayout group,
// lazy-loaded so its bundle never ships to buyers/sellers.

import { lazy, Suspense } from 'react';
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
import BecomeSellerPage  from '../pages/BecomeSellerPage';
import SellerDashboardPage from '../pages/SellerDashboardPage';
import MessagesPage      from '../pages/MessagesPage';
import MyBidsPage        from '../pages/MyBidsPage';
import MyListingsPage    from '../pages/MyListingsPage';
import ConnectWalletPage from '../pages/Connectwalletpage/Connectwallet';

// ─── Admin (lazy — code-split out of the main bundle) ─────────────────────────
const AdminLayout        = lazy(() => import('../pages/Admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../pages/Admin/DashboardPage'));
const AdminUsersPage     = lazy(() => import('../pages/Admin/UsersPage'));
const AdminSellerReqPage = lazy(() => import('../pages/Admin/SellerRequestsPage'));
const AdminAuctionsPage  = lazy(() => import('../pages/Admin/AuctionsPage'));

// ─── Layouts ──────────────────────────────────────────────────────────────────

// Sidebar is a self-contained drawer that renders its own toggle tab fixed to
// the left edge — no offset needed.
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

const AdminFallback = () => (
  <div className="p-12 font-body text-on-surface-variant">Loading…</div>
);

// ─── Router ───────────────────────────────────────────────────────────────────

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Marketplace — shared layout ── */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route
            path="profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="wallet"
            element={<ProtectedRoute><ConnectWalletPage /></ProtectedRoute>}
          />
          <Route
            path="bids"
            element={<ProtectedRoute><MyBidsPage /></ProtectedRoute>}
          />

          {/* static before dynamic */}
          <Route
            path="auctions/create"
            element={<ProtectedRoute roles={['seller']}><CreateAuctionPage /></ProtectedRoute>}
          />
          <Route path="auctions/:id" element={<AuctionDetailPage />} />

          <Route
            path="my-auctions"
            element={<ProtectedRoute roles={['seller']}><MyListingsPage /></ProtectedRoute>}
          />
          <Route
            path="seller/dashboard"
            element={<ProtectedRoute roles={['seller']}><SellerDashboardPage /></ProtectedRoute>}
          />

          <Route
            path="notifications"
            element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
          />
          <Route
            path="favourites"
            element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>}
          />
          <Route
            path="messages"
            element={<ProtectedRoute><MessagesPage /></ProtectedRoute>}
          />
          <Route
            path="become-seller"
            element={<ProtectedRoute roles={['buyer']}><BecomeSellerPage /></ProtectedRoute>}
          />
        </Route>

        {/* ── Admin — own layout, lazy-loaded, admin-only ── */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="seller-requests" element={<AdminSellerReqPage />} />
          <Route path="auctions" element={<AdminAuctionsPage />} />
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
// http://localhost:5173/bids
// http://localhost:5173/my-auctions
// http://localhost:5173/wallet
// http://localhost:5173/notifications
// http://localhost:5173/favourites
// http://localhost:5173/auctions/1
// http://localhost:5173/auctions/create
// http://localhost:5173/admin
// http://localhost:5173/admin/users
// http://localhost:5173/admin/seller-requests
// http://localhost:5173/admin/auctions