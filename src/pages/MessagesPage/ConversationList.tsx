// src/pages/MessagesPage/ConversationList.tsx

import type { Conversation } from './types';

interface Props {
  conversations: Conversation[];
  activeId:      string;
  onSelect:      (id: string) => void;
}

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  return (
    <aside className="w-80 lg:w-[30%] bg-[#f2f4f6] flex flex-col border-r border-[#c7c4d8]/10 shrink-0">

      {/* Search */}
      <div className="p-5">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#e0e3e5] rounded-full border-none
              font-[Manrope] text-sm focus:bg-white focus:ring-1 focus:ring-[#c7c4d8]/30 transition-all outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#e0e3e5] [&::-webkit-scrollbar-thumb]:rounded-full">
        {conversations.map((conv) => {
          const active = conv.id === activeId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={[
                'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all active:scale-[0.98]',
                active
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-[#e6e8ea]/60',
              ].join(' ')}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3525cd] to-[#4f46e5]
                  flex items-center justify-center text-white text-sm font-black font-[Inter]">
                  {conv.avatarInitials}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#006c49] border-2 border-[#f2f4f6] rounded-full" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-[Plus_Jakarta_Sans] font-bold text-sm text-[#191c1e] truncate">
                    {conv.name}
                  </span>
                  <span className="font-[Inter] text-[10px] text-[#777587] uppercase tracking-tight shrink-0 ml-2">
                    {conv.time}
                  </span>
                </div>
                <p className={`font-[Manrope] text-xs truncate ${conv.unread ? 'text-[#191c1e] font-semibold' : 'text-[#777587]'}`}>
                  {conv.lastMessage}
                </p>
              </div>

              {/* Unread badge */}
              {conv.unread && conv.unread > 0 && (
                <span className="w-5 h-5 bg-[#3525cd] rounded-full flex items-center justify-center
                  font-[Inter] text-[10px] text-white font-bold shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}