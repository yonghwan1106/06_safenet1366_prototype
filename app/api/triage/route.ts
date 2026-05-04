// POST /api/triage — 9등급 위험 트리아지 + Claude Haiku 4.5 응답 생성
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { makeTriageResult, runRuleTriage } from '@/lib/triage/ruleEngine';
import { makeAnonId } from '@/lib/triage/anonymize';
import { generateBotMessage } from '@/lib/llm';

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

    // ANTHROPIC_API_KEY가 설정된 경우에만 LLM 응답으로 교체. 미설정 시 룰 기반 fallback.
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { severity, matched } = runRuleTriage(utterance);
        const llmMessage = await generateBotMessage({
          utterance,
          severity,
          routing: result.routing,
          matched,
        });
        if (llmMessage) {
          result.message = llmMessage;
        }
      } catch (llmErr) {
        // LLM 실패 시 룰 기반 메시지 그대로 사용 (서비스 연속성 우선)
        console.error('LLM generation failed, falling back to rule message:', llmErr);
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
