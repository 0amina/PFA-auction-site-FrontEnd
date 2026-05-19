// src/pages/MessagesPage/ChatWindow.tsx

import { useState, useRef, useEffect } from 'react';
import { Link }                        from 'react-router-dom';
import type { Conversation, Message }  from './types';

interface Props {
  conversation: Conversation;
  messages:     Message[];
  onSend:       (text: string) => void;
  isTyping:     boolean;
}

export default function ChatWindow({ conversation, messages, onSend, isTyping }: Props) {
  const [draft, setDraft]   = useState('');
  const bottomRef           = useRef<HTMLDivElement>(null);
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="flex-1 flex flex-col bg-[#f7f9fb] min-w-0">

      {/* ── Chat header ── */}
      <header className="h-[72px] flex items-center justify-between px-6 bg-[#f2f4f6]
        border-b border-[#c7c4d8]/10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3525cd] to-[#4f46e5]
              flex items-center justify-center text-white text-sm font-black font-[Inter]">
              {conversation.avatarInitials}
            </div>
            {conversation.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#006c49] border-2 border-[#f2f4f6] rounded-full" />
            )}
          </div>

          {/* Name + status */}
          <div>
            <h2 className="font-[Plus_Jakarta_Sans] font-bold text-[#191c1e] leading-tight">
              {conversation.name}
            </h2>
            <div className="flex items-center gap-2">
              {conversation.online && (
                <>
                  <span className="font-[Inter] text-[10px] text-[#006c49] font-bold uppercase tracking-wider">
                    Online
                  </span>
                  <span className="w-1 h-1 bg-[#c7c4d8] rounded-full" />
                </>
              )}
              {conversation.lotRef && (
                <span className="font-[Inter] text-[10px] text-[#3525cd] font-bold uppercase tracking-wider">
                  {conversation.lotRef}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg
            text-[#464555] hover:bg-[#e6e8ea] transition-colors">
            <span className="material-symbols-outlined text-xl">info</span>
          </button>
          {conversation.lotRef && (
            <Link
              to={`/auctions/1`}
              className="px-5 py-2 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] text-white
                font-[Plus_Jakarta_Sans] font-bold text-sm rounded-full hover:opacity-90
                active:scale-95 transition-all"
            >
              Place Bid
            </Link>
          )}
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#e0e3e5] [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* Date divider — static for now, wire dynamically when using real data */}
        <div className="flex justify-center">
          <span className="px-4 py-1 bg-[#e6e8ea]/60 rounded-full
            font-[Inter] text-[10px] text-[#777587] uppercase tracking-widest">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[78%] ${msg.sender === 'me' ? 'items-end ml-auto' : 'items-start'}`}
          >
            {/* Timestamp + label */}
            <div className={`flex items-center gap-2 mb-1 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
              <span className="font-[Inter] text-[10px] font-bold uppercase tracking-wide
                text-[#464555]">
                {msg.sender === 'me' ? 'You' : conversation.name.split(' ')[0]}
              </span>
              <span className="font-[Inter] text-[10px] text-[#777587]">{msg.time}</span>
            </div>

            {/* Bubble */}
            <div className={[
              'px-4 py-3 font-[Manrope] text-sm leading-relaxed shadow-sm',
              msg.sender === 'me'
                ? 'bg-[#4f46e5] text-white rounded-2xl rounded-br-[4px]'
                : 'bg-[#e6e8ea] text-[#191c1e] rounded-2xl rounded-bl-[4px]',
            ].join(' ')}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex flex-col items-start max-w-[78%]">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-[Inter] text-[10px] font-bold uppercase tracking-wide text-[#464555]">
                {conversation.name.split(' ')[0]}
              </span>
            </div>
            <div className="px-4 py-3 bg-[#e6e8ea] rounded-2xl rounded-bl-[4px] flex items-center gap-1">
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 bg-[#777587] rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="px-6 py-4 bg-[#f7f9fb] shrink-0">
        <div className="bg-white/80 backdrop-blur-2xl border border-[#c7c4d8]/15 rounded-2xl
          shadow-md flex items-end gap-2 p-2 max-w-4xl mx-auto">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl
            text-[#777587] hover:bg-[#f2f4f6] transition-colors shrink-0">
            <span className="material-symbols-outlined text-xl">attach_file</span>
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 border-none bg-transparent outline-none resize-none
              font-[Manrope] text-sm text-[#191c1e] placeholder:text-[#777587]
              py-2 px-1 max-h-32
              [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#e0e3e5]"
          />

          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-xl
              bg-[#3525cd] text-white hover:bg-[#4f46e5] active:scale-95
              transition-all shrink-0 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>

    </section>
  );
}