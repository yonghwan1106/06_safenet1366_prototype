// POST /api/triage — 9등급 위험 트리아지 (Edge Runtime)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { makeTriageResult } from '@/lib/triage/ruleEngine';
import { makeAnonId } from '@/lib/triage/anonymize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  utterance: z.string().min(1).max(500),
  sessionToken: z.string().min(8).max(64),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식 오류' }, { status: 400 });
    }
    const { utterance, sessionToken } = parsed.data;
    const anonId = await makeAnonId(sessionToken);
    const result = await makeTriageResult(utterance, anonId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
