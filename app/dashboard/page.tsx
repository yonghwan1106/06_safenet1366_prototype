import { DashboardClient } from './_components/DashboardClient';
import sigunguData from '@/data/sigungu.json';
import riskData from '@/data/risk-index.json';
import sheltersData from '@/data/shelters.json';
import type { Sigungu, RiskIndex, Shelter } from '@/types';

export const metadata = { title: '자치구 대시보드 — 세이프넷 1366' };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900">자치구 위험 대시보드</h1>
        <p className="text-sm text-slate-600">시도·시군구 단위 Risk-Index 코로플레스 + Top 30 우선순위 + 보호시설 가용 현황</p>
      </div>
      <DashboardClient
        sigungus={sigunguData as Sigungu[]}
        risks={riskData as RiskIndex[]}
        shelters={sheltersData as Shelter[]}
      />
    </div>
  );
}
