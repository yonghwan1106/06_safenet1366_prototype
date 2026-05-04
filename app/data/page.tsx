import Link from 'next/link';
import { Database, ExternalLink, FileText, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const metadata = {
  title: '데이터 카탈로그 — 세이프넷 1366',
  description: '5종 공공데이터 융합 산식과 출처 메타.',
};

interface Dataset {
  name: string;
  source: string;
  publicId: string;
  year: string;
  scale: string;
  role: string;
  fields: string[];
  status: 'verified' | 'simulated' | 'planned';
  url?: string;
}

const DATASETS: Dataset[] = [
  {
    name: '가정폭력 실태조사',
    source: '여성가족부',
    publicId: '3072073',
    year: '2022-12',
    scale: '응답자 9,062명 · 행정구역 17 시도',
    role: 'Risk-Index의 위험요인(폭력 유형·재발률·신고지연) 학습 베이스',
    fields: ['ageBand', 'abuseType', 'recallMonths', 'reportedToPolice', 'helpSeekingChannel'],
    status: 'verified',
    url: 'https://www.data.go.kr/data/3072073/fileData.do',
  },
  {
    name: '피해자 지원시설 운영실적',
    source: '여성가족부',
    publicId: '15089597',
    year: '2023-12',
    scale: '전국 보호시설 185개소 · 시도/시군구 단위 합계',
    role: '시군구 단위 capacity·occupancy → shelterAvailability 컴포넌트 산출',
    fields: ['shelterId', 'sigunguCode', 'capacity', 'occupied', 'multilingual', 'type'],
    status: 'simulated',
    url: 'https://www.data.go.kr/data/15089597/fileData.do',
  },
  {
    name: '국가성평등지수',
    source: '성평등가족부',
    publicId: '3072079',
    year: '2024-12',
    scale: '시도 17개 · 8개 영역 가중치',
    role: '지역별 정규화 가중치(multicultureWeight 일부)',
    fields: ['sidoCode', 'compositeIndex', 'subIndices'],
    status: 'verified',
    url: 'https://www.data.go.kr/data/3072079/fileData.do',
  },
  {
    name: '가족실태조사',
    source: '여성가족부',
    publicId: '15054982',
    year: '2021-09',
    scale: '다문화·한부모·조손 가구 규모',
    role: '가구 구조 가중치(childcareWeight)',
    fields: ['sidoCode', 'multicultureRatio', 'singleParentRatio', 'grandparentRatio'],
    status: 'verified',
    url: 'https://www.data.go.kr/data/15054982/fileData.do',
  },
  {
    name: '폭력예방교육 실시현황',
    source: '여성가족부',
    publicId: '15085793',
    year: '2023-11',
    scale: '기관별 실시 비율',
    role: '예방교육 공백 지역 식별 (가중치 보조)',
    fields: ['sidoCode', 'institutionType', 'completionRate'],
    status: 'verified',
    url: 'https://www.data.go.kr/data/15085793/fileData.do',
  },
];

const FORMULA = `Risk-Index =
  (0.4 × counselDensity + 0.3 × recallRate)
  × (1 − shelterAvailability)
  × (1 + (multicultureWeight − 1) + (childcareWeight − 1))
  × 100`;

const ROADMAP = [
  { phase: '본 프로토타입 (현재)', items: ['5종 메타·산식 공개', 'Mock 데이터로 UI/UX 작동 검증', 'Claude Haiku 4.5 LLM 합성', '익명 SHA-256 ID + PII 마스킹'] },
  { phase: '본선 진출 시 (1~2주)', items: ['data.go.kr 5종 실제 ETL', 'Vworld 지오코딩 시군구 청사', '국토부 행정동 GeoJSON 폴리곤', 'Vercel KV 30일 보존 + 익명 통계'] },
  { phase: '시범사업 (4~12주)', items: ['1366·112 API 연계 MOU', 'PIA(개인정보 영향평가) 수행', '2개 자치구 파일럿', '월 단위 리포트 배포'] },
];

export default function DataCatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Hero */}
      <section>
        <div className="text-xs font-semibold tracking-[0.3em] text-purple-700 uppercase mb-3">
          DATA CATALOG · TRANSPARENCY
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900">
          5종 공공데이터,<br />
          <span className="text-purple-700 italic">어디서 와서 어떻게 합쳐지는가</span>
        </h1>
        <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
          본 데모는 출처 추적 가능한 공공데이터를 결합해 동·시군구 단위 Risk-Index를 산출합니다. 본 페이지는 출처 ID, 활용 필드, 산식,
          그리고 시뮬·실데이터 비율을 투명하게 공개합니다.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid sm:grid-cols-3 gap-3">
        <SummaryCard icon={<Database className="size-5" />} title="공공데이터" value="5종" sub="여가부·data.go.kr" />
        <SummaryCard icon={<MapPin className="size-5" />} title="공간 단위" value="229 시군구" sub="동 단위 확장 예정" />
        <SummaryCard icon={<ShieldCheck className="size-5" />} title="개인정보" value="PII Free" sub="익명 ID + 30일 보존" />
      </section>

      {/* Datasets table */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">데이터셋 5종</h2>
        <p className="text-sm text-slate-600 mb-4">
          모든 항목의 <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">publicId</code>는 data.go.kr에서 직접 검증 가능합니다.
        </p>
        <div className="space-y-3">
          {DATASETS.map((d, i) => (
            <DatasetCard key={d.publicId} dataset={d} index={i + 1} />
          ))}
        </div>
      </section>

      {/* Formula */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Risk-Index 산식</h2>
        <p className="text-sm text-slate-600 mb-4">5개 컴포넌트를 결합해 0~100점 단일 지표로 정규화합니다.</p>
        <div className="rounded-xl border bg-slate-900 text-slate-100 p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
          {FORMULA}
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div>• <span className="font-semibold">counselDensity</span>: 1366 상담건수 / 인구</div>
          <div>• <span className="font-semibold">recallRate</span>: 가정폭력 실태조사 재발률</div>
          <div>• <span className="font-semibold">shelterAvailability</span>: (capacity − occupied) / capacity</div>
          <div>• <span className="font-semibold">multicultureWeight</span>: 1.0 ~ 1.5 (가족실태조사)</div>
          <div>• <span className="font-semibold">childcareWeight</span>: 1.0 ~ 1.5 (영유아·돌봄 가중치)</div>
        </div>
      </section>

      {/* Mock vs Real */}
      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900">현재 시뮬 ↔ 실데이터 비율</h3>
            <p className="text-sm text-amber-900/90 mt-1 leading-relaxed">
              본 데모는 <strong>약 35%</strong>가 data.go.kr 실데이터 기반(키워드 룰·산식·시도 좌표·5종 메타)이며,{' '}
              <strong>약 65%</strong>가 시뮬레이션 데이터(시군구 동단위 risk score, 보호시설 좌표 jitter)입니다.
              심사 시연·기능 검증 목적으로 작동성을 확보하되, 본선 진출 시 위 5종 ID로 실제 ETL을 1~2주 내에 대체합니다.
            </p>
            <div className="mt-3 flex gap-1.5">
              <div className="h-2 w-[35%] bg-emerald-500 rounded-full" />
              <div className="h-2 w-[65%] bg-amber-300 rounded-full" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-semibold">
              <span className="text-emerald-700">실데이터 35%</span>
              <span className="text-amber-700">시뮬 65%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">데이터 로드맵</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {ROADMAP.map((p, i) => (
            <div
              key={p.phase}
              className={`rounded-xl border p-4 ${
                i === 0 ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold tracking-wider uppercase text-purple-700">PHASE {i + 1}</div>
              <div className="font-bold mt-1 text-slate-900">{p.phase}</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-1.5">
                    <span className="text-purple-500">▸</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA back */}
      <section className="border-t pt-6 flex justify-between items-center text-sm flex-wrap gap-2">
        <Link href="/about" className="text-purple-700 hover:underline font-semibold">
          ← 산식·윤리 자세히 보기
        </Link>
        <Link href="/dashboard" className="text-purple-700 hover:underline font-semibold">
          자치구 대시보드에서 보기 →
        </Link>
      </section>
    </div>
  );
}

function SummaryCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex gap-3">
      <div className="text-purple-700 shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>
    </div>
  );
}

function DatasetCard({ dataset, index }: { dataset: Dataset; index: number }) {
  const tone =
    dataset.status === 'verified'
      ? { bg: 'bg-emerald-50', border: 'border-emerald-200', tag: 'bg-emerald-200 text-emerald-900', label: '실데이터' }
      : dataset.status === 'simulated'
        ? { bg: 'bg-amber-50', border: 'border-amber-200', tag: 'bg-amber-200 text-amber-900', label: '시뮬 (본선 ETL 예정)' }
        : { bg: 'bg-slate-50', border: 'border-slate-200', tag: 'bg-slate-200 text-slate-900', label: 'planned' };
  return (
    <div className={`rounded-xl border-2 ${tone.bg} ${tone.border} p-4`}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="text-xs font-bold text-purple-700 mt-0.5">{String(index).padStart(2, '0')}.</div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="size-4 text-slate-600" />
            <h3 className="font-bold text-slate-900">{dataset.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tone.tag}`}>{tone.label}</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span>{dataset.source}</span>
            <span>·</span>
            <span>publicId {dataset.publicId}</span>
            <span>·</span>
            <span>{dataset.year}</span>
          </div>
          <div className="mt-1 text-xs text-slate-700">{dataset.scale}</div>
          <div className="mt-2 text-sm text-slate-800 leading-snug">
            <span className="font-semibold">활용:</span> {dataset.role}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {dataset.fields.map((f) => (
              <code key={f} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                {f}
              </code>
            ))}
          </div>
          {dataset.url && (
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-purple-700 hover:underline"
            >
              data.go.kr 원본 <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
