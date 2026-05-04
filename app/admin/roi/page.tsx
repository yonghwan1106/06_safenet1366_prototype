'use client';

import { useMemo, useState } from 'react';
import { Calculator, Coins, TrendingDown, Users, AlertCircle, Calendar } from 'lucide-react';
import sigunguData from '@/data/sigungu.json';
import type { Sigungu } from '@/types';
import { DataBadge } from '@/components/shared/DataBadge';

// 산식 상수 — 본선 진출 시 KOSIS·여가부 「가정폭력 사회비용 추정」으로 교체.
// 평균 사회비용은 한국형사법무정책연구원 「폭력범죄 사회적 비용」(2017, 2.86조원)과
// 1366 연간 상담 30만건을 결합해 1건당 약 9,700만원으로 가정.
const COST_PER_CASE_KRW = 97_000_000; // 9.7천만원 / 건

// 1366 연간 상담건수(2024 기준 30만)에서 인구 비례 추정
const ANNUAL_CASES_PER_100K = 600; // 인구 10만명당 600건 추정
const REPEAT_BASE_RATE = 0.38; // 현 재상담률
const SHELTER_COST_KRW = 3_500_000_000; // 보호시설 1개소 연 운영비 약 35억

interface Inputs {
  sidoCode: string;
  population: number;
  pilotCoverage: number; // 0~1 적용 인구 비율
  reductionRate: number; // 0~1 재상담률 감소 효과
  yearsHorizon: number; // 1~5
  shelterAdded: number;
}

