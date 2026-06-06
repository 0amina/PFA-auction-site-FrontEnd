// src/pages/admin/AdminLayout.tsx
// The admin portal shell: its own fixed sidebar + topbar + <Outlet/>.
// This replaces the marketplace Navbar/Sidebar entirely — admin routes do NOT
// use MainLayout. Mount it as the parent of the /admin route group.
//
// Desktop-first by design (fixed 18rem sidebar). Admin panels are used on
// laptops, so there's no mobile drawer — keep that in mind if you demo on phone.

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',                 icon: 'dashboard',     label: 'Dashboard', exact: true },
  { to: '/admin/users',           icon: 'group',         label: 'Users' },
  { to: '/admin/seller-requests', icon: 'verified_user', label: 'Seller Requests' },
  { to: '/admin/auctions',        icon: 'gavel',         label: 'Auctions' },
];

function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  function handleLogout() { logout(); navigate('/auth/login'); }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 z-40 py-8 px-6 bg-surface-container-low flex flex-col">
      {/* Brand */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
        </div>
        <div>
          <h1 className="font-headline font-bold text-xl text-on-surface leading-none">The Curator</h1>
          <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant opacity-70 mt-1">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-highest'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="font-label tracking-wider uppercase text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-1 pt-3 border-t border-outline-variant/20">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>storefront</span>
          Back to marketplace
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-semibold text-tertiary hover:bg-tertiary/5 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar() {
  const { user } = useAuth();
  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : 'AD';
  const name = user ? `${user.first_name} ${user.last_name}` : 'Administrator';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-18rem)] h-20 z-30 px-8 flex items-center justify-between bg-surface-container-highest/80 backdrop-blur-xl">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
          <input
            type="text"
            placeholder="Search users, auctions, requests…"
            className="w-full bg-surface-container-low border-none rounded-full h-11 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="h-8 w-px bg-outline-variant/30" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="font-headline font-bold text-sm leading-none">{name}</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-xs font-black font-label">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout() {
  return (
    <div className="bg-surface min-h-screen font-body text-on-surface">
      <AdminSidebar />
      <AdminTopbar />
      <main className="ml-72 pt-28 px-8 pb-12 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
