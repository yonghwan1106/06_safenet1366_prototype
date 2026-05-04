'use client';
import { X, MapPin, Layers, Phone, BedDouble, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Sigungu, RiskIndex, Shelter } from '@/types';
import { ComponentChart } from './ComponentChart';
import { riskColorScale, severityToColor } from '@/lib/risk/formula';

interface Props {
  sigungu: Sigungu;
  risk: RiskIndex | null;
  shelters: Shelter[];
  onClose: () => void;
}

export function DetailPanel({ sigungu, risk, shelters, onClose }: Props) {
  const score = risk?.score ?? 0;
  const color = riskColorScale(score);
  const textColor = score > 50 ? '#fff' : '#1e293b';
  const trendIcon =
    risk?.trend === 'up' ? <TrendingUp className="size-3.5" /> :
    risk?.trend === 'down' ? <TrendingDown className="size-3.5" /> :
    <Minus className="size-3.5" />;

  return (
    <div className="bg-white rounded-xl border overflow-hidden animate-fadein-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-slate-50">
        <MapPin className="size-4 text-purple-700" />
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900">{sigungu.sido}</h2>
            <span className="text-2xl font-extrabold text-purple-900">{sigungu.name}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            행정코드 {sigungu.code} · 인구 {(sigungu.population / 10000).toFixed(1)}만 · 가구 {(sigungu.households / 10000).toFixed(1)}만
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="상세 닫기"
          className="p-2 rounded-md hover:bg-slate-200 text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body — 3 columns */}
      <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x">
        {/* Col 1: 종합 점수 */}
        <div className="p-5 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">종합 위험도</div>
          <div className="flex items-end gap-2">
            <div
              className="rounded-xl px-5 py-3 font-extrabold tabular-nums text-4xl"
              style={{ backgroundColor: color, color: textColor }}
            >
              {score.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 mb-1">/ 100</div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
              {trendIcon} {risk?.trend === 'up' ? '상승' : risk?.trend === 'down' ? '하강' : '보합'}
            </span>
            <span className="text-slate-500">전국 {risk?.rank ?? '-'}위</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-700">해석</strong>
            <p className="mt-1">
              {score >= 50 ? (
                <>고위험 지역. 예방교육·보호시설 증설·1366 인력 우선 배치 권고.</>
              ) : score >= 30 ? (
                <>중간위험. 분기별 모니터링과 주요 컴포넌트 개입.</>
              ) : (
                <>저위험. 현 자원 유지 + 다른 시군구 사례 학습 가능.</>
              )}
            </p>
          </div>
        </div>

        {/* Col 2: Risk-Index 5 컴포넌트 */}
        <div className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            <Layers className="size-3 inline-block mr-1 -mt-0.5" />
            Risk-Index 컴포넌트 분해
          </div>
          {risk ? (
            <ComponentChart components={risk.components} score={risk.score} />
          ) : (
            <div className="text-sm text-slate-400 py-8 text-center">데이터 없음</div>
          )}
        </div>

        {/* Col 3: 보호시설 */}
        <div className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            <BedDouble className="size-3 inline-block mr-1 -mt-0.5" />
            보호시설 ({shelters.length}개소)
          </div>
          {shelters.length === 0 && (
            <div className="text-sm text-slate-400 py-6 text-center">
              관할 시설 없음
              <div className="text-[10px] mt-1">인접 시군구 시설 활용 필요</div>
            </div>
          )}
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {shelters.map((sh) => {
              const occRate = sh.capacity > 0 ? sh.occupied / sh.capacity : 0;
              const occColor = occRate >= 0.9 ? '#dc2626' : occRate >= 0.7 ? '#d97706' : '#16a34a';
              const f7 = sh.forecast_7d;
              return (
                <div key={sh.id} className="rounded-lg border bg-slate-50/50 p-2.5 text-xs">
                  <div className="font-bold text-slate-800 truncate">{sh.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {sh.type === 'emergency' ? '긴급피난처' : sh.type === 'short' ? '단기보호' : '장기보호'}
                    {sh.multilingual && ' · 다국어'}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${occRate * 100}%`, backgroundColor: occColor }}
                      />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: occColor }}>
                      {Math.max(0, sh.capacity - sh.occupied)}/{sh.capacity}석
                    </span>
                  </div>
                  {f7 && (
                    <div className="mt-1 text-[10px] text-slate-600 flex items-center gap-1.5">
                      D+7 예측 가용 <strong className="text-slate-800">{f7.capacity - f7.occupied}석</strong>
                      <span className={
                        f7.trend === 'up' ? 'text-rose-700 font-semibold' :
                        f7.trend === 'down' ? 'text-emerald-700 font-semibold' :
                        'text-slate-500'
                      }>
                        {f7.trend === 'up' ? '↑ 수요↑' : f7.trend === 'down' ? '↓ 여유↑' : '→ 보합'}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                    <Phone className="size-2.5" /> {sh.phone}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