export default function RoiPage() {
  const [inputs, setInputs] = useState<Inputs>({
    sidoCode: '11',
    population: 9_500_000, // 서울
    pilotCoverage: 0.3,
    reductionRate: 0.34, // 38% → 25% (= 13%p 감소를 비율로 0.34)
    yearsHorizon: 3,
    shelterAdded: 2,
  });

  const sigungus = sigunguData as Sigungu[];
  const sidoList = useMemo(() => {
    const map = new Map<string, { name: string; population: number }>();
    sigungus.forEach((s) => {
      const cur = map.get(s.sidoCode);
      map.set(s.sidoCode, {
        name: s.sido,
        population: (cur?.population ?? 0) + s.population,
      });
    });
    return Array.from(map.entries()).map(([code, v]) => ({ code, ...v }));
  }, [sigungus]);

  const setSido = (code: string) => {
    const sido = sidoList.find((s) => s.code === code);
    if (sido) setInputs((p) => ({ ...p, sidoCode: code, population: sido.population }));
  };

  const calc = useMemo(() => {
    const coveredPopulation = inputs.population * inputs.pilotCoverage;
    const annualCases = (coveredPopulation / 100_000) * ANNUAL_CASES_PER_100K;
    const repeatedCases = annualCases * REPEAT_BASE_RATE;
    const preventedRepeats = repeatedCases * inputs.reductionRate;
    const annualSavings = preventedRepeats * COST_PER_CASE_KRW;
    const horizonSavings = annualSavings * inputs.yearsHorizon;
    const shelterCost = inputs.shelterAdded * SHELTER_COST_KRW * inputs.yearsHorizon;
    const platformCost = 800_000_000 + 300_000_000 * inputs.yearsHorizon; // 초기 8억 + 운영 3억/년
    const totalCost = shelterCost + platformCost;
    const netBenefit = horizonSavings - totalCost;
    const bcr = totalCost > 0 ? horizonSavings / totalCost : 0;
    return {
      coveredPopulation,
      annualCases,
      repeatedCases,
      preventedRepeats,
      annualSavings,
      horizonSavings,
      totalCost,
      netBenefit,
      bcr,
    };
  }, [inputs]);

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조';
    if (Math.abs(n) >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억';
    if (Math.abs(n) >= 10_000) return (n / 10_000).toFixed(0) + '만';
    return Math.round(n).toLocaleString();
  };

  const positive = calc.netBenefit >= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <Calculator className="size-7 text-purple-700 shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">정책 ROI 계산기</h1>
          <p className="text-sm text-slate-600 mt-1">
            세이프넷 1366 도입 시 추정 절감 효과 — 자치구·시도 단위 시뮬
          </p>
          <div className="mt-2">
            <DataBadge source="형사정책연구원·여가부 1366 운영실적" simulated compact />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* INPUT */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="size-4" /> 입력
          </h2>
          <div>
            <label className="text-xs font-semibold text-slate-600">대상 시도</label>
            <div className="mt-1 flex gap-1 flex-wrap">
              {sidoList.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSido(s.code)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    inputs.sidoCode === s.code
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-purple-50'
                  }`}
                >
                  {s.name.replace(/광역시|특별시|특별자치시|특별자치도|도/g, '').trim() || s.name}
                </button>
              ))}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              인구 {fmt(inputs.population)}명
            </div>
          </div>

          <Slider
            label="파일럿 적용 인구 비율"
            value={inputs.pilotCoverage}
            min={0.05}
            max={1}
            step={0.05}
            unit="%"
            displayMul={100}
            onChange={(v) => setInputs((p) => ({ ...p, pilotCoverage: v }))}
            hint={`${fmt(inputs.population * inputs.pilotCoverage)}명 적용 가정`}
          />
          <Slider
            label="재상담률 감소 효과"
            value={inputs.reductionRate}
            min={0.05}
            max={0.6}
            step={0.01}
            unit="%"
            displayMul={100}
            onChange={(v) => setInputs((p) => ({ ...p, reductionRate: v }))}
            hint={`현 38% → 약 ${(38 * (1 - inputs.reductionRate)).toFixed(1)}%`}
          />
          <Slider
            label="평가 기간"
            value={inputs.yearsHorizon}
            min={1}
            max={5}
            step={1}
            unit="년"
            onChange={(v) => setInputs((p) => ({ ...p, yearsHorizon: v }))}
          />
          <Slider
            label="추가 보호시설"
            value={inputs.shelterAdded}
            min={0}
            max={10}
            step={1}
            unit="개"
            onChange={(v) => setInputs((p) => ({ ...p, shelterAdded: v }))}
            hint={`연 35억 × ${inputs.shelterAdded}개 운영비`}
          />

          <div className="text-[11px] text-slate-500 pt-3 border-t leading-relaxed">
            <strong>가정:</strong> 인구 10만명당 연 {ANNUAL_CASES_PER_100K}건 상담, 1건당 사회비용 9,700만원,
            플랫폼 초기 8억 + 연 3억 운영비. 본선 진출 시 KOSIS·형정연 데이터로 정밀화.
          </div>
        </div>

        {/* OUTPUT */}
        <div className="space-y-4">
          <div
            className={`rounded-xl border-2 p-5 ${
              positive ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-700">
                {inputs.yearsHorizon}년 누적 절감액
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  positive ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {positive ? '편익 > 비용' : '비용 > 편익'}
              </span>
            </div>
            <div className="mt-2 flex items-end gap-2 flex-wrap">
              <div
                className={`text-5xl font-extrabold tabular-nums ${
                  positive ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {fmt(calc.netBenefit)}
              </div>
              <div className="text-sm text-slate-600 mb-1">원 (B−C)</div>
            </div>
            <div className="mt-2 text-xs text-slate-700">
              편익/비용비 (BCR) ={' '}
              <strong className={positive ? 'text-emerald-700' : 'text-amber-700'}>
                {calc.bcr.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric
              icon={<Coins className="size-4" />}
              title="누적 절감 (편익)"
              value={`${fmt(calc.horizonSavings)}원`}
              sub={`연 ${fmt(calc.annualSavings)}원`}
              color="text-emerald-700"
            />
            <Metric
              icon={<TrendingDown className="size-4" />}
              title="예방 재상담"
              value={`${fmt(calc.preventedRepeats)}건/년`}
              sub={`적용 ${fmt(calc.coveredPopulation)}명`}
              color="text-purple-700"
            />
            <Metric
              icon={<AlertCircle className="size-4" />}
              title="예상 비용"
              value={`${fmt(calc.totalCost)}원`}
              sub="플랫폼 + 시설"
              color="text-rose-700"
            />
            <Metric
              icon={<Calendar className="size-4" />}
              title="평가 기간"
              value={`${inputs.yearsHorizon}년`}
              sub={`연 ${fmt(calc.annualCases)}건 발생 추정`}
              color="text-slate-700"
            />
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed">
            <div className="text-purple-300 font-semibold text-[10px] uppercase tracking-wider mb-2">산식 트레이스</div>
            <div>적용 인구 = 인구 × 적용비율 = {fmt(calc.coveredPopulation)}명</div>
            <div>연 상담 = 적용/100k × {ANNUAL_CASES_PER_100K} = {fmt(calc.annualCases)}건</div>
            <div>재상담 = 연 상담 × 38% = {fmt(calc.repeatedCases)}건</div>
            <div>예방 = 재상담 × 감소{(inputs.reductionRate * 100).toFixed(0)}% = {fmt(calc.preventedRepeats)}건</div>
            <div>연 절감 = 예방 × 9,700만원 = {fmt(calc.annualSavings)}원</div>
            <div>누적 = 연 × {inputs.yearsHorizon}년 = <strong className="text-emerald-300">{fmt(calc.horizonSavings)}원</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, unit, displayMul = 1, onChange, hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayMul?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <span className="text-sm font-bold tabular-nums text-purple-700">
          {(value * displayMul).toFixed(displayMul === 1 ? 0 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-1 accent-purple-700"
      />
      {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function Metric({ icon, title, value, sub, color }: { icon: React.ReactNode; title: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-3">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${color}`}>
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-lg font-extrabold tabular-nums text-slate-900 mt-1">{value}</div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
