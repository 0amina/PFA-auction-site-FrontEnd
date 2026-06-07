// src/context/NotificationsContext.tsx
// Holds the user's notifications, kept live over the notifications WebSocket
// (with an initial REST fetch for history). Shared by the Navbar bell badge and
// the NotificationsPage so both stay in sync from a single source.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { request } from '../lib/api';
import { connectNotificationsSocket } from '../lib/socket';

export interface UiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  auctionId: string | null;
  read: boolean;
  createdAt: string;
}

interface NotifRow {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  auction_id?: string | null;
  created_at: string;
}

function toUi(r: NotifRow): UiNotification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    auctionId: r.auction_id ?? null,
    read: !!r.is_read,
    createdAt: r.created_at,
  };
}

interface NotificationsContextValue {
  notifications: UiNotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initial history + live socket subscription, scoped to the logged-in user.
  // Keyed on the user *id* (not the user object) so a profile refresh — which
  // produces a new user reference with the same id — doesn't tear down and
  // re-open the socket. The socket reads the freshest token itself on connect.
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const rows = await request<NotifRow[]>(`/notifications/user/${userId}`);
        if (alive) setNotifications((rows ?? []).map(toUi));
      } catch {
        if (alive) setNotifications([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const socket = connectNotificationsSocket();
    socketRef.current = socket;

    socket.on('notification:new', (row: NotifRow) => {
      setNotifications((prev) =>
        prev.some((n) => n.id === row.id) ? prev : [toUi(row), ...prev],
      );
    });

    return () => {
      alive = false;
      socket.off('notification:new');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    void request(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      prev.filter((n) => !n.read).forEach((n) => {
        void request(`/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {});
      });
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
  return ctx;
}
