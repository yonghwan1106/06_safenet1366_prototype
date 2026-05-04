// GET /api/stats — 익명 통계 집계 응답
// 30일 TTL 보존된 이벤트만 집계, utterance 또는 PII는 절대 노출하지 않는다.
import { NextResponse } from 'next/server';
import { readStats } from '@/lib/store/eventLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await readStats();
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: '집계 실패' }, { status: 500 });
  }
}
