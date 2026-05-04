// 데이터 출처 라벨 — 모든 KPI/지도/카드에 부착해 신뢰성 표시.
// `simulated`가 true이면 노란 경고색으로 시뮬레이션 데이터임을 명시한다.
import { Database, Sparkles } from 'lucide-react';

interface Props {
  source: string;          // 예: '여성가족부 가정폭력 실태조사 2022'
  updated?: string;        // 예: '2024-12'
  simulated?: boolean;     // 시뮬레이션 데이터 여부
  compact?: boolean;       // 작은 형태로 표시
  className?: string;
}

export function DataBadge({ source, updated, simulated = false, compact = false, className = '' }: Props) {
  const Icon = simulated ? Sparkles : Database;
  const sim = simulated;
  const wrap = sim
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : 'bg-slate-50 border-slate-200 text-slate-700';
  const dot = sim ? 'bg-amber-500' : 'bg-emerald-500';
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${wrap} ${className}`}
        title={`${source}${updated ? ` · ${updated}` : ''}${sim ? ' · 시뮬 데이터' : ''}`}
      >
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        {sim ? '시뮬' : '실데이터'}
      </span>
    );
  }
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border ${wrap} ${className}`}
    >
      <Icon className="size-3" />
      <span className="font-semibold">출처</span>
      <span className="opacity-90">{source}</span>
      {updated && <span className="opacity-70">· {updated}</span>}
      {sim && <span className="ml-1 px-1 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">SIMULATED</span>}
    </div>
  );
}
