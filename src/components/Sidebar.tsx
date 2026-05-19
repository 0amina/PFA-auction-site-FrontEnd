// src/components/Sidebar.tsx
// Changes vs previous version:
// - Added "Seller Dashboard" NavItem under the Seller section
// - Added "Switch to Seller Mode" / "Switch to Buyer Mode" toggle in the footer
//   (sellers only — uses a local state flag; wire to context if you want it persistent)

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation }            from 'react-router-dom';
import { useAuth }                                   from '../context/AuthContext';
import { useRole }                                   from '../hooks/useRole';

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();
let _open = false;

export function useSidebarToggle() {
  return useCallback(() => {
    _open = !_open;
    listeners.forEach(l => l(_open));
  }, []);
}

export function openSidebar() {
  _open = true;
  listeners.forEach(l => l(true));
}

export default function Sidebar() {
  const [open, setOpen]       = useState(false);
  const [sellerMode, setSellerMode] = useState(true); // true = viewing as seller
  const { user, logout }      = useAuth();
  const { isSeller, isAdmin, isAuthenticated } = useRole();
  const navigate              = useNavigate();
  const location              = useLocation();
  const drawerRef             = useRef<HTMLDivElement>(null);
  const firstLinkRef          = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handler: Listener = (v) => setOpen(v);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => firstLinkRef.current?.focus(), 320);
  }, [open]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { close(); }, [location.pathname]);

  function close() { _open = false; listeners.forEach(l => l(false)); setOpen(false); }

  function handleLogout() {
    close();
    logout();
    navigate('/auth/login');
  }

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '';

  return (
    <>
      {/* ── Left-edge peek tab ── */}
      <button
        onClick={() => { _open = true; listeners.forEach(l => l(true)); setOpen(true); }}
        aria-label="Open menu"
        className={`
          fixed left-0 top-1/2 -translate-y-1/2 z-40
          flex items-center justify-center
          w-6 h-16 rounded-r-lg
          bg-primary/90 text-white
          hover:w-8 hover:bg-primary
          transition-all duration-200
          ${open ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'}
        `}
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={close}
        aria-hidden
        className={`
          fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Drawer ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed left-0 top-0 h-screen w-[17.5rem] z-50
          bg-[#fafafa] dark:bg-slate-900
          flex flex-col
          shadow-[4px_0_32px_rgba(0,0,0,0.12)]
          transition-transform duration-300
          [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Drawer header ── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
          <Link to="/" onClick={close} className="font-headline text-base font-black text-on-surface tracking-tight">
            The Curator
          </Link>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-on-surface-variant transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ── User card ── */}
        {isAuthenticated && user ? (
          <Link
            to="/profile"
            onClick={close}
            className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors shrink-0 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-black font-label shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label text-sm font-bold text-on-surface truncate leading-tight">
                {user.first_name} {user.last_name}
              </p>
              <p className="font-label text-xs text-outline capitalize">{user.role}</p>
            </div>
            <span className="material-symbols-outlined text-outline text-base opacity-0 group-hover:opacity-100 transition-opacity">
              chevron_right
            </span>
          </Link>
        ) : (
          <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
            <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
              Sign in to track bids, messages, and saved lots.
            </p>
            <div className="flex gap-2">
              <Link
                to="/auth/login"
                onClick={close}
                ref={firstLinkRef as React.RefObject<HTMLAnchorElement>}
                className="flex-1 flex items-center justify-center py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-full hover:brightness-110 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                onClick={close}
                className="flex-1 flex items-center justify-center py-2.5 border border-outline-variant/30 text-on-surface font-headline font-bold text-sm rounded-full hover:bg-black/[0.03] transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* ── Scrollable nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
          {isAuthenticated && (
            <>
              <SectionLabel>Personal</SectionLabel>
              <NavItem
                ref={firstLinkRef as React.RefObject<HTMLAnchorElement>}
                icon="chat_bubble"
                label="Messages"
                to="/messages"
                badge={3}
                active={location.pathname === '/messages'}
              />
              <NavItem icon="gavel"         label="My Bids"       to="/bids"          active={location.pathname === '/bids'}          />
              <NavItem icon="favorite"      label="Favourites"    to="/favourites"    active={location.pathname === '/favourites'}    />
              <NavItem icon="notifications" label="Notifications" to="/notifications" active={location.pathname === '/notifications'} />

              {/* ── Seller section ── */}
              {isSeller && sellerMode && (
                <>
                  <SectionLabel>Seller</SectionLabel>
                  <NavItem
                    icon="dashboard"
                    label="Seller Dashboard"
                    to="/seller/dashboard"
                    active={location.pathname === '/seller/dashboard'}
                    accent
                  />
                  <NavItem
                    icon="add_circle"
                    label="Create Auction"
                    to="/auctions/create"
                    active={location.pathname === '/auctions/create'}
                    accent
                  />
                  <NavItem
                    icon="storefront"
                    label="My Listings"
                    to="/my-auctions"
                    active={location.pathname === '/my-auctions'}
                  />
                  <NavItem
                    icon="bar_chart"
                    label="Analytics"
                    to="/seller/analytics"
                    active={location.pathname === '/seller/analytics'}
                  />
                </>
              )}

              {/* ── Admin section ── */}
              {isAdmin && (
                <>
                  <SectionLabel>Admin</SectionLabel>
                  <NavItem icon="admin_panel_settings" label="Dashboard"       to="/admin"                    active={location.pathname.startsWith('/admin')}             accent />
                  <NavItem icon="how_to_reg"           label="Seller Requests" to="/admin/seller-requests"    active={location.pathname === '/admin/seller-requests'}            />
                </>
              )}

              {/* ── Become a seller nudge — buyers only ── */}
              {!isSeller && !isAdmin && (
                <div className="mx-1 mt-4 p-4 rounded-2xl bg-primary/[0.06] border border-primary/[0.12]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>storefront</span>
                    <p className="font-label text-xs font-bold text-on-surface">Start selling</p>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mb-3 leading-relaxed">
                    List your collection and reach collectors worldwide.
                  </p>
                  <Link
                    to="/become-seller"
                    onClick={close}
                    className="inline-flex items-center gap-1 font-label text-xs font-bold text-primary hover:underline"
                  >
                    Apply for seller access
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* ── Footer ── */}
        <div className="px-3 pb-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] shrink-0 space-y-1">

          {/* Mode toggle — sellers only */}
          {isSeller && isAuthenticated && (
            <button
              onClick={() => setSellerMode((m) => !m)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-semibold transition-colors
                ${sellerMode
                  ? 'text-on-surface-variant hover:bg-black/[0.04]'
                  : 'text-primary bg-primary/[0.06] hover:bg-primary/[0.10]'}
              `}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  fontVariationSettings: sellerMode ? "'FILL' 0" : "'FILL' 1",
                }}
              >
                {sellerMode ? 'person' : 'storefront'}
              </span>
              {sellerMode ? 'Switch to Buyer Mode' : 'Switch to Seller Mode'}
            </button>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-semibold text-tertiary hover:bg-tertiary/[0.06] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              Sign Out
            </button>
          ) : (
            <p className="px-2 font-label text-xs text-outline text-center">
              © {new Date().getFullYear()} The Curator
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-4 pb-1.5 font-label text-[10px] font-bold text-outline uppercase tracking-[0.1em]">
      {children}
    </p>
  );
}

interface NavItemProps {
  icon:    string;
  label:   string;
  to:      string;
  badge?:  number;
  active?: boolean;
  accent?: boolean;
  ref?:    React.RefObject<HTMLAnchorElement>;
}

const NavItem = function NavItem({ icon, label, to, badge, active, accent, ref }: NavItemProps) {
  return (
    <Link
      to={to}
      ref={ref}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl
        font-label text-sm font-semibold
        transition-all duration-150 group
        ${active
          ? accent
            ? 'bg-primary/10 text-primary'
            : 'bg-black/[0.05] dark:bg-white/[0.07] text-on-surface'
          : accent
            ? 'text-primary hover:bg-primary/[0.07]'
            : 'text-on-surface-variant hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-on-surface'
        }
      `}
    >
      <span
        className="material-symbols-outlined transition-all"
        style={{
          fontSize: '20px',
          fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
        }}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-tertiary text-white text-[10px] font-black flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}
    </Link>
  );
};