"use client";

import { useRef, useState } from "react";
import type { Texts } from "@/lib/content";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({ t }: { t: Texts }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const scroll = () =>
    requestAnimationFrame(() => {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    scroll();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const msg = res.status === 429 ? await res.text() : t.chat_error;
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
        scroll();
      }
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : t.chat_error;
      setMessages([...history, { role: "assistant", content: msg }]);
    } finally {
      setBusy(false);
      scroll();
    }
  }

  return (
    <div className="cs-chat">
      {messages.length > 0 && (
        <div className="cs-chat-log" ref={logRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`cs-msg cs-msg-${m.role}`}>
              {m.content || <span className="cs-typing" aria-label="…"><i /><i /><i /></span>}
            </div>
          ))}
        </div>
      )}
      {messages.length === 0 && (
        <div className="cs-chips">
          {t.chat_suggestions.map((s) => (
            <button key={s} type="button" className="cs-chip" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="cs-chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat_placeholder}
          maxLength={500}
          aria-label={t.chat_placeholder}
        />
        <button type="submit" className="cs-btn cs-btn-primary" disabled={busy || !input.trim()}>
          {t.chat_send}
        </button>
      </form>
    </div>
  );
}
