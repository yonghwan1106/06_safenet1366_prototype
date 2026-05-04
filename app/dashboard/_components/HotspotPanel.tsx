'use client';
import { useMemo } from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import type { Sigungu, RiskIndex } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';

interface Props {
  sigungus: Sigungu[];
  risks: RiskIndex[];
  selectedSido: string | null; // null이면 전국
  selectedSigungu: string | null;
  onSelectSigungu: (code: string) => void;
}

export function HotspotPanel({ sigungus, risks, selectedSido, selectedSigungu, onSelectSigungu }: Props) {
  const sigunguByCode = useMemo(
    () => new Map(sigungus.map((s) => [s.code, s])),
    [sigungus],
  );

  const top = useMemo(() => {
    const filtered = risks.filter((r) => {
      if (!selectedSido) return true;
      const sg = sigunguByCode.get(r.sigunguCode);
      return sg?.sidoCode === selectedSido;
    });
    return [...filtered]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => ({
        ...r,
        sigungu: sigunguByCode.get(r.sigunguCode),
      }));
  }, [risks, selectedSido, sigunguByCode]);

  const fmtSido = (s?: string) =>
    !s ? '' : s.replace(/광역시|특별시|특별자치시|특별자치도|도/g, '').trim() || s;

  const title = selectedSido
    ? `${fmtSido(top[0]?.sigungu?.sido)} Top 5 위험 시군구`
    : '전국 Top 5 위험 시군구';

  return (
    <div className="bg-white rounded-xl border h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Flame className="size-4 text-rose-700" />
        <h3 className="font-bold text-slate-800 text-sm flex-1">{title}</h3>
        <span className="text-[10px] text-slate-500 font-semibold">{top.length}개 표시</span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y">
        {top.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">데이터가 없습니다</div>
        )}
        {top.map((r, idx) => {
          const sg = r.sigungu;
          if (!sg) return null;
          const sel = r.sigunguCode === selectedSigungu;
          const color = riskColorScale(r.score);
          const textColor = r.score > 50 ? '#fff' : '#1e293b';
          return (
            <button
              key={r.sigunguCode}
              onClick={() => onSelectSigungu(r.sigunguCode)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition ${
                sel ? 'bg-purple-50' : ''
              }`}
            >
              <div
                className="size-9 rounded-lg flex items-center justify-center font-extrabold text-base tabular-nums shrink-0"
                style={{ backgroundColor: color, color: textColor }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {sg.name} <span className="text-[10px] text-slate-500 font-normal">{fmtSido(sg.sido)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, r.score)}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: r.score > 30 ? '#991b1b' : '#475569' }}>
                    {r.score.toFixed(1)}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  전국 {r.rank}위 · 인구 {(sg.population / 10000).toFixed(0)}만
                </div>
              </div>
              <ArrowRight className={`size-4 shrink-0 ${sel ? 'text-purple-700' : 'text-slate-300'}`} />
            </button>
          );
        })}
      </div>
      <div className="px-4 py-2 border-t bg-slate-50 text-[10px] text-slate-500">
        ※ 본선 진출 시 5종 공공데이터 실 ETL로 정밀 갱신 예정
      </div>
    </div>
  );
}
