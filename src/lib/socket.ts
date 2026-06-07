// src/lib/socket.ts
// Socket.IO client factories for the two real-time services.
//
// WebSocket traffic does NOT go through the HTTP API gateway — it connects
// straight to each service's Socket.IO namespace with the JWT for auth:
//   • notifications → VITE_NOTIFICATIONS_WS_URL (default http://localhost:3005)
//   • messaging     → VITE_MESSAGING_WS_URL     (default http://localhost:3007)
//
// socket.io-client handles reconnection, heartbeats and transport upgrades.
// On top of that we add:
//   • token refresh on every (re)connect — `auth` is a callback re-invoked each
//     attempt, so a rotated/refreshed JWT is always used (no stale-token loops).
//   • lifecycle monitoring — connect / disconnect / reconnect logging.
//   • auth-failure backstop — stop retrying when the server rejects the token,
//     so an expired/invalid session doesn't hammer the service forever.

import { io, type Socket } from 'socket.io-client';
import { getToken } from './api';

const NOTIFICATIONS_URL =
  (import.meta.env.VITE_NOTIFICATIONS_WS_URL as string | undefined) ?? 'http://localhost:3005';
const MESSAGING_URL =
  (import.meta.env.VITE_MESSAGING_WS_URL as string | undefined) ?? 'http://localhost:3007';

const baseOptions = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: true,
  // `auth` as a callback is re-evaluated on every (re)connection attempt, so the
  // freshest token in storage is always sent — critical after a token refresh.
  auth: (cb: (data: Record<string, unknown>) => void) => cb({ token: getToken() }),
};

/**
 * Attaches reconnection/lifecycle monitoring and an auth-failure backstop.
 * Centralised so both sockets behave identically and observably.
 */
function attachConnectionMonitor(socket: Socket, label: string): void {
  const tag = `[ws:${label}]`;

  socket.on('connect', () => {
    console.info(`${tag} connected (${socket.id})`);
  });

  socket.on('disconnect', (reason) => {
    console.warn(`${tag} disconnected: ${reason}`);
    // "io server disconnect" means the server intentionally closed us (e.g. auth
    // failure). socket.io will NOT auto-reconnect in that case, which is what we
    // want — manual reconnect would just be rejected again.
  });

  socket.io.on('reconnect_attempt', (n) => {
    console.info(`${tag} reconnect attempt #${n}`);
  });

  socket.io.on('reconnect', (n) => {
    console.info(`${tag} reconnected after ${n} attempt(s)`);
  });

  // Handshake auth failures arrive as connect_error with the gateway's message
  // ("Unauthorized"). Treat that as terminal: stop hammering the server with an
  // invalid/expired token until the caller makes a fresh socket (i.e. after the
  // user re-authenticates).
  socket.on('connect_error', (err) => {
    console.warn(`${tag} connect_error: ${err.message}`);
    if (/unauthor/i.test(err.message)) {
      socket.io.opts.reconnection = false;
      socket.disconnect();
    }
  });

  // Backstop for any explicit server-emitted error event.
  socket.on('error', (payload: { message?: string }) => {
    const msg = payload?.message ?? '';
    console.warn(`${tag} server error: ${msg}`);
    if (/unauthor/i.test(msg)) {
      socket.io.opts.reconnection = false;
      socket.disconnect();
    }
  });
}

/** Connects to the notifications namespace, authenticated with the current JWT. */
export function connectNotificationsSocket(): Socket {
  const socket = io(`${NOTIFICATIONS_URL}/ws/notifications`, baseOptions);
  attachConnectionMonitor(socket, 'notifications');
  return socket;
}

/** Connects to the messaging namespace, authenticated with the current JWT. */
export function connectMessagingSocket(): Socket {
  const socket = io(`${MESSAGING_URL}/ws/messaging`, baseOptions);
  attachConnectionMonitor(socket, 'messaging');
  return socket;
}
