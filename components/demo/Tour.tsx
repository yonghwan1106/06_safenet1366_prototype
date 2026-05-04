'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, X, MapPin } from 'lucide-react';

interface Step {
  path: string;
  title: string;
  bullets: string[];
  durationMs: number;
}

const STEPS: Step[] = [
  {
    path: '/',
    title: '1/4 — 문제 정의',
    bullets: [
      '연 30만 건의 1366 상담, 38% 재상담률',
      '신고 이전의 6~12개월, 위험 신호는 분산되어 있음',
      '5종 공공데이터를 융합해 동 단위 Risk-Index 산출',
    ],
    durationMs: 25_000,
  },
  {
    path: '/chat',
    title: '2/4 — 시민 익명 챗봇',
    bullets: [
      '카카오톡 스타일 익명 상담, SHA-256 익명 ID',
      '발화 → 9등급 위험 트리아지 → 자동 라우팅',
      'severity 7-9는 즉시 112 + 1366 + 보호시설 카드 노출',
    ],
    durationMs: 60_000,
  },
  {
    path: '/admin/triage',
    title: '3/4 — 정책 시뮬레이터',
    bullets: [
      '60개 키워드 룰 사전 (9등급) 화이트박스 공개',
      '발화 입력 시 룰 매칭 결과 실시간 시각화',
      '정책 입안자가 임계값을 조정하며 영향 즉시 확인',
    ],
    durationMs: 60_000,
  },
  {
    path: '/dashboard',
    title: '4/4 — 자치구 위험 대시보드',
    bullets: [
      '전국 17개 시도 + 시군구 Risk-Index 실시간 지도',
      '시군구·보호시설 마커 색상으로 위험도·점유율',
      '시도 클릭 시 fly-to 줌인, Top 30 우선순위 자동 정렬',
    ],
    durationMs: 60_000,
  },
];

function TourInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const enabled = params.get('demo') === '1';
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1
  const startedAt = useRef<number>(Date.now());
  const animFrame = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0); // 일시정지 시 누적

  const step = STEPS[stepIdx];

  const navigateTo = useCallback(
    (idx: number) => {
      const next = STEPS[idx];
      if (!next) return;
      setStepIdx(idx);
      setProgress(0);
      startedAt.current = Date.now();
      elapsedRef.current = 0;
      // path가 다르면 라우팅 (현재와 같으면 라우팅 안 함)
      if (next.path !== pathname) {
        const url = `${next.path}?demo=1&step=${idx + 1}`;
        router.push(url);
      }
    },
    [pathname, router],
  );

  const next = useCallback(() => {
    if (stepIdx < STEPS.length - 1) navigateTo(stepIdx + 1);
    else {
      // 종료
      router.push('/');
    }
  }, [stepIdx, navigateTo, router]);

  const prev = useCallback(() => {
    if (stepIdx > 0) navigateTo(stepIdx - 1);
  }, [stepIdx, navigateTo]);

  // pathname 변경 시 step 동기화 (직접 URL 진입 케이스)
  useEffect(() => {
    if (!enabled) return;
    const matched = STEPS.findIndex((s) => s.path === pathname);
    if (matched >= 0 && matched !== stepIdx) {
      setStepIdx(matched);
      setProgress(0);
      startedAt.current = Date.now();
      elapsedRef.current = 0;
    }
  }, [pathname, enabled, stepIdx]);

  // 진행률 업데이트 + auto-advance
  useEffect(() => {
    if (!enabled || paused) {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      animFrame.current = null;
      // 일시정지 진입 시 elapsed 누적
      if (paused) elapsedRef.current += Date.now() - startedAt.current;
      return;
    }
    startedAt.current = Date.now() - elapsedRef.current;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      const p = Math.min(elapsed / step.durationMs, 1);
      setProgress(p);
      if (p >= 1) {
        elapsedRef.current = 0;
        if (stepIdx < STEPS.length - 1) navigateTo(stepIdx + 1);
        else {
          // 마지막 단계 종료 후 demo 끔
          router.push('/');
        }
        return;
      }
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [enabled, paused, step.durationMs, stepIdx, navigateTo, router]);

  // 키보드 컨트롤
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused((v) => !v);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        router.push(pathname); // demo 종료
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, next, prev, router, pathname]);

  const remainingSec = useMemo(
    () => Math.max(0, Math.ceil(((1 - progress) * step.durationMs) / 1000)),
    [progress, step.durationMs],
  );

  if (!enabled) return null;

  return (
    <>
      {/* 하이라이트 오버레이 (특정 단계의 시각적 강조) */}
      <div className="fixed top-16 right-4 z-[1000] max-w-sm pointer-events-none">
        <div className="bg-slate-900/95 text-white rounded-2xl p-4 shadow-2xl border border-purple-500/40 backdrop-blur pointer-events-auto">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-purple-300 font-bold">
            <MapPin className="size-3" /> 5분 시연
          </div>
          <div className="text-base font-bold mt-1">{step.title}</div>
          <ul className="mt-2 space-y-1 text-sm leading-snug">
            {step.bullets.map((b, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-purple-400">▸</span>
                <span className="text-slate-100">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-[10px] text-slate-400">
            ←/→ 이동 · Space 일시정지 · Esc 종료
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-white rounded-full shadow-2xl border border-slate-700 backdrop-blur px-3 py-2 flex items-center gap-3 max-w-[95vw]">
        <button
          onClick={prev}
          disabled={stepIdx === 0}
          aria-label="이전 단계"
          className="p-1.5 rounded-full hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`size-2 rounded-full transition ${
                i === stepIdx ? 'bg-purple-400 w-4' : i < stepIdx ? 'bg-purple-700' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setPaused((v) => !v)}
          aria-label={paused ? '재생' : '일시정지'}
          className="p-1.5 rounded-full hover:bg-slate-700"
        >
          {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
        </button>
        <div className="text-[11px] text-slate-300 font-mono w-10 text-center">
          {String(remainingSec).padStart(2, '0')}s
        </div>
        <div className="hidden sm:block w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
            style={{ width: `${progress * 100}%`, transition: 'width 100ms linear' }}
          />
        </div>
        <button
          onClick={next}
          aria-label="다음 단계"
          className="p-1.5 rounded-full hover:bg-slate-700"
        >
          <ChevronRight className="size-4" />
        </button>
        <Link
          href={pathname}
          aria-label="시연 종료"
          className="p-1.5 rounded-full hover:bg-red-700 text-slate-300 hover:text-white"
        >
          <X className="size-4" />
        </Link>
      </div>
    </>
  );
}

export function Tour() {
  return (
    <Suspense fallback={null}>
      <TourInner />
    </Suspense>
  );
}
