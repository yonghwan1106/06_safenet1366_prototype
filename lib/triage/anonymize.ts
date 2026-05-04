// SHA-256 기반 익명 ID — PII 미저장
// Web Crypto API 사용 (Edge Runtime 호환)

const SALT = process.env.ANON_SALT || 'safenet1366-demo-salt';

export async function makeAnonId(sessionToken: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sessionToken + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 4).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 클라이언트용: 세션 시작 시 무작위 토큰 생성
export function genSessionToken(): string {
  if (typeof window === 'undefined') return Math.random().toString(36).slice(2);
  const a = new Uint8Array(16);
  window.crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
}
