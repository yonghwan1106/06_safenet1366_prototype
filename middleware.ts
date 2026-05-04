// /admin/* 경로 단순 토큰 인증.
// `process.env.ADMIN_TOKEN`이 설정되지 않은 환경(로컬 dev)에서는 통과시킨다.
// 운영(Vercel)에서는 Bearer 헤더 또는 ?token=... 쿼리로 검증.
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  // 토큰이 설정되지 않았으면 인증 우회 (개발/시연 편의)
  if (!expected) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  const queryToken = req.nextUrl.searchParams.get('token') || '';

  if (bearer === expected || queryToken === expected) {
    return NextResponse.next();
  }

  // 인증 실패 — 간단한 401 페이지
  return new NextResponse(
    `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>접근 제한</title>` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<style>body{font-family:Pretendard,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}` +
      `.box{max-width:420px;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;text-align:center}` +
      `h1{margin:0 0 12px;font-size:22px;color:#7c3aed}p{margin:8px 0;color:#475569;font-size:14px;line-height:1.5}</style></head>` +
      `<body><div class="box"><h1>🔒 정책 도구 접근 제한</h1>` +
      `<p>이 영역은 운영자 전용입니다.</p>` +
      `<p>심사 시연을 위해 <code>?token=...</code> 토큰이 필요합니다. 운영사무국에 문의하세요.</p>` +
      `<p style="margin-top:16px"><a href="/" style="color:#7c3aed;text-decoration:none;font-weight:600">← 홈으로</a></p>` +
      `</div></body></html>`,
    { status: 401, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}
