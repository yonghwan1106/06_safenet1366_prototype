// SafeNet 1366 — 9등급 위험 트리아지 룰 엔진
import type { KeywordRule, Severity, Routing, TriageResult, SelfCareCard } from '@/types';
import keywordsRaw from '@/data/keywords-9rank.json';

// Next.js JSON import이 default-wrapped 가능 → 안전하게 정규화
const RULES = (Array.isArray(keywordsRaw) ? keywordsRaw : (keywordsRaw as { default?: unknown }).default ?? []) as KeywordRule[];

const SELF_CARE_CARDS: SelfCareCard[] = [
  { id: 'sc1', title: '감정 조절 가이드', description: '당신의 감정을 인지하고 안전하게 표현하는 5단계 워크북', icon: '💭' },
  { id: 'sc2', title: '의사소통 워크북', description: '비폭력 대화(NVC) 기반 부부·가족 대화 PDF', icon: '💬' },
  { id: 'sc3', title: '심리 상담 인근 기관', description: '거주지 인근 무료 심리상담 센터 검색 (정신건강복지센터)', icon: '🏥' },
  { id: 'sc4', title: '가족 갈등 자가진단', description: '12문항으로 점검하는 가족관계 위험도 자가진단', icon: '📋' },
];

const SAFETY_PLAN_TEMPLATE: string[] = [
  '지금 안전한 장소(이웃집·근처 카페·24시 편의점)로 이동하세요.',
  '가까운 가족·친구 1명에게 위치를 알리세요.',
  '신분증·휴대폰 충전기·약·아이용품을 한 가방에 모아두세요.',
  '비상금(현금 5만원)과 카드를 안전한 곳에 보관하세요.',
  '폭력 발생 시 112에 즉시 신고하세요.',
  '여성긴급전화 1366 (24시간) — 상담·보호시설 연계',
  '한국여성의전화 1234 — 법률·심리 지원',
];

const MOCK_SHELTERS = [
  { id: 'sh1', name: '서울여성위기지원센터', sigunguCode: '11680', lat: 37.514, lng: 127.046, capacity: 30, occupied: 22, type: 'emergency' as const, multilingual: true, phone: '02-XXXX-1366' },
  { id: 'sh2', name: '강서구 가정폭력 상담소', sigunguCode: '11500', lat: 37.551, lng: 126.849, capacity: 20, occupied: 18, type: 'short' as const, multilingual: false, phone: '02-XXXX-2366' },
  { id: 'sh3', name: '여성긴급전화 1366 서울센터', sigunguCode: '11110', lat: 37.572, lng: 126.978, capacity: 0, occupied: 0, type: 'emergency' as const, multilingual: true, phone: '1366' },
];

export function runRuleTriage(utterance: string): { severity: Severity; matched: string[] } {
  const normalized = utterance.toLowerCase().replace(/\s+/g, '');
  const scores: Record<number, number> = {};
  const matched: string[] = [];

  for (const rule of RULES) {
    for (const kw of rule.patterns) {
      const kwNorm = kw.toLowerCase().replace(/\s+/g, '');
      if (normalized.includes(kwNorm)) {
        scores[rule.severity] = (scores[rule.severity] || 0) + rule.weight;
        if (!matched.includes(kw)) matched.push(kw);
      }
    }
  }

  let topSeverity: Severity = 2;
  let topScore = 0;
  for (const [sevStr, score] of Object.entries(scores)) {
    const sev = parseInt(sevStr) as Severity;
    if (score > topScore || (score === topScore && sev > topSeverity)) {
      topSeverity = sev;
      topScore = score;
    }
  }
  return { severity: topSeverity, matched };
}

function routingFromSeverity(s: Severity): Routing {
  if (s <= 3) return 'self-care';
  if (s <= 6) return 'counselor-1366';
  return 'emergency-112';
}

function botMessage(s: Severity, routing: Routing): string {
  if (routing === 'emergency-112') {
    return `현재 상황이 매우 위험할 수 있어요. 지금 안전한 장소에 계신가요?\n\n• 위급 상황이면 즉시 112를 누르세요.\n• 가까운 보호시설 위치를 안내해드립니다.\n• 안전계획 카드를 보내드릴게요.`;
  }
  if (routing === 'counselor-1366') {
    return `지금 많이 힘드시겠어요. 1366 여성긴급전화 상담사와 연결을 권해드립니다.\n\n• 24시간 무료 익명 상담\n• 통화·문자·온라인 모두 가능\n• 필요 시 보호시설로 즉시 연계`;
  }
  return `이야기해 주셔서 감사합니다. 가벼운 자가관리부터 시작해보시면 어떨까요?\n\n아래 자가관리 카드를 참고해 보세요. 더 도움이 필요하면 언제든 말씀해 주세요.`;
}

export async function makeTriageResult(
  utterance: string,
  anonId: string
): Promise<TriageResult> {
  const { severity, matched } = runRuleTriage(utterance);
  const routing = routingFromSeverity(severity);
  const result: TriageResult = {
    severity,
    routing,
    matchedKeywords: matched,
    anonId,
    message: botMessage(severity, routing),
    timestamp: new Date().toISOString(),
  };
  if (routing === 'self-care') {
    result.cards = SELF_CARE_CARDS.slice(0, 3);
  } else if (routing === 'emergency-112') {
    result.shelters = MOCK_SHELTERS;
    result.safetyPlan = SAFETY_PLAN_TEMPLATE;
  }
  return result;
}
