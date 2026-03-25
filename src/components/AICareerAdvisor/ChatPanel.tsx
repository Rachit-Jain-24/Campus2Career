// Feature: ai-career-advisor-chatbot
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import * as chatbotService from '@/lib/ai/chatbotService';
import type { StudentUser } from '@/types/auth';
import type { TransparencyMeta, Message } from '@/lib/ai/types';
import { TransparencyPanel } from './TransparencyPanel';
import { SuggestedPrompts } from './SuggestedPrompts';

export interface ChatPanelProps {
  student: StudentUser;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

/**
 * Generate a personalized welcome message for the student.
 * Exported for property-based testing (Property 19).
 */
export function generateWelcomeMessage(student: { name: string; careerTrack: string }): string {
  return `Hi ${student.name}! 👋 Welcome to your AI Career Advisor. I'm here to help you on your journey toward becoming a ${student.careerTrack} professional. What would you like to explore today?`;
}

function buildWelcomeMessage(student: StudentUser): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: generateWelcomeMessage({
      name: student.name,
      careerTrack: student.careerTrack ?? 'Software Engineer',
    }),
    timestamp: Date.now(),
  };
}

export function ChatPanel({ student, onClose, onUnreadChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() => [buildWelcomeMessage(student)]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chatbot service on mount
  useEffect(() => {
    chatbotService.initialize(student).catch(console.error);
  }, [student]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine if suggested prompts should be shown
  const showSuggestedPrompts =
    suggestedPrompts.length > 0 &&
    (messages.length <= 1 || messages[messages.length - 1]?.role === 'assistant');

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    // Show typing indicator immediately (within 100ms)
    setIsLoading(true);

    // Placeholder for streaming assistant message
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const response = await chatbotService.sendMessage(text, student);

      // Attach transparencyMeta once we have it
      const meta: TransparencyMeta = response.transparencyMeta;

      // Collect all stream chunks
      let accumulated = '';
      for await (const chunk of response.stream) {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, transparencyMeta: meta, isStreaming: true }
              : m
          )
        );
      }

      // Mark streaming complete — ensure content is set even if stream was empty
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: accumulated || '(No response received)', transparencyMeta: meta, isStreaming: false }
            : m
        )
      );

      // Update suggested prompts
      setSuggestedPrompts(response.suggestedPrompts ?? []);

      // Notify parent of unread (if needed)
      onUnreadChange(0);
    } catch (err) {
      const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      console.error('ChatPanel sendMessage error (full):', errMsg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `Error: ${err instanceof Error ? err.message : String(err)}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, student, onUnreadChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    // Submit immediately
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    // Trigger send with the prompt text directly
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSuggestedPrompts([]);
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    chatbotService
      .sendMessage(prompt, student)
      .then(async (response) => {
        const meta: TransparencyMeta = response.transparencyMeta;
        let accumulated = '';
        for await (const chunk of response.stream) {
          accumulated += chunk;
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: snapshot, transparencyMeta: meta, isStreaming: true }
                : m
            )
          );
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, transparencyMeta: meta, isStreaming: false }
              : m
          )
        );
        setSuggestedPrompts(response.suggestedPrompts ?? []);
        onUnreadChange(0);
      })
      .catch((err) => {
        console.error('ChatPanel suggested prompt error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
              : m
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
        setInputValue('');
      });
  };

  const handleClearChat = () => {
    chatbotService.clearSession(student.uid);
    setMessages([buildWelcomeMessage(student)]);
    setSuggestedPrompts([]);
    setInputValue('');
  };

  const panelSizeClass = isFullScreen
    ? 'max-w-[800px] w-full h-full'
    : 'w-[400px] h-[560px]';

  return (
    <div
      role="dialog"
      aria-label="AI Career Advisor Chat"
      className={`flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden ${panelSizeClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">AI Career Advisor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
            title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : ''}`}>
              {/* Bubble */}
              <div
                className={
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm'
                    : 'bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm'
                }
              >
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block ml-1 animate-pulse">▋</span>
                )}
              </div>

              {/* Transparency panel for assistant messages */}
              {message.role === 'assistant' && message.transparencyMeta && (
                <TransparencyPanel meta={message.transparencyMeta} />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.isStreaming === true && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {showSuggestedPrompts && (
        <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleSuggestedPrompt} />
      )}

      {/* Input area */}
      <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
        <div className="flex items-end gap-2 bg-muted/50 rounded-xl border border-border px-3 py-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your career..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-32 disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
