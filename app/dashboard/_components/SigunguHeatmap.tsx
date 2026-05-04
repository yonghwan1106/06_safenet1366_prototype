'use client';
import type { Sigungu, RiskIndex } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';

interface Props {
  sigungus: Sigungu[];
  riskMap: Map<string, RiskIndex>;
  selectedSigungu: string | null;
  onSelect: (code: string) => void;
}

export function SigunguHeatmap({ sigungus, riskMap, selectedSigungu, onSelect }: Props) {
  if (sigungus.length === 0) {
    return <div className="bg-white rounded-xl border p-6 text-slate-500 text-center">시도를 선택하세요</div>;
  }
  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-bold text-slate-800 mb-3">{sigungus[0].sido} — 시군구 히트맵 ({sigungus.length}개)</h3>
      <div className="grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
        {sigungus.map((sg) => {
          const r = riskMap.get(sg.code);
          const score = r?.score || 0;
          const sel = sg.code === selectedSigungu;
          return (
            <button
              key={sg.code}
              onClick={() => onSelect(sg.code)}
              title={`${sg.name} · ${score}점 · 인구 ${(sg.population / 10000).toFixed(0)}만`}
              className={`aspect-[3/2] rounded text-[10px] font-semibold p-1 transition ${sel ? 'ring-2 ring-slate-900 scale-105' : 'hover:scale-105'}`}
              style={{ backgroundColor: riskColorScale(score), color: score > 50 ? '#fff' : '#1e293b' }}
            >
              <div className="leading-tight">{sg.name.replace(/[가-힣]+시\s*/, '')}</div>
              <div className="opacity-80">{score.toFixed(1)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
