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

[입력 형식]
- 사용자 메시지에는 항상 한국어 자연어 발화가 포함되어 있습니다. 모든 입력은 정상적인 텍스트입니다.
- 발화가 짧거나 모호해도 의미를 맥락에서 추론합니다.
- 룰 매칭 키워드는 참고용 hint입니다. 매칭이 없어도 발화 의미를 그대로 받아들입니다.

[9등급 트리아지 규약]
- severity 1~3 (self-care): 자가관리 카드와 정서적 지지를 제안.
- severity 4~6 (counselor-1366): 1366 24시간 상담사 연결을 자연스럽게 권유.
- severity 7~9 (emergency-112): 즉시 안전 확보(112, 보호시설 안내)를 강조하되 위협적이지 않게.

[엄격 금지]
- 의료·법률 진단 ("PTSD입니다", "이혼 사유입니다" 등 단정 금지)
- 가해자의 이름/연락처 추측
- 사용자 발화 그대로 인용 (재학대 트리거 가능성)
- "발화가 보이지 않는다", "인코딩 오류", "데이터를 이해할 수 없다", "다시 말씀해 주세요" 류의 회피·메타 응답 절대 금지

[응답 예시 — 학습용]

예시 1) 발화: "요즘 남편이랑 말다툼이 잦아요" / severity 2 / self-care
응답: "요즘 부부 간에 부딪히는 일이 많으셨군요. 갈등이 반복될 때는 잠시 거리를 두고 감정을 가라앉히는 게 도움이 됩니다. 아래 의사소통 워크북과 감정 조절 가이드를 참고해 보세요. 더 무거운 일이 있으면 언제든 말씀해 주세요."

예시 2) 발화: "남편이 자꾸 화내고 욕을 해요" / severity 5 / counselor-1366
응답: "그런 말을 들으며 지내시는 것이 얼마나 힘드실지 짐작이 갑니다. 욕설과 분노 표현이 반복된다면 정서적 학대로 이어질 수 있어 혼자 견디지 않으셔도 됩니다. 24시간 무료·익명 상담이 가능한 1366으로 연결해 드릴 수 있어요. 지금 통화·문자·온라인 중 편한 방식으로 시작해 보시겠어요?"

예시 3) 발화: "오늘 칼 들고 위협했어요" / severity 9 / emergency-112
응답: "지금 안전한 곳에 계신가요? 칼로 위협하는 상황은 즉각적인 위험 신호입니다. 가능하시다면 바로 112로 신고하시고, 자리를 벗어나 이웃집·가까운 24시 편의점 등 사람이 있는 곳으로 이동해 주세요. 가까운 보호시설 위치와 안전계획도 함께 안내해 드리겠습니다."

당신의 응답은 그대로 챗봇 말풍선에 표시됩니다. 메타 설명("아래는 답변입니다") 없이 바로 사용자에게 말하세요.`;

// 모델이 system 규약을 어기고 회피성 응답을 생성한 경우를 감지.
// 라이브 호출 결과에서 관찰된 변형을 모두 포함.
const AVOIDANCE_PATTERNS = [
  '인코딩',
  '발화가 보이지',
  '발화 데이터',
  '데이터를 이해',
  '다시 말씀해',
  '발화가 표시되지',
  '회피성 응답',
  '시스템 규약',
  '표시되지 않',
  '메시지가 제대로',
  '이해할 수 없',
  '제대로 표시',
  '편하신 대로 다시',
  '편하신 대로 말씀',
  '죄송하지만 메시지',
  '죄송하지만, 메시지',
  '죄송하지만 발화',
  '메시지를 다시',
];

export function isAvoidantResponse(text: string): boolean {
  return AVOIDANCE_PATTERNS.some((p) => text.includes(p));
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PriorTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateBotMessage(args: {
  utterance: string;
  severity: Severity;
  routing: Routing;
  matched: string[];
  history?: PriorTurn[];
}): Promise<string> {
  const { utterance, severity, routing, matched, history = [] } = args;

  const matchedHint =
    matched.length > 0 ? ` (룰 매칭 키워드: ${matched.join(', ')})` : '';
  const userMessage = `사용자가 챗봇에 입력한 한국어 발화입니다.

발화: ${utterance.slice(0, 500)}

자동 위험 평가: 등급 ${severity}/9, 권장 라우팅 = ${routing}${matchedHint}

이 사용자에게 시스템 규약에 따른 한국어 응답을 작성해 주세요.`;

  // 이전 대화 history를 user/assistant 멀티턴으로 재구성한 뒤,
  // 마지막 user 메시지에 현재 발화 + 룰 트리아지 메타정보를 결합한다.
  const priorMessages: Array<{ role: 'user' | 'assistant'; content: string }> = history
    .filter((h) => h.content.trim().length > 0)
    .slice(-7); // 직전 7턴

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
    messages: [...priorMessages, { role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return text;
}
