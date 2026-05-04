'use client';
import { useMemo } from 'react';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { Activity, AlertTriangle, BedDouble, Languages } from 'lucide-react';
import { DataBadge } from '@/components/shared/DataBadge';

interface Props {
  sigungus: Sigungu[];
  risks: RiskIndex[];
  shelters: Shelter[];
}

export function KpiBar({ sigungus, risks, shelters }: Props) {
  const stats = useMemo(() => {
    const scores = risks.map((r) => r.score);
    const avg = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
    const highRiskCount = risks.filter((r) => r.score >= 30).length;
    const totalCapacity = shelters.reduce((a, s) => a + (s.capacity || 0), 0);
    const totalOccupied = shelters.reduce((a, s) => a + (s.occupied || 0), 0);
    const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
    const multilingualCount = shelters.filter((s) => s.multilingual).length;
    const multilingualRatio = (multilingualCount / Math.max(shelters.length, 1)) * 100;
    return {
      avg: avg.toFixed(1),
      highRiskCount,
      highRiskTotal: risks.length,
      totalAvailable,
      totalCapacity,
      multilingualCount,
      multilingualRatio: multilingualRatio.toFixed(0),
    };
  }, [risks, shelters]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        icon={<Activity className="size-5" />}
        accent="#7C3AED"
        label="전국 평균 Risk-Index"
        value={stats.avg}
        unit="/ 100"
        sub={`${risks.length}개 시군구`}
      />
      <Card
        icon={<AlertTriangle className="size-5" />}
        accent="#DC2626"
        label="고위험 시군구"
        value={String(stats.highRiskCount)}
        unit={`/ ${stats.highRiskTotal}`}
        sub="score ≥ 30 기준"
      />
      <Card
        icon={<BedDouble className="size-5" />}
        accent="#16A34A"
        label="보호시설 총 가용석"
        value={stats.totalAvailable.toLocaleString()}
        unit={`/ ${stats.totalCapacity.toLocaleString()}`}
        sub={`${shelters.length}개소`}
      />
      <Card
        icon={<Languages className="size-5" />}
        accent="#0D9488"
        label="다국어 지원 시설"
        value={stats.multilingualRatio}
        unit="%"
        sub={`${stats.multilingualCount}/${shelters.length}개소`}
      />
      <div className="col-span-2 md:col-span-4 flex items-center justify-end">
        <DataBadge source="가정폭력 실태조사·1366 운영실적·가족실태조사 융합 (5종)" simulated compact />
      </div>
    </div>
  );
}

function Card({
  icon, accent, label, value, unit, sub,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: string;
  unit: string;
  sub: string;
}) {
  return (
    <div className="relative bg-white rounded-xl border overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
      <div className="p-4 pl-5">
        <div className="flex items-center gap-1.5" style={{ color: accent }}>
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</span>
          <span className="text-xs text-slate-500 font-semibold">{unit}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
