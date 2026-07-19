"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ChatContextValue = {
  open: boolean;
  openChat: () => void;
  closeChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}

export function useChatOptional() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);

  return (
    <ChatContext.Provider value={{ open, openChat, closeChat }}>
      {children}
      <ChatOverlay />
    </ChatContext.Provider>
  );
}

type Msg = { id: string; role: "agent" | "user"; text: string };

function ChatOverlay() {
  const { open, closeChat } = useChat();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Hi — I’m with the KeyNestOS team. Ask about a listing, buying, renting, or selling and we’ll follow up shortly.",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !name.trim() || !email.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setDraft("");
    setStatus("loading");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: "",
        message: text,
        propertyId: null,
        source: "chat",
      }),
    });

    if (res.ok) {
      setStatus("ok");
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: "Thanks — we received your message. An agent will get back to you soon.",
        },
      ]);
    } else {
      setStatus("error");
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "agent",
          text: "Something went wrong sending that. Please try again in a moment.",
        },
      ]);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="chat-overlay" role="presentation">
      {/* Backdrop sits below the header so the nav / side menu stay usable */}
      <button
        type="button"
        className="chat-overlay__backdrop"
        aria-label="Close chat"
        onClick={closeChat}
      />
      <div
        ref={panelRef}
        className="chat-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="chat-overlay__header">
          <div>
            <p className="chat-overlay__kicker">KeyNestOS</p>
            <h2 id={titleId} className="chat-overlay__title">
              Chat with an agent
            </h2>
          </div>
          <button
            type="button"
            className="chat-overlay__close"
            onClick={closeChat}
            aria-label="Close chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="chat-overlay__thread" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-overlay__bubble chat-overlay__bubble--${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form className="chat-overlay__composer" onSubmit={onSubmit}>
          <div className="chat-overlay__meta">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              autoComplete="name"
              aria-label="Name"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              autoComplete="email"
              aria-label="Email"
            />
          </div>
          <div className="chat-overlay__row">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              required
              rows={2}
              aria-label="Message"
            />
            <button
              type="submit"
              className="chat-overlay__send"
              disabled={status === "loading"}
            >
              {status === "loading" ? "…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

/** Button that opens the chat overlay — styled like a nav link */
export function ChatNavButton({
  className,
  onMouseEnter,
  onFocus,
  onBlur,
  setRef,
}: {
  className?: string;
  onNavigate?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  setRef?: (node: HTMLAnchorElement | null) => void;
}) {
  const chat = useChatOptional();

  return (
    <a
      ref={setRef}
      href="/contact"
      role="button"
      className={className}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        chat?.openChat();
      }}
    >
      <span>Chat</span>
    </a>
  );
}
