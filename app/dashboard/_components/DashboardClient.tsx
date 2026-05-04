'use client';
import { useMemo, useState } from 'react';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { SidoGrid } from './SidoGrid';
import { SigunguHeatmap } from './SigunguHeatmap';
import { RiskRankTable } from './RiskRankTable';
import { ShelterPanel } from './ShelterPanel';
import { ComponentChart } from './ComponentChart';

interface Props {
  sigungus: Sigungu[];
  risks: RiskIndex[];
  shelters: Shelter[];
}

export function DashboardClient({ sigungus, risks, shelters }: Props) {
  const [selectedSido, setSelectedSido] = useState<string>('11'); // 서울
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);

  const sidoList = useMemo(() => {
    const map = new Map<string, string>();
    sigungus.forEach((s) => map.set(s.sidoCode, s.sido));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [sigungus]);

  const filteredSigungus = useMemo(
    () => sigungus.filter((s) => s.sidoCode === selectedSido),
    [sigungus, selectedSido]
  );
  const riskMap = useMemo(() => new Map(risks.map((r) => [r.sigunguCode, r])), [risks]);
  const selectedRisk = selectedSigungu ? riskMap.get(selectedSigungu) : null;
  const selectedShelters = useMemo(
    () => (selectedSigungu ? shelters.filter((s) => s.sigunguCode === selectedSigungu) : []),
    [shelters, selectedSigungu]
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-xl border p-3 flex gap-1 flex-wrap">
        {sidoList.map((s) => (
          <button
            key={s.code}
            onClick={() => { setSelectedSido(s.code); setSelectedSigungu(null); }}
            className={`text-xs px-3 py-1.5 rounded-md transition ${
              selectedSido === s.code
                ? 'bg-purple-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* 17 시도 격자 (전국 한눈에) */}
      <SidoGrid sigungus={sigungus} risks={risks} selectedSido={selectedSido} onSelect={(c) => { setSelectedSido(c); setSelectedSigungu(null); }} />

      {/* 메인: 좌측 시군구 히트맵 + 우측 Top30 + 상세 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SigunguHeatmap
            sigungus={filteredSigungus}
            riskMap={riskMap}
            selectedSigungu={selectedSigungu}
            onSelect={setSelectedSigungu}
          />
          {selectedRisk && (
            <ComponentChart components={selectedRisk.components} score={selectedRisk.score} />
          )}
        </div>
        <div className="space-y-4">
          <RiskRankTable risks={risks} sigungus={sigungus} onSelect={(code) => {
            const sg = sigungus.find((s) => s.code === code);
            if (sg) { setSelectedSido(sg.sidoCode); setSelectedSigungu(code); }
          }} />
          {selectedSigungu && <ShelterPanel shelters={selectedShelters} sigungu={sigungus.find((s) => s.code === selectedSigungu)!} />}
        </div>
      </div>
    </div>
  );
}
