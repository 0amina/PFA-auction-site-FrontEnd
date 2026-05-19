// src/pages/MessagesPage/index.tsx
// Orchestrator: holds conversation list + active chat state.
// No UI logic here — all rendering delegated to ConversationList and ChatWindow.

import { useState, useEffect } from 'react';
import ConversationList        from './ConversationList';
import ChatWindow              from './ChatWindow';
import type { Conversation, Message } from './types';

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real API calls to your Messaging microservice when ready.

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Julian Sterling',
    lastMessage: 'The provenance papers are authenticated.',
    time: '12:45 PM',
    unread: 2,
    online: true,
    avatarInitials: 'JS',
    lotRef: 'LOT #882: 1964 VINTAGE ROLEX DAYTONA',
  },
  {
    id: '2',
    name: 'Heritage Auctions',
    lastMessage: 'Status update on your recent inquiry.',
    time: 'Yesterday',
    online: false,
    avatarInitials: 'HA',
  },
  {
    id: '3',
    name: 'Clara von Roth',
    lastMessage: 'Would you accept a private offer?',
    time: 'Tue',
    online: false,
    avatarInitials: 'CR',
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      sender: 'other',
      text: "Good morning. I've uploaded the high-resolution scans of the original service history from 1972. You can find them in the 'Saved Lots' attachment section as well.",
      time: '10:15 AM',
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Thank you, Julian. The documentation looks pristine. Just one question: does the original tachymeter bezel show any signs of ghosting or pitting under UV light?',
      time: '10:18 AM',
    },
    {
      id: 'm3',
      sender: 'other',
      text: "Excellent question. It shows a very slight, even patina — what collectors often call 'faded steel' — but absolutely no pitting. It's remarkably clean for its age.",
      time: '10:20 AM',
    },
  ],
  '2': [
    {
      id: 'm1',
      sender: 'other',
      text: 'Thank you for your inquiry. We will have an update on the lot status by end of day.',
      time: 'Yesterday',
    },
  ],
  '3': [
    {
      id: 'm1',
      sender: 'other',
      text: 'Hello, I noticed you have been watching this piece. Would you consider a private sale at 15% above reserve?',
      time: 'Tue',
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [activeId, setActiveId]         = useState('1');
  const [messages, setMessages]         = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [isTyping, setIsTyping]         = useState(false);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);

  const activeConversation = conversations.find((c) => c.id === activeId)!;
  const activeMessages     = messages[activeId] ?? [];

  // Clear unread badge when switching to a conversation
  useEffect(() => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: undefined } : c))
    );
  }, [activeId]);

  function handleSend(text: string) {
    const now  = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text,
      time,
    };

    // Append to active thread
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMsg],
    }));

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, lastMessage: text, time } : c
      )
    );

    // Simulate reply after a short delay
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const reply: Message = {
        id: `m-${Date.now()}-reply`,
        sender: 'other',
        text: "That's a great observation. I'll get the lead curator to double-check under UV and send a short video shortly.",
        time: replyTime,
      };
      setMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), reply],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, lastMessage: reply.text, time: replyTime } : c
        )
      );
    }, 3500);
  }

  return (
    /*
     * This page sits inside MainLayout (Navbar + Sidebar + Footer already present).
     * The split-screen layout fills the remaining viewport height below the 64px navbar.
     * overflow-hidden on this wrapper prevents double scrollbars.
     */
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={activeMessages}
        onSend={handleSend}
        isTyping={isTyping}
      />
    </div>
  );
}