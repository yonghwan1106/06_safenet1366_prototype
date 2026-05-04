'use client';
import { useMemo, useState } from 'react';
import keywordsData from '@/data/keywords-9rank.json';
import { runRuleTriage } from '@/lib/triage/ruleEngine';
import { severityToColor } from '@/lib/risk/formula';
import type { KeywordRule } from '@/types';

const PRESETS = [
  '요즘 남편이랑 말다툼이 잦아요',
  '아이 앞에서 소리를 지르고 욕을 해요',
  '어제 밀쳐서 멍이 들었어요',
  '돈을 통제하고 외출도 못하게 해요',
  '계속 따라다니고 감시해요',
  '뺨을 맞고 발로 차였어요',
  '오늘 칼 들고 위협했어요',
  '목을 졸라서 의식을 잃었어요',
  '죽이겠다고 협박해요',
  '아이가 너무 무서워해요',
];

export default function TriageSimPage() {
  const [text, setText] = useState('어제 밀쳐서 멍이 들었어요');
  const result = useMemo(() => runRuleTriage(text), [text]);
  const c = severityToColor(result.severity);

  const grouped = (keywordsData as KeywordRule[]).reduce((acc, r) => {
    const k = String(r.severity);
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {} as Record<string, KeywordRule[]>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">9등급 트리아지 시뮬레이터</h1>
        <p className="text-sm text-slate-600">개발자/정책 입안자용 화이트박스 — 키워드 룰 기반 분류기 동작 확인</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div>
            <label className="text-sm font-bold text-slate-700">입력</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-purple-500"
              placeholder="발화 입력…"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">프리셋 (10개 시나리오)</div>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => setText(p)} className="text-[11px] px-2 py-1 rounded border hover:bg-purple-50">
                  S{i+1} · {p.slice(0, 16)}…
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4 border-2" style={{ backgroundColor: c.bg, borderColor: c.text + '60' }}>
            <div className="text-xs uppercase tracking-wider opacity-70" style={{ color: c.text }}>결과</div>
            <div className="text-3xl font-extrabold mt-1" style={{ color: c.text }}>
              위험도 {result.severity}/9 — {c.label}
            </div>
            <div className="text-sm mt-2" style={{ color: c.text }}>
              라우팅: {result.severity <= 3 ? 'self-care (자가가이드)' : result.severity <= 6 ? 'counselor-1366 (1366 상담사)' : 'emergency-112 (112 + 보호시설)'}
            </div>
            <div className="text-xs mt-2 text-slate-700">
              매칭 키워드: {result.matched.length === 0 ? '(없음 — 기본값 2등급)' : result.matched.map((k) => `「${k}」`).join(' · ')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-bold mb-3">9등급 룰 사전</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b)).map((sev) => {
              const sc = severityToColor(parseInt(sev));
              return (
                <div key={sev} className="border-l-4 pl-3 py-1" style={{ borderColor: sc.text }}>
                  <div className="text-xs font-bold" style={{ color: sc.text }}>등급 {sev}</div>
                  {grouped[sev].map((r, i) => (
                    <div key={i} className="text-xs text-slate-600 mt-1">
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-2">{r.category}</span>
                      {r.patterns.map((p) => `「${p}」`).join(' ')}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
