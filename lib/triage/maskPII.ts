// PII 마스킹 — 발화에 포함된 개인정보를 가린다.
// 30일 보존 정책에 따라 utterance를 저장하지 않더라도, LLM 호출 직전에
// 한 번 더 마스킹해 모델 컨텍스트로의 PII 유출을 방지한다.

const PATTERNS: Array<{ name: string; re: RegExp; mask: string }> = [
  // 휴대전화 번호: 010-1234-5678, 010 1234 5678, 01012345678
  { name: 'mobile', re: /\b01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, mask: '[휴대폰]' },
  // 일반 전화: 02-1234-5678, 031-123-4567 등
  { name: 'phone', re: /\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, mask: '[전화]' },
  // 주민등록번호: 901231-1234567 또는 9012311234567
  { name: 'rrn', re: /\b\d{6}[-]?[1-4]\d{6}\b/g, mask: '[주민번호]' },
  // 이메일
  { name: 'email', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, mask: '[이메일]' },
  // 신용카드 (16자리, 4자리 단위 구분)
  { name: 'card', re: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, mask: '[카드]' },
  // 한국 도로명/지번 주소 (단순 휴리스틱: '서울/부산/.../경기 ... 동/로/길 숫자')
  {
    name: 'address',
    re: /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충[북남]|전[북남]|경[북남]|제주)[가-힣\s\d]+[동로길번지][\s\d-]*\d+/g,
    mask: '[주소]',
  },
];

export interface MaskResult {
  text: string;
  hits: Record<string, number>;
}

export function maskPII(input: string): MaskResult {
  let text = input;
  const hits: Record<string, number> = {};
  for (const p of PATTERNS) {
    const matches = text.match(p.re);
    if (matches && matches.length > 0) {
      hits[p.name] = matches.length;
      text = text.replace(p.re, p.mask);
    }
  }
  return { text, hits };
}

export function hasPII(input: string): boolean {
  for (const p of PATTERNS) {
    if (p.re.test(input)) {
      // global 정규식은 lastIndex 상태를 가지므로 reset
      p.re.lastIndex = 0;
      return true;
    }
    p.re.lastIndex = 0;
  }
  return false;
}
