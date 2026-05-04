'use client';
import type { RiskComponents } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

export function ComponentChart({ components, score }: { components: RiskComponents; score: number }) {
  const data = [
    { name: '상담 밀도', value: components.counselDensity * 100, color: '#7c3aed' },
    { name: '재상담률', value: components.recallRate * 100, color: '#a855f7' },
    { name: '시설 가용률', value: components.shelterAvailability * 100, color: '#10b981' },
    { name: '다문화 가중', value: (components.multicultureWeight - 1) * 100, color: '#f59e0b' },
    { name: '돌봄 가중', value: (components.childcareWeight - 1) * 100, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">Risk-Index 구성 요소 분해</h3>
        <div className="text-2xl font-extrabold italic text-purple-800">{score.toFixed(1)}<span className="text-xs text-slate-400 font-normal ml-1">/100</span></div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? v.toFixed(1) + '%' : String(v))} />
          <Bar dataKey="value" radius={4}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-500 mt-2">
        산식: (0.4·상담밀도 + 0.3·재상담률) × (1 − 시설가용률) × (1 + 다문화 + 돌봄) × 100
      </p>
    </div>
  );
}
