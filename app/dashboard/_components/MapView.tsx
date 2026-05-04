'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';
import { SIDO_COORDS, sigunguCoord } from '@/lib/geo/coords';

interface Props {
  sigungus: Sigungu[];
  riskMap: Map<string, RiskIndex>;
  shelters: Shelter[];
  selectedSido: string;
  selectedSigungu: string | null;
  onSelectSigungu: (code: string) => void;
}

// 시도 변경 시 지도 view를 fly
function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.8 });
  }, [lat, lng, zoom, map]);
  return null;
}

export default function MapView({
  sigungus,
  riskMap,
  shelters,
  selectedSido,
  selectedSigungu,
  onSelectSigungu,
}: Props) {
  const [showShelters, setShowShelters] = useState(true);
  const [showSigungu, setShowSigungu] = useState(true);

  const center = useMemo(() => {
    const c = SIDO_COORDS[selectedSido];
    return c ? { lat: c.lat, lng: c.lng } : { lat: 36.5, lng: 127.8 };
  }, [selectedSido]);

  // 선택 시도의 시군구만 마커로 (전국이면 시도 17개 마커로 fallback)
  const sigunguMarkers = useMemo(() => {
    return sigungus
      .filter((s) => s.sidoCode === selectedSido)
      .map((s) => {
        const r = riskMap.get(s.code);
        const score = r?.score ?? 0;
        const { lat, lng } = sigunguCoord(s.code);
        return { sg: s, score, lat, lng, rank: r?.rank ?? 0 };
      });
  }, [sigungus, riskMap, selectedSido]);

  const sidoMarkers = useMemo(() => {
    // 시도별 평균 risk score
    return Object.entries(SIDO_COORDS).map(([code, c]) => {
      const within = sigungus.filter((s) => s.sidoCode === code);
      const avg =
        within.reduce((acc, s) => acc + (riskMap.get(s.code)?.score ?? 0), 0) /
        Math.max(within.length, 1);
      return { code, ...c, avg, count: within.length };
    });
  }, [sigungus, riskMap]);

  const visibleShelters = useMemo(
    () => shelters.filter((s) => s.sigunguCode.startsWith(selectedSido)),
    [shelters, selectedSido],
  );

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-800">실시간 위험 지도</h3>
          <p className="text-xs text-slate-500">
            시군구 마커 색상 = Risk-Index · 보호시설 가용률 시각화
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setShowSigungu((v) => !v)}
            className={`px-2.5 py-1 rounded-full border transition ${
              showSigungu
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            시군구 ({sigunguMarkers.length})
          </button>
          <button
            onClick={() => setShowShelters((v) => !v)}
            className={`px-2.5 py-1 rounded-full border transition ${
              showShelters
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            보호시설 ({visibleShelters.length})
          </button>
        </div>
      </div>
      <div className="h-[320px] sm:h-[400px] lg:h-[480px]">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FlyTo lat={center.lat} lng={center.lng} zoom={selectedSido ? 9 : 7} />

          {/* 시군구 마커 (선택된 시도) */}
          {showSigungu &&
            sigunguMarkers.map(({ sg, score, lat, lng, rank }) => {
              const sel = sg.code === selectedSigungu;
              const radius = 6 + Math.min(score / 8, 14);
              return (
                <CircleMarker
                  key={sg.code}
                  center={[lat, lng]}
                  radius={radius}
                  pathOptions={{
                    color: sel ? '#0f172a' : '#475569',
                    weight: sel ? 3 : 1.2,
                    fillColor: riskColorScale(score),
                    fillOpacity: 0.85,
                  }}
                  eventHandlers={{
                    click: () => onSelectSigungu(sg.code),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -4]}>
                    <span className="font-semibold">
                      {sg.name} · {score.toFixed(1)}점
                    </span>
                    {rank > 0 && <div className="text-xs">전국 {rank}위</div>}
                  </Tooltip>
                </CircleMarker>
              );
            })}

          {/* 보호시설 마커 (선택된 시도) */}
          {showShelters &&
            visibleShelters.map((sh) => {
              const occRate = sh.capacity > 0 ? sh.occupied / sh.capacity : 0;
              const color =
                occRate >= 0.9 ? '#dc2626' : occRate >= 0.7 ? '#f59e0b' : '#16a34a';
              return (
                <CircleMarker
                  key={sh.id}
                  center={[sh.lat, sh.lng]}
                  radius={4}
                  pathOptions={{
                    color: '#fff',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-1">
                      <div className="font-bold">{sh.name}</div>
                      <div className="text-xs text-slate-600">
                        {sh.type === 'emergency'
                          ? '긴급피난처'
                          : sh.type === 'short'
                          ? '단기보호'
                          : '장기보호'}{' '}
                        · {sh.multilingual ? '다국어 ✓' : '국문'}
                      </div>
                      <div className="text-xs">
                        가용 {sh.capacity - sh.occupied}/{sh.capacity}석 ·{' '}
                        <span style={{ color }}>{(occRate * 100).toFixed(0)}% 점유</span>
                      </div>
                      <div className="text-xs text-slate-500">{sh.phone}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* 범례 */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between text-[10px] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">Risk-Index</span>
          {[10, 28, 42, 57, 72, 90].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: riskColorScale(s) }}
              />
              <span className="text-slate-600">{s}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">보호시설</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>여유</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>혼잡</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>포화</span>
          </span>
        </div>
      </div>
    </div>
  );
}
