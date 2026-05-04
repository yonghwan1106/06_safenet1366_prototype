import Link from 'next/link';
import { MessageCircle, BarChart3, Sliders, ArrowRight, Shield, Database, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-purple-50 via-white to-slate-50">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="text-xs font-semibold tracking-[0.3em] text-purple-700 uppercase mb-4">
          The SafeNet Review · Vol. I
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
          신고 이전의 6~12개월,<br />
          <span className="text-purple-700 italic">데이터가 말한다</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-700 border-l-4 border-purple-700 pl-6 italic">
          1366·1388·다누리 등 분산 채널의 위험 신호를 통합 분석해 사후 대응에서 사전 예방으로
          정책 패러다임을 전환하는 AI 서비스. <strong>「세이프넷 1366」</strong>의 작동을
          체험해보세요.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-full bg-purple-700 px-6 py-3 text-white font-semibold shadow-lg shadow-purple-200 hover:bg-purple-800 transition">
            시민 챗봇 체험 <ArrowRight className="size-4" />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border-2 border-purple-700 px-6 py-3 text-purple-700 font-semibold hover:bg-purple-50 transition">
            자치구 대시보드 <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y-2 border-slate-900 py-6">
          <Stat n="30만" l="2025 1366 연간 상담" />
          <Stat n="38%" l="재상담률 (재학대 차단 실패)" />
          <Stat n="500억" l="연 잠재 피해비용 절감 추정" />
          <Stat n="9등급" l="AI 위험 트리아지 자동 분류" />
        </div>
      </section>

      {/* 3-Track Cards */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">3개 트랙으로 동작</h2>
        <p className="text-slate-600 mb-8">시민, 자치구, 정책 입안자 각각의 진입점.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <TrackCard
            href="/chat"
            icon={<MessageCircle className="size-8" />}
            title="시민 익명 챗봇"
            desc="카카오톡 스타일 LLM 챗봇. 발화→9등급 트리아지→자동 라우팅 (자가가이드 / 1366 / 112+보호시설)."
            color="purple"
          />
          <TrackCard
            href="/dashboard"
            icon={<BarChart3 className="size-8" />}
            title="자치구 위험 대시보드"
            desc="226개 시군구 동 단위 Risk-Index 코로플레스. 보호시설 가용률·다문화·돌봄 가중치 시각화."
            color="indigo"
          />
          <TrackCard
            href="/admin/triage"
            icon={<Sliders className="size-8" />}
            title="정책 시뮬레이터"
            desc="9등급 임계값 조정·키워드 룰 라이브 테스트. 정책 입안자용 화이트박스."
            color="rose"
          />
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid md:grid-cols-4 gap-4">
          <Pillar icon={<Database />} title="공공데이터 5종" desc="가정폭력 실태조사 · 보호시설 운영실적 · 국가성평등지수 · 가족실태조사 · 폭력예방교육" />
          <Pillar icon={<Zap />} title="LLM × 룰 혼합" desc="Claude Haiku 4.5 응답 생성 + 키워드 룰 9등급 트리아지 + 익명 ID" />
          <Pillar icon={<Shield />} title="자동 라우팅" desc="1~3 자가가이드 / 4~6 1366 / 7~9 112 + 보호시설 + 안전계획" />
          <Pillar icon={<Lock />} title="PII Free" desc="SHA-256 익명ID, 발화 30일 보존, 통계만 영구 (개인정보 비저장)" />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/about" className="text-sm font-semibold text-purple-700 hover:underline">
          → 산식·데이터 출처·윤리 자세히 보기
        </Link>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-extrabold italic text-purple-800">{n}</div>
      <div className="text-xs text-slate-600 mt-1">{l}</div>
    </div>
  );
}

function TrackCard({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: 'purple'|'indigo'|'rose' }) {
  const styles: Record<string, string> = {
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-700 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-700 text-indigo-900',
    rose: 'bg-rose-50 border-rose-200 hover:border-rose-700 text-rose-900',
  };
  return (
    <Link href={href} className={`block rounded-2xl border-2 ${styles[color]} p-6 transition shadow-sm hover:shadow-lg`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
      <div className="mt-4 text-sm font-semibold flex items-center gap-1">
        시작하기 <ArrowRight className="size-3" />
      </div>
    </Link>
  );
}

function Pillar({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg bg-white border p-5">
      <div className="text-purple-700 mb-2">{icon}</div>
      <div className="font-bold text-slate-900 mb-1">{title}</div>
      <div className="text-xs text-slate-600 leading-relaxed">{desc}</div>
    </div>
  );
}
