// POST /api/triage — 9등급 위험 트리아지 + Claude Haiku 4.5 응답 생성
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { makeTriageResult, runRuleTriage, nearestShelter } from '@/lib/triage/ruleEngine';
import { makeAnonId } from '@/lib/triage/anonymize';
import { generateBotMessage, isAvoidantResponse } from '@/lib/llm';
import { maskPII } from '@/lib/triage/maskPII';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  utterance: z.string().min(1).max(500),
  sessionToken: z.string().min(8).max(64),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(8)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: '입력 형식 오류' }, { status: 400 });
    }
    const { utterance: rawUtterance, sessionToken, history } = parsed.data;
    // PII 마스킹 — LLM 호출·익명 통계 집계 직전에 한 번 적용 (utterance 자체는 휘발).
    const { text: utterance, hits: piiHits } = maskPII(rawUtterance);
    const anonId = await makeAnonId(sessionToken);
    const result = await makeTriageResult(utterance, anonId);

    // ANTHROPIC_API_KEY가 설정된 경우에만 LLM 응답으로 교체. 미설정 시 룰 기반 fallback.
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { severity, matched } = runRuleTriage(utterance);
        // 이전 대화 history도 PII 마스킹 후 전달
        const safeHistory = (history ?? []).map((h) => ({
          role: h.role,
          content: maskPII(h.content).text,
        }));
        // 가까운 보호시설 1개를 LLM 컨텍스트에 주입 (severity 7-9에서만)
        let shelterCtx: { name: string; remaining: number; multilingual: boolean; phone: string; type: string } | null = null;
        if (severity >= 4) {
          const sh = nearestShelter(undefined);
          if (sh) {
            shelterCtx = {
              name: sh.name,
              remaining: Math.max(0, (sh.capacity ?? 0) - (sh.occupied ?? 0)),
              multilingual: !!sh.multilingual,
              phone: sh.phone,
              type: sh.type,
            };
          }
        }
        const llmResult = await generateBotMessage({
          utterance,
          severity,
          routing: result.routing,
          matched,
          history: safeHistory,
          shelter: shelterCtx,
        });
        if (llmResult.message && !isAvoidantResponse(llmResult.message)) {
          result.message = llmResult.message;
        }
        // LLM이 생성한 동적 자가가이드 카드가 있으면 정적 카드를 교체
        if (llmResult.cards && llmResult.cards.length > 0) {
          result.cards = llmResult.cards;
        }
        // 회피성 응답이면 룰 기반 메시지를 그대로 사용 (이미 result.message에 있음)
      } catch (llmErr) {
        // LLM 실패 시 룰 기반 메시지 그대로 사용 (서비스 연속성 우선)
        console.error('LLM generation failed, falling back to rule message:', llmErr);
      }
    }

    // PII 마스킹 통계 (개수만, 원본 미저장)
    if (Object.keys(piiHits).length > 0) {
      console.info(`[triage] PII masked anonId=${anonId}`, piiHits);
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
