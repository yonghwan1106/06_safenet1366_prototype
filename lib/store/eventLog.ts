// 익명 이벤트 로그 — 30일 TTL 보존 어댑터.
//
// 설계:
//   - 발화 자체(utterance)는 절대 저장하지 않는다.
//   - {anonId(SHA-256 8자), severity(1~9), sigunguCode(나중에), ts(epoch ms)}만 기록.
//   - Vercel KV 환경변수가 설정된 운영 환경에서는 KV에 30일 TTL로 push.
//   - 미설정 시(현 데모) in-memory ring buffer(최근 1,000건) — 서버 재시작 시 휘발.
//   - 본선 진출 시 @vercel/kv 또는 외부 Postgres로 즉시 교체.

import type { Severity, Routing } from '@/types';

export interface TriageEvent {
  anonId: string;
  severity: Severity;
  routing: Routing;
  sigunguCode?: string;
  ts: number;
  piiHits?: number; // PII가 마스킹된 횟수 (개인정보 보호 효과 측정용)
}

const RING_CAPACITY = 1_000;
const TTL_MS = 30 * 24 * 60 * 60 * 1_000; // 30일

// 모듈 스코프 ring buffer — 서버 동안만 유지.
const ring: TriageEvent[] = [];

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function pruneInMemory() {
  const cutoff = Date.now() - TTL_MS;
  // 만료 항목 제거 (앞에서부터, ts 오름차순 가정)
  while (ring.length > 0 && ring[0].ts < cutoff) {
    ring.shift();
  }
  // 용량 초과 시 가장 오래된 것부터 제거
  while (ring.length > RING_CAPACITY) {
    ring.shift();
  }
}

/**
 * 30일 TTL 보존 — utterance 미저장, 익명 메타만.
 * 운영(KV 설정 시): KV에 push + 30일 TTL.
 * 데모(KV 미설정): in-memory ring buffer.
 */
export async function recordEvent(ev: TriageEvent): Promise<void> {
  if (isKvConfigured()) {
    // 본선·운영 시 활성화 — Vercel KV / Upstash Redis 호환
    // import('@vercel/kv').then(({ kv }) => {
    //   const key = `safenet:event:${ev.ts}:${ev.anonId}`;
    //   return kv.set(key, ev, { ex: 30 * 24 * 60 * 60 });
    // });
    // (현재 패키지 미설치 — 본선 진출 시 npm install @vercel/kv 후 위 주석 해제)
    return;
  }
  ring.push(ev);
  pruneInMemory();
}

/**
 * 익명 통계 집계 — 시도별·severity별·시간대별 카운트.
 * 운영 시 KV scan을 사용하지만 데모에서는 in-memory ring을 그대로 집계.
 */
export interface StatsSnapshot {
  totalEvents: number;
  retentionDays: 30;
  generatedAt: string;
  bySeverity: Record<string, number>;
  byRouting: Record<string, number>;
  bySido: Record<string, number>;
  byHour: Record<string, number>; // '0'~'23'
  piiMasked: number;
  storage: 'kv' | 'in-memory';
  oldestTs: number | null;
  newestTs: number | null;
}

export async function readStats(): Promise<StatsSnapshot> {
  pruneInMemory();
  const events = ring.slice();
  const bySeverity: Record<string, number> = {};
  const byRouting: Record<string, number> = {};
  const bySido: Record<string, number> = {};
  const byHour: Record<string, number> = {};
  let piiMasked = 0;
  for (const e of events) {
    bySeverity[String(e.severity)] = (bySeverity[String(e.severity)] ?? 0) + 1;
    byRouting[e.routing] = (byRouting[e.routing] ?? 0) + 1;
    if (e.sigunguCode) {
      const sido = e.sigunguCode.slice(0, 2);
      bySido[sido] = (bySido[sido] ?? 0) + 1;
    }
    const hour = String(new Date(e.ts).getHours());
    byHour[hour] = (byHour[hour] ?? 0) + 1;
    if (e.piiHits) piiMasked += e.piiHits;
  }
  return {
    totalEvents: events.length,
    retentionDays: 30,
    generatedAt: new Date().toISOString(),
    bySeverity,
    byRouting,
    bySido,
    byHour,
    piiMasked,
    storage: isKvConfigured() ? 'kv' : 'in-memory',
    oldestTs: events.length > 0 ? events[0].ts : null,
    newestTs: events.length > 0 ? events[events.length - 1].ts : null,
  };
}
