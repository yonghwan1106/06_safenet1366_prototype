import { ChatWindow } from './_components/ChatWindow';

export const metadata = { title: '시민 챗봇 — 세이프넷 1366' };

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-purple-900">익명 상담봇</h1>
        <p className="text-sm text-slate-600">대화는 익명이며 저장되지 않습니다 · 9등급 위험 트리아지 작동</p>
      </div>
      <ChatWindow />
    </div>
  );
}
