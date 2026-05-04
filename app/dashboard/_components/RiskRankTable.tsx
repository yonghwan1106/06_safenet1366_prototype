'use client';
import { useMemo } from 'react';
import type { Sigungu, RiskIndex } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  risks: RiskIndex[];
  sigungus: Sigungu[];
  onSelect: (code: string) => void;
}

export function RiskRankTable({ risks, sigungus, onSelect }: Props) {
  const top30 = useMemo(() => {
    const sgMap = new Map(sigungus.map((s) => [s.code, s]));
    return risks.slice(0, 30).map((r) => ({ ...r, sg: sgMap.get(r.sigunguCode) }));
  }, [risks, sigungus]);

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-bold text-slate-800 mb-3">정책 우선순위 Top 30</h3>
      <div className="text-[10px] text-slate-500 mb-2">예산 +30% 가산 권고 시군구</div>
      <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
        {top30.map((r) => {
          if (!r.sg) return null;
          const TrendIcon = r.trend === 'up' ? TrendingUp : r.trend === 'down' ? TrendingDown : Minus;
          return (
            <button
              key={r.sigunguCode}
              onClick={() => onSelect(r.sigunguCode)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-purple-50 text-left text-xs"
            >
              <div className="text-slate-400 font-bold w-6 text-right">{r.rank}</div>
              <div className="size-3 rounded flex-shrink-0" style={{ backgroundColor: riskColorScale(r.score) }} />
              <div className="flex-1 truncate">
                <div className="font-semibold text-slate-800">{r.sg.name}</div>
                <div className="text-[10px] text-slate-500">{r.sg.sido}</div>
              </div>
              <TrendIcon className={`size-3 ${r.trend === 'up' ? 'text-red-600' : r.trend === 'down' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="font-mono font-bold text-slate-900 w-10 text-right">{r.score.toFixed(1)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
