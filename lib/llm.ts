// SafeNet 1366 — Claude Haiku 4.5 응답 생성기
// 룰 기반 트리아지 결과를 받아 따뜻한 자연어 응답을 합성한다.
import Anthropic from '@anthropic-ai/sdk';
import type { Severity, Routing } from '@/types';

const SYSTEM_PROMPT = `당신은 한국 여성긴급전화 1366 「세이프넷」 챗봇입니다.

[역할]
- 가정폭력·가족갈등을 겪는 시민에게 비폭력적이고 따뜻한 일차 응답을 제공합니다.
- 당신은 의사도 변호사도 아닙니다. 진단·법률 자문 대신 공감·자가관리·전문기관 연계에 집중합니다.

[톤·스타일]
- 한국어 존댓말. 짧고 명료한 문장. 3~5문장 이내.
- 위로/공감 → 핵심 안내(자가관리, 1366, 또는 112) → 다음 한 단계 행동 제시.
- 절대 가해자를 비난하거나 판단하는 표현 금지. 피해 책임을 피해자에게 돌리지 않습니다.
- 이모지 최소화(0~1개), 군더더기 인사 생략.

[9등급 트리아지 규약]
- severity 1~3 (self-care): 자가관리 카드와 정서적 지지를 제안.
- severity 4~6 (counselor-1366): 1366 24시간 상담사 연결을 자연스럽게 권유.
- severity 7~9 (emergency-112): 즉시 안전 확보(112, 보호시설 안내)를 강조하되 위협적이지 않게.

[금지]
- 의료·법률 진단 ("PTSD입니다", "이혼 사유입니다" 등 단정 금지)
- 가해자의 이름/연락처 추측
- 사용자 발화 그대로 인용 (재학대 트리거 가능성)

당신의 응답은 그대로 챗봇 말풍선에 표시됩니다. 메타 설명("아래는 답변입니다") 없이 바로 사용자에게 말하세요.`;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateBotMessage(args: {
  utterance: string;
  severity: Severity;
  routing: Routing;
  matched: string[];
}): Promise<string> {
  const { utterance, severity, routing, matched } = args;

  const userMessage = `[트리아지 결과]
- 위험도(1~9): ${severity}
- 라우팅: ${routing}
- 매칭 키워드: ${matched.length > 0 ? matched.join(', ') : '없음'}

[사용자 발화 요약]
${utterance.slice(0, 300)}

위 정보를 바탕으로 사용자에게 보낼 한국어 응답 메시지를 작성하세요.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return text;
}
