'use client';
import { useMemo } from 'react';
import type { Sigungu, RiskIndex } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';

// 17 시도 한반도 격자 배치
const LAYOUT: Record<string, [number, number]> = {
  '11': [2, 1], // 서울
  '28': [1, 1], // 인천
  '41': [3, 1], // 경기
  '42': [4, 0], // 강원
  '43': [3, 2], // 충북
  '44': [2, 2], // 충남
  '36': [3, 3], // 세종
  '30': [3, 3], // 대전 (인접)
  '45': [2, 3], // 전북
  '46': [2, 4], // 전남
  '29': [1, 4], // 광주
  '47': [4, 3], // 경북
  '48': [4, 4], // 경남
  '27': [4, 2], // 대구
  '26': [4, 5], // 부산
  '31': [5, 4], // 울산
  '50': [0, 5], // 제주
};

interface Props {
  sigungus: Sigungu[];
  risks: RiskIndex[];
  selectedSido: string;
  onSelect: (code: string) => void;
}

export function SidoGrid({ sigungus, risks, selectedSido, onSelect }: Props) {
  const sidoStats = useMemo(() => {
    const sidoMap = new Map<string, { name: string; codes: string[] }>();
    sigungus.forEach((s) => {
      if (!sidoMap.has(s.sidoCode)) sidoMap.set(s.sidoCode, { name: s.sido, codes: [] });
      sidoMap.get(s.sidoCode)!.codes.push(s.code);
    });
    const riskMap = new Map(risks.map((r) => [r.sigunguCode, r.score]));
    const result: Array<{ code: string; name: string; avg: number; max: number; n: number }> = [];
    sidoMap.forEach((v, k) => {
      const scores = v.codes.map((c) => riskMap.get(c) || 0);
      result.push({
        code: k,
        name: v.name,
        avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
        max: Math.round(Math.max(...scores) * 10) / 10,
        n: v.codes.length,
      });
    });
    return result;
  }, [sigungus, risks]);

  const fmtName = (n: string) => n.replace(/광역시|특별시|특별자치시|특별자치도|도/g, '').trim() || n;

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">전국 17개 시도 — 평균 Risk-Index</h3>
        <div className="flex gap-1 items-center text-xs text-slate-500">
          <span>저</span>
          {[15, 30, 45, 60, 75, 90].map((v) => (
            <span key={v} className="size-3 rounded" style={{ backgroundColor: riskColorScale(v) }} />
          ))}
          <span>고</span>
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)', maxWidth: 600 }}>
        {Array.from({ length: 36 }).map((_, i) => {
          const x = i % 6;
          const y = Math.floor(i / 6);
          const sido = sidoStats.find((s) => {
            const [lx, ly] = LAYOUT[s.code] || [-1, -1];
            return lx === x && ly === y;
          });
          if (!sido) return <div key={i} />;
          const sel = sido.code === selectedSido;
          return (
            <button
              key={i}
              onClick={() => onSelect(sido.code)}
              title={`${sido.name} · 평균 ${sido.avg} · 최고 ${sido.max} · ${sido.n}개 시군구`}
              className={`aspect-square rounded text-[9px] font-bold flex flex-col items-center justify-center transition ${sel ? 'ring-2 ring-purple-700 scale-105' : ''}`}
              style={{ backgroundColor: riskColorScale(sido.avg), color: sido.avg > 50 ? '#fff' : '#1e293b' }}
            >
              <div>{fmtName(sido.name)}</div>
              <div className="opacity-80">{sido.avg}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
