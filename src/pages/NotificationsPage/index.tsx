// src/pages/NotificationsPage/index.tsx
// Full-width layout (no sidebar) — uses FullWidthLayout from AppRouter.
//
// useState  → active filter tab ('all' | 'unread')
// useMemo   → filtered + sorted notification list (only recomputes on data/filter change)
// useCallback → stable markAllRead handler

import { useState, useMemo } from 'react';
import { useNotifications, type UiNotification } from '../../context/NotificationsContext';

// Icon + colour config keyed by the backend notification types, with a default.
const TYPE_CONFIG: Record<string, { icon: string; iconColor: string; bgColor: string }> = {
  you_won:         { icon: 'stars',    iconColor: 'text-secondary', bgColor: 'bg-secondary-container/20' },
  winner_confirmed:{ icon: 'verified', iconColor: 'text-secondary', bgColor: 'bg-secondary-container/20' },
  auction_ended:   { icon: 'gavel',    iconColor: 'text-primary',   bgColor: 'bg-primary-container/10' },
  outbid:          { icon: 'warning',  iconColor: 'text-tertiary',  bgColor: 'bg-tertiary-container/10' },
};
const DEFAULT_CONFIG = { icon: 'notifications', iconColor: 'text-primary', bgColor: 'bg-primary-container/10' };
const configFor = (type: string) => TYPE_CONFIG[type] ?? DEFAULT_CONFIG;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => filter === 'unread' ? notifications.filter((n) => !n.read) : notifications,
    [notifications, filter],
  );

  return (
    <main className="flex-grow py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 text-base font-bold text-white bg-primary px-2.5 py-0.5 rounded-full align-middle">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-on-surface-variant font-body">
              Stay updated with your latest bids and auction alerts.
            </p>
          </div>

          {/* Filter tabs + mark all read */}
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="font-label text-sm font-bold text-primary hover:underline transition-colors"
              >
                Mark all read
              </button>
            )}
            <div className="inline-flex bg-surface-container-low p-1 rounded-xl">
              {(['all', 'unread'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                    filter === f
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-1">
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant font-body">Loading notifications…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant font-body">
              <span className="material-symbols-outlined text-5xl mb-4 block text-outline">notifications_off</span>
              No {filter === 'unread' ? 'unread ' : ''}notifications.
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markRead} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

// ─── NotificationItem — local to this page ────────────────────────────────────
function NotificationItem({ notification: n, onRead }: { notification: UiNotification; onRead: (id: string) => void }) {
  const { icon, iconColor, bgColor } = configFor(n.type);

  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`group transition-all duration-300 p-6 rounded-xl flex items-start gap-5 relative cursor-pointer ${
        !n.read
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'bg-surface-container-lowest hover:bg-surface-container-low'
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
        <span
          className={`material-symbols-outlined ${iconColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-on-surface">{n.title}</p>
          {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" />}
        </div>
        <p className="text-on-surface-variant text-sm mb-2">
          {n.message}{' '}
          {n.auctionId && (
            <a
              href={`/auctions/${n.auctionId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary font-semibold hover:underline"
            >
              View lot
            </a>
          )}
        </p>
        <span className="font-label text-xs text-outline font-medium">{timeAgo(n.createdAt)}</span>
      </div>

      {/* More button */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-surface-container-high shrink-0"
        aria-label="More options"
      >
        <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
      </button>
    </div>
  );
}
