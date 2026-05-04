'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { KpiBar } from './KpiBar';
import { HotspotPanel } from './HotspotPanel';
import { DetailPanel } from './DetailPanel';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border h-full min-h-[480px] flex items-center justify-center text-slate-500">
      지도 불러오는 중...
    </div>
  ),
});

interface Props {
  sigungus: Sigungu[];
  risks: RiskIndex[];
  shelters: Shelter[];
}

export function DashboardClient({ sigungus, risks, shelters }: Props) {
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);

  const riskMap = useMemo(() => new Map(risks.map((r) => [r.sigunguCode, r])), [risks]);
  const sigunguByCode = useMemo(() => new Map(sigungus.map((s) => [s.code, s])), [sigungus]);

  const handleSelectSigungu = (code: string) => {
    const sg = sigunguByCode.get(code);
    if (!sg) return;
    setSelectedSigungu(code);
    // 시도가 다르면 시도 변경 (지도가 그 시도로 줌)
    if (sg.sidoCode !== selectedSido) {
      setSelectedSido(sg.sidoCode);
    }
  };

  const handleSelectSido = (code: string | null) => {
    setSelectedSido(code);
    // 시도 변경 시 시군구 선택 해제 (다른 시도 시군구 잔류 방지)
    setSelectedSigungu(null);
  };

  const selectedSg = selectedSigungu ? sigunguByCode.get(selectedSigungu) : null;
  const selectedRisk = selectedSigungu ? riskMap.get(selectedSigungu) ?? null : null;
  const selectedShelters = useMemo(
    () => (selectedSigungu ? shelters.filter((s) => s.sigunguCode === selectedSigungu) : []),
    [shelters, selectedSigungu],
  );

  return (
    <div className="space-y-4">
      {/* Tier 1 — KPI Bar */}
      <KpiBar sigungus={sigungus} risks={risks} shelters={shelters} />

      {/* Tier 2 — Map (65%) + Hotspot (35%) */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4 min-h-[560px]">
        <MapView
          sigungus={sigungus}
          riskMap={riskMap}
          shelters={shelters}
          selectedSido={selectedSido}
          onSelectSido={handleSelectSido}
        />
        <HotspotPanel
          sigungus={sigungus}
          risks={risks}
          selectedSido={selectedSido}
          selectedSigungu={selectedSigungu}
          onSelectSigungu={handleSelectSigungu}
        />
      </div>

      {/* Tier 3 — 시군구 상세 (선택 시) */}
      {selectedSg && (
        <DetailPanel
          sigungu={selectedSg}
          risk={selectedRisk}
          shelters={selectedShelters}
          onClose={() => setSelectedSigungu(null)}
        />
      )}

      {/* 빈 상태 가이드 */}
      {!selectedSg && (
        <div className="bg-gradient-to-br from-purple-50 to-slate-50 border-2 border-dashed border-purple-200 rounded-xl p-6 text-center text-sm text-slate-600">
          <div className="font-bold text-purple-700 mb-1">▾ 시군구를 선택하면 상세 분석이 펼쳐집니다</div>
          <div className="text-xs">
            지도에서 시도 마커를 클릭 → 우측 Top 5에서 시군구 선택 → Risk-Index 5 컴포넌트 분해 + 보호시설 D+7 예측 표시
          </div>
        </div>
      )}
    </div>
  );
}
