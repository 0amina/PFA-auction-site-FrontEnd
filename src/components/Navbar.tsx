// src/components/Navbar.tsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import { useAuth }                     from '../context/AuthContext';
import { useRole }                     from '../hooks/useRole';
import FilterBar, { type ActiveFilters } from './FilterBar';
import { useSidebarToggle }            from './Sidebar';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout }              = useAuth();
  const { isSeller, isAdmin }         = useRole();
  const toggleSidebar                 = useSidebarToggle();
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const dropdownRef                   = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const isLight = isHome && !scrolled;
const isTransparent = isHome && !scrolled;
  useEffect(() => {
    function onScroll() {
      const nav = document.getElementById('main-nav');
      if (!nav) return;
      if (window.scrollY > 80) {
        nav.style.background = 'rgba(255,255,255,0.95)';
        nav.style.boxShadow  = '0 1px 0 rgba(0,0,0,0.06)';
        nav.style.backdropFilter = 'blur(12px)';
      } else {
        nav.style.background = 'transparent';
        nav.style.boxShadow  = 'none';
        nav.style.backdropFilter = 'none';
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 80);
  };

  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, []);

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

  // Balance and wallet — user object already carries these from your JWT/profile.
  // `balance` is in TND. `wallet_address` is the connected Solana wallet (nullable).
  const balance       = user?.balance ?? null;
  const walletAddress = user?.wallet_address ?? null; // add this field to your User type if not present

  const formattedBalance = balance !== null
    ? balance.toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TND'
    : null;

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : null;
const navigate = useNavigate();
const [search, setSearch] = useState('');

useEffect(() => {
  const handler = setTimeout(() => {
    const trimmed = search.trim();

    // ONLY control navigation on /auctions page
    if (location.pathname !== '/auctions') return;

    if (trimmed) {
      navigate(`/auctions?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/auctions');
    }
  }, 300);

  return () => clearTimeout(handler);
}, [search, navigate, location.pathname]);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 flex items-center px-4 md:px-8 gap-4 font-headline font-bold uppercase tracking-wider transition-all duration-300" id="main-nav" style={{ background: 'transparent' }}>

        {/* Hamburger */}
{/* Hamburger */}
<button
  onClick={toggleSidebar}
  aria-label="Open menu"
  className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors shrink-0 group"
>
  <span
    className={`w-5 h-[1.5px] rounded-full transition-all ${
      isLight ? 'bg-white' : 'bg-black'
    }`}
  />

  <span
    className={`w-4 h-[1.5px] rounded-full transition-all group-hover:w-5 ${
      isLight ? 'bg-white' : 'bg-black'
    }`}
  />

  <span
    className={`w-5 h-[1.5px] rounded-full transition-all ${
      isLight ? 'bg-white' : 'bg-black'
    }`}
  />
</button>

        {/* Logo */}
        <Link
  to="/"
  className={`font-medium text-sm transition-colors ${
  isTransparent
    ? 'text-white/90 hover:text-white'
    : 'text-black hover:text-primary'
}`}
>
          The Curator
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex gap-6 items-center h-full ml-4">
          <Link to="/auctions" 
         className={`font-medium text-sm transition-colors ${
  isTransparent
    ? 'text-white/90 hover:text-white'
    : 'text-black hover:text-primary'
}`}>
            Auctions
          </Link>
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-1 font-medium text-sm transition-colors ${
  (isHome && !scrolled)
    ? 'text-white/90 hover:text-white'
    : 'text-black hover:text-primary'
}`}
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
        </nav>

        {/* Search */}
        <div className="flex-1 px-4 hidden md:block">
          <div className="relative flex items-center max-w-xl">
        <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search the collection..."
  className="w-full h-9 bg-white/60 rounded-full px-9 text-sm"
/>
            <span className="material-symbols-outlined absolute left-3 text-outline" style={{ fontSize: '18px' }}>search</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link to="/notifications" className={`transition-colors w-9 h-9 flex items-center justify-center rounded-lg ${
  isTransparent ? 'text-white/80' : 'text-black'
}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
              </Link>
              <Link to="/favourites" className={`transition-colors w-9 h-9 flex items-center justify-center rounded-lg ${
  isTransparent ? 'text-white/80' : 'text-black'
}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>favorite</span>
              </Link>

              {/* Profile button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-[11px] font-black font-label shrink-0">
                    {initials}
                  </div>

                  {/* Name + balance/wallet — desktop only */}
          <div className="hidden lg:flex flex-col items-start leading-none gap-[3px]">
  <span
    className={`text-sm font-bold normal-case tracking-normal ${
      isLight ? 'text-white' : 'text-black'
    }`}
  >
    {displayName}
  </span>
                    {/* Balance takes priority; wallet shown as fallback */}
                    {formattedBalance !== null ? (
                      <span className="text-[11px] font-label font-semibold text-[#006c49] normal-case tracking-normal">
                        {formattedBalance}
                      </span>
                    ) : shortWallet !== null ? (
                      <span className="text-[11px] font-label font-mono text-[#9945FF] normal-case tracking-normal flex items-center gap-1">
                        <span>◎</span>{shortWallet}
                      </span>
                    ) : null}
                  </div>

                  <span
                    className="material-symbols-outlined text-outline transition-transform duration-200"
                    style={{ fontSize: '18px', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* ── Dropdown ── */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-[#fafafa] dark:bg-slate-900 rounded-2xl shadow-xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden z-50 font-label normal-case tracking-normal">

                    {/* Identity + balance + wallet */}
                    <div className="px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.06] space-y-3">
                      {/* Name / role */}
                      <div>
                        <p className="text-xs text-outline">Signed in as</p>
                        <p className="text-sm font-bold text-on-surface truncate mt-0.5">{displayName}</p>
                        <p className="text-xs text-outline capitalize mt-0.5">{user.role}</p>
                      </div>

                      {/* Balance chip */}
                      {formattedBalance !== null && (
 <div className="flex items-center justify-between px-3 py-2 bg-[#006c49]/5 border border-[#006c49]/15 rounded-xl">
  
  {/* Left side */}
  <div className="flex items-center gap-2">
    <span
      className="material-symbols-outlined text-[#006c49]"
      style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}
    >
      account_balance_wallet
    </span>

    <span className="text-xs text-[#464555]">Balance</span>
  </div>

  {/* Right side (balance + add button) */}
  <div className="flex items-center gap-2">
    <span className="text-sm font-black text-[#006c49]">
      {formattedBalance}
    </span>

    <button
      onClick={() => {
        setProfileOpen(false);
        navigate('/add-balance');
      }}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-[#006c49] text-white hover:brightness-110 active:scale-95 transition"
      title="Add balance"
    >
      <span className="material-symbols-outlined text-[16px]">
        add
      </span>
    </button>
  </div>
</div>
                      )}

                      {/* Wallet chip */}
                      {shortWallet !== null && (
                        <div className="flex items-center justify-between px-3 py-2 bg-[#9945FF]/5 border border-[#9945FF]/15 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[#9945FF] font-black text-sm leading-none">◎</span>
                            <span className="text-xs text-[#464555]">Wallet</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#9945FF]">{shortWallet}</span>
                        </div>
                      )}
                    </div>

                    {/* Nav links */}
                    {[
                      { icon: 'person',                label: 'My Profile',  to: '/profile'   },
                      { icon: 'credit_card',           label: 'Add Card',    to: '/add-card'  },
                      ...(isSeller ? [
                        { icon: 'dashboard',           label: 'Seller Dashboard', to: '/seller/dashboard' },
                      ] : []),
                      ...(isAdmin ? [
                        { icon: 'admin_panel_settings', label: 'Admin Panel', to: '/admin' },
                      ] : []),
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

                    {/* Sign out */}
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

      <FilterBar open={filterOpen} onFilterChange={handleFilterChange} />
    </>
  );
}