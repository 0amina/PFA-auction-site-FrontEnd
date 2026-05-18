import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import { useAuth }                     from '../context/AuthContext';
import { useRole }                     from '../hooks/useRole';

export default function Navbar() {
  const { user, logout }          = useAuth();
  const { isSeller, isAdmin }     = useRole();
  const navigate                  = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setProfileOpen(false);
    logout();
    navigate('/auth/login');
  }

  // Derive initials from real user data
  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '';

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 bg-[#e0e3e5] dark:bg-slate-900 flex justify-between items-center px-8 font-headline font-bold uppercase tracking-wider">

      {/* Logo + Nav Links */}
      <div className="flex items-center gap-12 shrink-0">
        <Link to="/" className="text-2xl font-black text-[#191c1e] dark:text-white tracking-tight">
          The Curator
        </Link>
        <nav className="hidden lg:flex gap-8 items-center h-full">
          {[
            { label: 'Auctions',    to: '/' },
            { label: 'Categories',  to: '/categories' },
            { label: 'Live',        to: '/live' },
            { label: 'Archive',     to: '/archive' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[#191c1e] dark:text-slate-300 font-medium hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex-1 px-8 hidden md:block">
        <div className="relative flex items-center max-w-xl">
          <input
            type="text"
            placeholder="Search the collection..."
            className="w-full h-10 bg-surface-container-highest rounded-full border-none focus:ring-2 focus:ring-primary px-10 text-on-surface-variant font-label text-sm"
          />
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">
            search
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 shrink-0">

        {user ? (
          <>
            {/* Notifications — authenticated only */}
            <Link
              to="/notifications"
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">notifications</span>
            </Link>

            {/* Favourites — authenticated only */}
            <Link
              to="/favourites"
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">favorite</span>
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-xs font-black font-label">
                  {initials}
                </div>
                <span className="hidden lg:block text-sm font-bold text-[#191c1e] dark:text-white normal-case tracking-normal">
                  {displayName}
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200"
                  style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden z-50 font-label normal-case tracking-normal">

                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-outline-variant/10">
                    <p className="text-xs text-on-surface-variant">Signed in as</p>
                    <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                    <p className="text-xs text-outline capitalize mt-0.5">{user.role}</p>
                  </div>

                  {/* Common links */}
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>person</span>
                    My Profile
                  </Link>

                  <Link
                    to="/bids"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>gavel</span>
                    My Bids
                  </Link>

                  {/* Seller-only links */}
                  {isSeller && (
                    <Link
                      to="/auctions/create"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>add_circle</span>
                      Create Auction
                    </Link>
                  )}

                  {isSeller && (
                    <Link
                      to="/my-auctions"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>sell</span>
                      My Listings
                    </Link>
                  )}

                  {/* Admin-only link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>admin_panel_settings</span>
                      Admin Panel
                    </Link>
                  )}

                  {/* Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>settings</span>
                    Settings
                  </Link>

                  {/* Sign out */}
                  <div className="border-t border-outline-variant/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-tertiary hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      Sign Out
                    </button>
                  </div>

                </div>
              )}
            </div>
          </>
        ) : (
          /* Not authenticated — single Sign In button */
          <Link
            to="/auth/login"
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-headline font-bold text-sm rounded-full hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Sign In
          </Link>
        )}

      </div>
    </header>
  );
}