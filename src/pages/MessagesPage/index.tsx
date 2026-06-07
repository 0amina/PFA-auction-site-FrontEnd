// src/pages/MessagesPage/index.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Socket } from 'socket.io-client';

import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import type { Conversation, Message } from './types';

import { useAuth } from '../../context/AuthContext';
import { request } from '../../lib/api';
import { connectMessagingSocket } from '../../lib/socket';

/* ───────────────────────── helpers ───────────────────────── */

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

/* ───────────────────────── component ───────────────────────── */

export default function MessagesPage() {
  const { user } = useAuth();
  const myId = user?.id ?? '';

  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkTo = searchParams.get('to');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeId, setActiveId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const activeIdRef = useRef<string>('');
  activeIdRef.current = activeId;

  const deepLinkApplied = useRef(false);

  /* ───────────────────────── message mapper ───────────────────────── */

  const toMessage = useCallback(
    (m: any): Message => ({
      id: m.id,
      sender: m.sender_id === myId ? 'me' : 'other',
      text: m.content,
      time: fmtTime(m.created_at),
    }),
    [myId],
  );

  /* ───────────────────────── inbox load ───────────────────────── */

  useEffect(() => {
    if (!myId) return;

    let alive = true;

    (async () => {
      try {
        const threads = await request<any[]>('/messaging/inbox');

        if (!alive) return;

        const convs: Conversation[] = (threads ?? []).map((t) => ({
          id: String(t.otherUserId),
          name: t.otherUserName,
          lastMessage: t.content,
          time: fmtTime(t.created_at),
          unread: t.unread || undefined,
          avatarInitials: initials(t.otherUserName),
        }));

        setConversations(convs);

        // IMPORTANT: deep link selects existing conversation only
        if (deepLinkTo) {
          setActiveId(String(deepLinkTo));
        } else {
          setActiveId((prev) => prev || convs[0]?.id || '');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [myId]);

  /* ───────────────────────── deep link FIXED ───────────────────────── */

  useEffect(() => {
    if (!myId || !deepLinkTo || deepLinkApplied.current) return;

    deepLinkApplied.current = true;

    // ❌ NO conversation creation here anymore
    // ✔ ONLY select conversation

    setActiveId(String(deepLinkTo));
    setSearchParams({}, { replace: true });

    // optional: fix name if missing
    void request<{ id: string; name: string }>(
      `/messaging/user/${deepLinkTo}/name`,
    )
      .then(({ name }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === deepLinkTo
              ? {
                  ...c,
                  name,
                  avatarInitials: initials(name),
                }
              : c,
          ),
        );
      })
      .catch(() => {});
  }, [myId, deepLinkTo]);

  /* ───────────────────────── websocket ───────────────────────── */

  useEffect(() => {
    if (!myId) return;

    const socket = connectMessagingSocket();
    socketRef.current = socket;

    socket.on('message:new', (m: any) => {
      const otherId =
        m.sender_id === myId ? m.receiver_id : m.sender_id;

      const msg = toMessage(m);
      const incomingUnread =
        m.sender_id !== myId && activeIdRef.current !== otherId;

      setMessages((prev) => {
        const thread = prev[otherId] ?? [];
        if (thread.some((x) => x.id === m.id)) return prev;

        return {
          ...prev,
          [otherId]: [...thread, msg],
        };
      });

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === otherId);

        if (!existing) return prev;

        return prev.map((c) =>
          c.id === otherId
            ? {
                ...c,
                lastMessage: m.content,
                time: fmtTime(m.created_at),
                unread: incomingUnread
                  ? (c.unread ?? 0) + 1
                  : c.unread,
              }
            : c,
        );
      });
    });

    socket.on('typing', ({ from, typing }) => {
      if (from === activeIdRef.current) {
        setIsTyping(typing);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myId, toMessage]);

  /* ───────────────────────── load chat history ───────────────────────── */

  useEffect(() => {
    if (!activeId || !myId) return;

    setIsTyping(false);

    (async () => {
      const history = await request<any[]>(
        `/messaging/conversation/${activeId}`,
      );

      setMessages((prev) => ({
        ...prev,
        [activeId]: (history ?? []).map(toMessage),
      }));
    })();
  }, [activeId, myId, toMessage]);

  /* ───────────────────────── send ───────────────────────── */

  const handleSend = useCallback(
    (text: string) => {
      const socket = socketRef.current;
      if (!socket || !activeId) return;

      socket.emit('message:send', {
        receiverId: activeId,
        content: text,
      });
    },
    [activeId],
  );

  const handleTyping = useCallback(
    (typing: boolean) => {
      socketRef.current?.emit('typing', {
        receiverId: activeId,
        typing,
      });
    },
    [activeId],
  );

  /* ───────────────────────── UI ───────────────────────── */

  const activeConversation = conversations.find(
    (c) => c.id === activeId,
  );

  const activeMessages = messages[activeId] ?? [];

  if (!loading && conversations.length === 0) {
    return (
      <div className="w-full px-4 py-20 text-center text-on-surface-variant">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4">
      <div
        className="flex overflow-hidden rounded-2xl border bg-white"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
        />

        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            onSend={handleSend}
            isTyping={isTyping}
            onTyping={handleTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}