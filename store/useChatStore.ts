// 챗봇 상태 — Zustand
'use client';
import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { genSessionToken } from '@/lib/triage/anonymize';

interface ChatStore {
  messages: ChatMessage[];
  sessionToken: string;
  loading: boolean;
  emergencyOpen: boolean;
  push: (m: ChatMessage) => void;
  setLoading: (b: boolean) => void;
  openEmergency: () => void;
  closeEmergency: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [
    {
      id: 'init',
      role: 'bot',
      content: '안녕하세요. 세이프넷 1366 익명 상담봇입니다. 무슨 일이 있으신가요? 편하게 말씀해 주세요. 모든 대화는 익명이며 저장되지 않습니다.',
      ts: Date.now(),
    },
  ],
  sessionToken: genSessionToken(),
  loading: false,
  emergencyOpen: false,
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setLoading: (b) => set({ loading: b }),
  openEmergency: () => set({ emergencyOpen: true }),
  closeEmergency: () => set({ emergencyOpen: false }),
  reset: () => set({ messages: [], sessionToken: genSessionToken(), emergencyOpen: false }),
}));
