'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { riskColorScale } from '@/lib/risk/formula';
import { SIDO_COORDS } from '@/lib/geo/coords';

interface Props {
  sigungus: Sigungu[];
  riskMap: Map<string, RiskIndex>;
  shelters: Shelter[];
  selectedSido: string | null; // null = 전국
  onSelectSido: (code: string | null) => void;
}

const KOREA_CENTER: [number, number] = [36.5, 127.8];
const KOREA_ZOOM = 6.5;

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.9 });
  }, [lat, lng, zoom, map]);
  return null;
}

// 시도 코드별 보호시설 좌표 보정 — 시도 청사 + 결정적 작은 클러스터
function clusterShelterCoord(shelter: Shelter): { lat: number; lng: number } {
  const sidoCode = shelter.sigunguCode.slice(0, 2);
  const base = SIDO_COORDS[sidoCode];
  if (!base) return { lat: shelter.lat, lng: shelter.lng };
  // 시설 ID 기반 결정적 jitter (반경 ~12km)
  const seed = [...shelter.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 0xffffff, 7);
  const ang = ((seed % 360) * Math.PI) / 180;
  const r = 0.05 + ((seed % 7) * 0.015);
  return {
    lat: base.lat + Math.sin(ang) * r,
    lng: base.lng + Math.cos(ang) * r,
  };
}

export default function MapView({
  sigungus,
  riskMap,
  shelters,
  selectedSido,
  onSelectSido,
}: Props) {
  const [showShelters, setShowShelters] = useState(true);

  // 시도별 평균 risk + 시군구 수 + 보호시설 수
  const sidoMarkers = useMemo(() => {
    return Object.entries(SIDO_COORDS).map(([code, c]) => {
      const within = sigungus.filter((s) => s.sidoCode === code);
      const scores = within
        .map((s) => riskMap.get(s.code)?.score ?? 0)
        .filter((s) => s > 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const top = scores.length > 0 ? Math.max(...scores) : 0;
      const shelterCount = shelters.filter((sh) => sh.sigunguCode.startsWith(code)).length;
      return {
        code,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        avg,
        top,
        sigunguCount: within.length,
        shelterCount,
      };
    });
  }, [sigungus, riskMap, shelters]);

  const visibleShelters = useMemo(() => {
    if (!selectedSido) return [] as Array<Shelter & { _lat: number; _lng: number }>;
    return shelters
      .filter((s) => s.sigunguCode.startsWith(selectedSido))
      .map((s) => {
        const { lat, lng } = clusterShelterCoord(s);
        return { ...s, _lat: lat, _lng: lng };
      });
  }, [shelters, selectedSido]);

  const center = useMemo(() => {
    if (!selectedSido) return { lat: KOREA_CENTER[0], lng: KOREA_CENTER[1], zoom: KOREA_ZOOM };
    const c = SIDO_COORDS[selectedSido];
    return c ? { lat: c.lat, lng: c.lng, zoom: 9.2 } : { lat: KOREA_CENTER[0], lng: KOREA_CENTER[1], zoom: KOREA_ZOOM };
  }, [selectedSido]);

  return (
    <div className="bg-white rounded-xl border overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">전국 위험 지도</h3>
          <p className="text-[11px] text-slate-500">17개 시도 평균 Risk-Index · 보호시설 가용률</p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {selectedSido && (
            <button
              onClick={() => onSelectSido(null)}
              className="px-2.5 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
            >
              ← 전국 보기
            </button>
          )}
          <button
            onClick={() => setShowShelters((v) => !v)}
            disabled={!selectedSido}
            className={`px-2.5 py-1 rounded-full border transition disabled:opacity-40 disabled:cursor-not-allowed ${
              showShelters && selectedSido
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            보호시설 ({visibleShelters.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] relative">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={center.zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          minZoom={6}
          maxZoom={12}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FlyTo lat={center.lat} lng={center.lng} zoom={center.zoom} />

          {/* 시도 17개 마커 */}
          {sidoMarkers.map((s) => {
            const sel = s.code === selectedSido;
            const radius = 14 + Math.min(s.avg / 3, 12);
            return (
              <CircleMarker
                key={s.code}
                center={[s.lat, s.lng]}
                radius={radius}
                pathOptions={{
                  color: sel ? '#0f172a' : '#475569',
                  weight: sel ? 3 : 1.2,
                  fillColor: riskColorScale(s.avg),
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => onSelectSido(s.code),
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} permanent={!selectedSido}>
                  <div className="text-xs">
                    <div className="font-bold">{s.name.replace(/광역시|특별시|특별자치시|특별자치도|도/g, '').trim() || s.name}</div>
                    <div className="opacity-80">평균 {s.avg.toFixed(1)} · 최고 {s.top.toFixed(1)}</div>
                    <div className="opacity-70">{s.sigunguCount}개 시군구 · 시설 {s.shelterCount}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* 선택된 시도의 보호시설 */}
          {showShelters &&
            visibleShelters.map((sh) => {
              const occRate = sh.capacity > 0 ? sh.occupied / sh.capacity : 0;
              const color = occRate >= 0.9 ? '#dc2626' : occRate >= 0.7 ? '#f59e0b' : '#16a34a';
              return (
                <CircleMarker
                  key={sh.id}
                  center={[sh._lat, sh._lng]}
                  radius={4}
                  pathOptions={{
                    color: '#fff',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[200px]">
                      <div className="font-bold">{sh.name}</div>
                      <div className="text-xs text-slate-600">
                        {sh.type === 'emergency' ? '긴급피난처' : sh.type === 'short' ? '단기보호' : '장기보호'}
                        {' · '}{sh.multilingual ? '다국어 ✓' : '국문'}
                      </div>
                      <div className="text-xs">
                        가용 {Math.max(0, sh.capacity - sh.occupied)}/{sh.capacity}석{' '}
                        <span style={{ color }}>· {(occRate * 100).toFixed(0)}% 점유</span>
                      </div>
                      {sh.forecast_7d && (
                        <div className="text-[11px] mt-1 pt-1 border-t border-slate-200">
                          <strong>D+7 예측</strong> 가용 {sh.forecast_7d.capacity - sh.forecast_7d.occupied}석 (
                          {(sh.forecast_7d.availability * 100).toFixed(0)}%)
                          <span className={
                            sh.forecast_7d.trend === 'up' ? ' text-rose-700 font-semibold' :
                            sh.forecast_7d.trend === 'down' ? ' text-emerald-700 font-semibold' :
                            ' text-slate-500'
                          }>
                            {' '}{sh.forecast_7d.trend === 'up' ? '↑ 수요↑' : sh.forecast_7d.trend === 'down' ? '↓ 여유↑' : '→'}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-slate-500">{sh.phone}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* 범례 */}
      <div className="px-4 py-2 border-t flex items-center justify-between text-[10px] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">Risk</span>
          {[10, 28, 42, 57, 72, 90].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: riskColorScale(s) }} />
              <span className="text-slate-600">{s}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">시설</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />여유
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />혼잡
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" />포화
          </span>
        </div>
      </div>
    </div>
  );
}
