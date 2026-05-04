import { Database, Lock, Calculator, GitBranch } from 'lucide-react';

export const metadata = { title: '소개 — 세이프넷 1366' };

const DATASETS = [
  { id: '3072073', name: '여성가족부_가정폭력 실태조사', use: '9,062명 응답 기반 위험요인 학습' },
  { id: '15089597', name: '여성가족부_가정폭력 피해자 지원시설 운영실적', use: '시도별 보호시설 수용량·격차' },
  { id: '3072079', name: '성평등가족부_국가성평등지수', use: '시도 성평등 환경 정규화 가중치' },
  { id: '15054982', name: '여성가족부_가족실태조사', use: '다문화·한부모·조손 가구 가중치' },
  { id: '15085793', name: '여성가족부_기관유형별 폭력예방교육실시 실적', use: '예방교육 공백 지역 식별' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header>
        <div className="text-xs tracking-[0.3em] text-purple-700 uppercase">About · 시스템 소개</div>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-2">세이프넷 1366</h1>
        <p className="text-slate-700 mt-3 max-w-2xl">
          신고 이전의 6~12개월간 1366·1388·다누리·112·129 등 분산 채널에 누적되는 위험 신호를
          동(洞) 단위로 융합 분석하고, 카카오톡 익명 LLM 챗봇으로 시민에게 9등급 트리아지를 제공하는
          AI 정책 서비스의 데모 프로토타입입니다.
        </p>
      </header>

      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="size-5 text-purple-700" />
          <h2 className="text-xl font-bold">Risk-Index 산식</h2>
        </div>
        <div className="bg-slate-900 text-amber-200 font-mono text-sm rounded-lg p-4 leading-relaxed">
          Risk = (0.4 × <span className="text-emerald-300">상담밀도</span> + 0.3 × <span className="text-emerald-300">재상담률</span>)<br />
          {'    '}× (1 − <span className="text-sky-300">시설가용률</span>)<br />
          {'    '}× (1 + <span className="text-pink-300">다문화가중</span> + <span className="text-pink-300">돌봄가중</span>)<br />
          {'    '}× 100<br />
          → 동 단위 0~100 정규화
        </div>
        <p className="text-xs text-slate-500 mt-2">시도·시군구 단위로 갱신, 향후 동(洞) 단위 비식별 집계 협의 후 확장.</p>
      </section>

      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-3">
          <Database className="size-5 text-purple-700" />
          <h2 className="text-xl font-bold">활용 공공데이터 5종</h2>
        </div>
        <div className="space-y-2">
          {DATASETS.map((d) => (
            <div key={d.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">{d.id}</code>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">{d.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{d.use}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">출처: 공공데이터포털 data.go.kr — 데이터 ID는 본선 진출 시 분석 코드와 함께 제출 가능.</p>
      </section>

      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="size-5 text-purple-700" />
          <h2 className="text-xl font-bold">개인정보 보호 (PII Free)</h2>
        </div>
        <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
          <li>연락처는 SHA-256(전화번호+Salt) 해시 후 즉시 폐기, 식별 불가</li>
          <li>발화 내용은 위험 등급 산출 직후 30일 보존, 익명 통계만 영구 저장</li>
          <li>모든 모델 학습은 연합학습(Federated Learning) 도입 검토 — 지자체 데이터 외부 반출 0</li>
          <li>본 데모는 시뮬 데이터로 동작하며, 입력 발화는 페이지 종료 시 클라이언트 메모리에서 폐기됨</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="size-5 text-purple-700" />
          <h2 className="text-xl font-bold">12주 MVP → 18개월 확산 로드맵</h2>
        </div>
        <table className="w-full text-xs">
          <thead className="text-left text-slate-500">
            <tr><th className="py-2 pr-4">주차</th><th className="py-2">산출물</th></tr>
          </thead>
          <tbody className="text-slate-700">
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">1~2주</td><td className="py-2">5종 ETL · 동 단위 정합성 검증</td></tr>
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">3~4주</td><td className="py-2">Risk-Index v1 (LightGBM + SHAP)</td></tr>
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">5~8주</td><td className="py-2">카카오톡 챗봇 MVP, 9등급 라우팅</td></tr>
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">9~10주</td><td className="py-2">자치구 Mapbox 대시보드</td></tr>
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">11~12주</td><td className="py-2">2개 자치구 시범 운영</td></tr>
            <tr className="border-t"><td className="py-2 pr-4 font-semibold">~18개월</td><td className="py-2">전국 시군구 SaaS · 5개 광역 협약</td></tr>
          </tbody>
        </table>
      </section>

      <section className="text-xs text-slate-500 border-t pt-6">
        본 프로토타입은 2026 성평등가족부 공공·AI 데이터 융복합 아이디어 공모전 출품작
        「세이프넷 1366」(박용환)의 시연용 데모입니다. 실제 위급 상황은 1366 또는 112로 연락 바랍니다.
      </section>
    </div>
  );
}
