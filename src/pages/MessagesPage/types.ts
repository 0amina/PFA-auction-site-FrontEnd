// src/pages/MessagesPage/types.ts

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  avatarInitials: string;
  lotRef?: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}