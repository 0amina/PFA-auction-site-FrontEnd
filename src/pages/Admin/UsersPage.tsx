// src/pages/admin/UsersPage.tsx
// Route: /admin/users. Directory of all accounts with role/status filters and
// a working ban/unban toggle (mutates local state — wire to the gateway).

import { useEffect, useMemo, useState } from 'react';
import { useAuthFetch } from '../../hooks/useAuthFetch';

type Role = 'buyer' | 'seller' | 'admin';
type UserStatus = 'active' | 'banned';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  wallet: string | null;  // shortened Phantom address
  joined: string;
}

interface AdminUserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  is_banned?: boolean;
  phantom_wallet_address?: string | null;
  signup_date?: string;
}

const ROLE_BADGE: Record<Role, string> = {
  buyer:  'bg-surface-container-highest text-on-surface-variant',
  seller: 'bg-primary-fixed text-on-primary-fixed-variant',
  admin:  'bg-tertiary/10 text-tertiary',
};

function shortWallet(w?: string | null): string | null {
  return w ? `${w.slice(0, 4)}…${w.slice(-4)}` : null;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const authFetch = useAuthFetch();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | Role>('all');
  const [status, setStatus] = useState<'all' | UserStatus>('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await authFetch('/user/admin/all-users');
        const rows: AdminUserRow[] = res.ok ? await res.json() : [];
        if (alive) {
          setUsers(rows.map((u) => ({
            id: u.id,
            name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email,
            email: u.email,
            role: u.role,
            status: u.is_banned ? 'banned' : 'active',
            wallet: shortWallet(u.phantom_wallet_address),
            joined: fmtDate(u.signup_date),
          })));
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [authFetch]);

  async function toggleBan(id: string) {
    const res = await authFetch(`/user/admin/users/${id}/ban`, { method: 'PATCH' });
    if (!res.ok) { alert('Could not update ban status.'); return; }
    const { is_banned } = await res.json().catch(() => ({ is_banned: undefined }));
    setUsers((prev) => prev.map((u) =>
      u.id === id
        ? { ...u, status: (is_banned ?? u.status !== 'banned') ? 'banned' : 'active' }
        : u,
    ));
  }

  function reset() { setQuery(''); setRole('all'); setStatus('all'); }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== 'all' && u.role !== role) return false;
      if (status !== 'all' && u.status !== status) return false;
      if (q && !(`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [users, query, role, status]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant opacity-60">
            <span>Admin</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-bold">User Directory</span>
          </nav>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight">Users Management</h2>
          <p className="font-body text-on-surface-variant mt-2 max-w-xl">Control access, review balances and wallets, and ban or reinstate accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[280px]">
          <label className="font-label text-[11px] uppercase tracking-wider font-bold mb-2 block opacity-70">Search</label>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, or ID…"
              className="w-full bg-surface-container-lowest border-none h-12 pl-4 pr-10 rounded-xl font-body text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40">search</span>
          </div>
        </div>

        <div className="w-44">
          <label className="font-label text-[11px] uppercase tracking-wider font-bold mb-2 block opacity-70">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as 'all' | Role)} className="w-full bg-surface-container-lowest border-none h-12 rounded-xl font-body text-sm px-3 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none">
            <option value="all">All roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="w-44">
          <label className="font-label text-[11px] uppercase tracking-wider font-bold mb-2 block opacity-70">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | UserStatus)} className="w-full bg-surface-container-lowest border-none h-12 rounded-xl font-body text-sm px-3 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <button onClick={reset} className="h-12 w-12 flex items-center justify-center bg-surface-container-highest rounded-xl text-on-surface hover:bg-surface-variant transition-colors" title="Reset filters">
          <span className="material-symbols-outlined">restart_alt</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden editorial-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                {['User', 'Contact', 'Role', 'Joined', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-5 px-6 font-label text-[11px] uppercase tracking-[0.15em] font-bold text-on-surface-variant opacity-60 ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((u) => {
                const initials = u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                const banned = u.status === 'banned';
                return (
                  <tr key={u.id} className={`hover:bg-surface-container-low transition-colors group ${banned ? 'bg-error-container/5' : ''}`}>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-xs font-black font-label shrink-0">{initials}</div>
                        <div>
                          <p className="font-headline font-bold text-on-surface">{u.name}</p>
                          <p className="font-label text-xs opacity-50 tracking-wider">{u.id} · joined {u.joined}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-body text-sm font-medium">{u.email}</p>
                      {u.wallet && <p className="font-mono text-xs text-[#9945FF] mt-0.5">◎ {u.wallet}</p>}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wide ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-body text-sm text-on-surface-variant">{u.joined}</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${banned ? 'bg-error' : 'bg-secondary'}`} />
                        <span className={`font-label text-[11px] font-bold uppercase tracking-wider ${banned ? 'text-error' : 'text-secondary'}`}>{u.status}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-xs font-bold font-headline text-primary hover:underline">View</button>
                        {u.role !== 'admin' && (
                          banned ? (
                            <button onClick={() => toggleBan(u.id)} className="px-4 py-1.5 rounded-full border border-secondary/30 text-secondary hover:bg-secondary/10 font-bold text-[10px] uppercase tracking-wider transition-colors">Unban</button>
                          ) : (
                            <button onClick={() => toggleBan(u.id)} className="px-4 py-1.5 rounded-full border border-tertiary/30 text-tertiary hover:bg-tertiary/10 font-bold text-[10px] uppercase tracking-wider transition-colors">Ban</button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-on-surface-variant font-body text-sm">
                    {loading ? 'Loading users…' : 'No users match these filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="py-5 px-6 flex items-center justify-between border-t border-outline-variant/10">
          <p className="font-body text-sm opacity-60">Showing {filtered.length} of {users.length} accounts</p>
        </div>
      </div>
    </>
  );
}
