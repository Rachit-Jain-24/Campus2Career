// Feature: ai-career-advisor-chatbot
import { useState } from 'react';
import { Bot } from 'lucide-react';
import type { StudentUser } from '@/types/auth';
import { ChatPanel } from './ChatPanel';

interface ChatWidgetProps {
  student: StudentUser;
}

export function ChatWidget({ student }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel — mounted only when open */}
      {isOpen && (
        <ChatPanel
          student={student}
          onClose={() => setIsOpen(false)}
          onUnreadChange={setUnreadCount}
        />
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI Career Advisor"
        className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center"
      >
        <Bot className="h-6 w-6" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
