import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: '세이프넷 1366 — AI 가정폭력 위험 조기경보',
  description: '신고 이전의 신호를 모아, 신고 이전에 도와준다. 공공데이터 융합 + 익명 LLM + 자동 라우팅.',
  openGraph: {
    title: '세이프넷 1366',
    description: '사후 대응에서 사전 예방으로 — AI 기반 가정폭력 조기경보 데모',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
