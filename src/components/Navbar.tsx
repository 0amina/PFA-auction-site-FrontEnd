// src/components/Navbar.tsx
// Wires hamburger to Sidebar via useSidebarToggle()
// Categories button toggles FilterBar with active filter count badge

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import { useAuth }                     from '../context/AuthContext';
import { useRole }                     from '../hooks/useRole';
import FilterBar, { type ActiveFilters } from './FilterBar';
import { useSidebarToggle }            from './Sidebar';

export default function Navbar() {
  const { user, logout }              = useAuth();
  const { isSeller, isAdmin }         = useRole();
  const navigate                      = useNavigate();
  const toggleSidebar                 = useSidebarToggle();
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const dropdownRef                   = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function handleLogout() {
    setProfileOpen(false);
    logout();
    navigate('/auth/login');
  }

  function handleFilterChange(f: ActiveFilters) {
    const count =
      (f.category !== 'All' ? 1 : 0) +
      f.quickFilters.length +
      (f.priceMin > 0 || f.priceMax < 500000 ? 1 : 0);
    setFilterCount(count);
  }

  const initials    = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '';
  const displayName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 bg-[#e0e3e5] dark:bg-slate-900 flex items-center px-4 md:px-8 gap-4 font-headline font-bold uppercase tracking-wider">

        {/* Hamburger — opens Sidebar drawer */}
        <button
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors shrink-0 group"
        >
          <span className="w-5 h-[1.5px] bg-[#191c1e] dark:bg-white rounded-full transition-all" />
          <span className="w-4 h-[1.5px] bg-[#191c1e] dark:bg-white rounded-full transition-all group-hover:w-5" />
          <span className="w-5 h-[1.5px] bg-[#191c1e] dark:bg-white rounded-full transition-all" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl font-black text-[#191c1e] dark:text-white tracking-tight shrink-0">
          The Curator
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex gap-6 items-center h-full ml-4">
          <Link to="/" className="text-[#191c1e] dark:text-slate-300 font-medium text-sm hover:text-primary transition-colors">
            Auctions
          </Link>

          {/* Categories — toggles FilterBar */}
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`
              flex items-center gap-1 font-medium text-sm transition-colors
              ${filterOpen ? 'text-primary' : 'text-[#191c1e] dark:text-slate-300 hover:text-primary'}
            `}
          >
            Categories
            {filterCount > 0 && !filterOpen && (
              <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {filterCount}
              </span>
            )}
            <span
              className="material-symbols-outlined text-base transition-transform duration-200"
              style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          <Link to="/live" className="text-[#191c1e] dark:text-slate-300 font-medium text-sm hover:text-primary transition-colors">
            Live
          </Link>
          <Link to="/archive" className="text-[#191c1e] dark:text-slate-300 font-medium text-sm hover:text-primary transition-colors">
            Archive
          </Link>
        </nav>

        {/* Search */}
        <div className="flex-1 px-4 hidden md:block">
          <div className="relative flex items-center max-w-xl">
            <input
              type="text"
              placeholder="Search the collection..."
              className="w-full h-9 bg-white/60 dark:bg-slate-800 rounded-full border border-black/[0.07] dark:border-white/[0.09] focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 px-9 text-on-surface-variant font-label text-sm transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 text-outline" style={{ fontSize: '18px' }}>search</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link to="/notifications" className="text-on-surface-variant hover:text-primary transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
              </Link>
              <Link to="/favourites" className="text-on-surface-variant hover:text-primary transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>favorite</span>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-[11px] font-black font-label">
                    {initials}
                  </div>
                  <span className="hidden lg:block text-sm font-bold text-[#191c1e] dark:text-white normal-case tracking-normal">
                    {displayName}
                  </span>
                  <span
                    className="material-symbols-outlined text-outline transition-transform duration-200"
                    style={{ fontSize: '18px', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#fafafa] dark:bg-slate-900 rounded-2xl shadow-xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden z-50 font-label normal-case tracking-normal">
                    <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <p className="text-xs text-outline">Signed in as</p>
                      <p className="text-sm font-bold text-on-surface truncate mt-0.5">{displayName}</p>
                      <p className="text-xs text-outline capitalize mt-0.5">{user.role}</p>
                    </div>

                    {[
                      { icon: 'person', label: 'My Profile', to: '/profile' },
                      { icon: 'gavel',  label: 'My Bids',    to: '/bids' },
                      ...(isSeller ? [
                        { icon: 'add_circle', label: 'Create Auction', to: '/auctions/create' },
                        { icon: 'storefront', label: 'My Listings',    to: '/my-auctions' },
                      ] : []),
                      ...(isAdmin ? [
                        { icon: 'admin_panel_settings', label: 'Admin Panel', to: '/admin' },
                      ] : []),
                      { icon: 'settings', label: 'Settings', to: '/settings' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: '17px' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tertiary hover:bg-tertiary/[0.05] transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-headline font-bold text-sm rounded-full hover:brightness-110 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* FilterBar lives outside the header so it slides below it */}
      <FilterBar open={filterOpen} onFilterChange={handleFilterChange} />
    </>
  );
}