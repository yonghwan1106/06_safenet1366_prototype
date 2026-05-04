'use client';
import type { ChatMessage } from '@/types';
import { severityToColor } from '@/lib/risk/formula';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-yellow-300 text-slate-900 px-3 py-2 text-sm">
          {msg.content}
        </div>
      </div>
    );
  }
  if (msg.role === 'system') {
    return <div className="text-xs text-center text-slate-500">{msg.content}</div>;
  }

  const t = msg.triage;
  return (
    <div className="flex flex-col gap-2 max-w-[85%]">
      <div className="flex gap-2">
        <div className="size-7 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs flex-shrink-0">🛡️</div>
        <div className="rounded-2xl rounded-tl-sm bg-white border px-3 py-2 text-sm text-slate-800 whitespace-pre-line">
          {msg.content}
        </div>
      </div>
      {t && <SeverityBanner triage={t} />}
    </div>
  );
}

function SeverityBanner({ triage }: { triage: NonNullable<ChatMessage['triage']> }) {
  const c = severityToColor(triage.severity);
  const Icon = triage.severity >= 7 ? ShieldAlert : triage.severity >= 4 ? AlertTriangle : ShieldCheck;
  const danger = c.zone === 'danger';
  return (
    <div
      className={`ml-9 rounded-xl border-2 p-3 space-y-2 ${danger ? 'animate-fadein-up shadow-lg' : ''}`}
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
        boxShadow: danger ? `0 0 0 4px ${c.accent}26, 0 8px 24px ${c.accent}33` : undefined,
        animation: danger ? 'safenet-danger-pulse 1.6s ease-in-out infinite' : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold" style={{ color: c.text }}>
          <Icon className="size-4" />
          위험도 {triage.severity}/9 — {c.label}
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-wider">{triage.routing}</div>
      </div>
      {triage.matchedKeywords.length > 0 && (
        <div className="text-xs text-slate-600">
          매칭 키워드: {triage.matchedKeywords.map((k) => `「${k}」`).join(' · ')}
        </div>
      )}
      {triage.cards && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {triage.cards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg p-2 border text-xs">
              <div className="font-bold text-slate-800">{card.icon} {card.title}</div>
              <div className="text-slate-600 mt-1">{card.description}</div>
            </div>
          ))}
        </div>
      )}
      {triage.routing === 'counselor-1366' && (
        <a href="tel:1366" className="block text-center bg-amber-600 text-white rounded-lg py-2 font-bold text-sm hover:bg-amber-700 transition">
          📞 1366 즉시 연결
        </a>
      )}
      {triage.routing === 'emergency-112' && (
        <div className="space-y-2">
          <a
            href="tel:112"
            className="block text-center bg-red-600 text-white rounded-lg py-2 font-bold text-sm hover:bg-red-700 transition animate-pulse"
          >
            🚨 112 즉시 신고
          </a>
          <a
            href="tel:1366"
            className="block text-center bg-white text-red-700 border-2 border-red-300 rounded-lg py-2 font-semibold text-sm hover:bg-red-50 transition"
          >
            📞 1366 상담사 연결 (보호시설 안내)
          </a>
        </div>
      )}
    </div>
  );
}
