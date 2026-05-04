'use client';
import type { Sigungu, Shelter } from '@/types';
import { Phone, Globe2 } from 'lucide-react';

interface Props {
  shelters: Shelter[];
  sigungu: Sigungu;
}

export function ShelterPanel({ shelters, sigungu }: Props) {
  const total = shelters.reduce((s, x) => s + x.capacity, 0);
  const occ = shelters.reduce((s, x) => s + x.occupied, 0);
  const availability = total > 0 ? Math.round(((total - occ) / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-bold text-slate-800 mb-1">{sigungu.name} — 보호시설</h3>
      <div className="text-xs text-slate-500 mb-3">
        가용률 <b className="text-slate-900">{availability}%</b> · 총 {total}석 중 {total - occ}석 가용
      </div>
      {shelters.length === 0 ? (
        <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded">⚠ 등록된 보호시설 데이터 없음 — 인근 시군구 연계 권고</div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {shelters.map((s) => {
            const avail = s.capacity - s.occupied;
            const pct = s.capacity > 0 ? Math.round((avail / s.capacity) * 100) : 0;
            return (
              <div key={s.id} className="rounded-lg border p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-slate-800">{s.name}</div>
                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    pct < 20 ? 'bg-red-100 text-red-700' : pct < 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {pct}% 가용
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>{s.type === 'emergency' ? '응급' : s.type === 'short' ? '단기' : '장기'}</span>
                  <span>{avail}/{s.capacity}석</span>
                  {s.multilingual && <span className="flex items-center gap-1"><Globe2 className="size-3" />다국어</span>}
                  <span className="flex items-center gap-1 ml-auto"><Phone className="size-3" />{s.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
