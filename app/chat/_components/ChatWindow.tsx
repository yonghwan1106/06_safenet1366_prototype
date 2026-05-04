'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { EmergencyDialog } from './EmergencyDialog';
import type { TriageResult } from '@/types';

const PRESETS = [
  '요즘 남편이랑 말다툼이 잦아요',
  '아이 앞에서 소리를 지르고 욕을 해요',
  '오늘 칼 들고 위협했어요',
];

export function ChatWindow() {
  const { messages, sessionToken, push, loading, setLoading, openEmergency, reset } = useChatStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(content: string) {
    if (!content.trim() || loading) return;
    push({ id: crypto.randomUUID(), role: 'user', content, ts: Date.now() });
    setText('');
    setLoading(true);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utterance: content, sessionToken }),
      });
      const data: TriageResult = await res.json();
      push({ id: crypto.randomUUID(), role: 'bot', content: data.message, triage: data, ts: Date.now() });
      if (data.routing === 'emergency-112') {
        setTimeout(() => openEmergency(), 800);
      }
    } catch (e) {
      push({ id: crypto.randomUUID(), role: 'system', content: '서버 연결에 문제가 있습니다.', ts: Date.now() });
    } finally {
      setLoading(false);
    }
  }

  const lastTriage = [...messages].reverse().find((m) => m.triage)?.triage;

  return (
    <div className="rounded-2xl bg-white border shadow-sm overflow-hidden flex flex-col" style={{ height: '70vh' }}>
      <div className="px-4 py-3 bg-purple-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">🛡️</div>
          <div>
            <div className="font-bold">SafeNet 1366 Bot</div>
            <div className="text-[10px] opacity-80">익명 ID · {lastTriage?.anonId || '세션 시작 중'}</div>
          </div>
        </div>
        <button onClick={reset} className="text-xs flex items-center gap-1 hover:underline">
          <RotateCcw className="size-3" /> 새로 시작
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-slate-500 text-sm">
            <div className="size-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="size-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="size-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>분석 중…</span>
          </div>
        )}
      </div>

      <div className="border-t bg-white p-3 space-y-2">
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => send(p)} disabled={loading} className="text-xs px-2 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50">
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(text)}
            disabled={loading}
            placeholder="편하게 말씀해 주세요…"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button onClick={() => send(text)} disabled={loading || !text.trim()} className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50">
            <Send className="size-4" />
          </button>
        </div>
      </div>

      <EmergencyDialog />
    </div>
  );
}
