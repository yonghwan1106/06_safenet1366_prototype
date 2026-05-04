# 세이프넷 1366 — 데모 프로토타입

2026 성평등가족부 공공·AI 데이터 융복합 아이디어 공모전 출품작 「세이프넷 1366」(박용환)의 작동 가능한 시연용 프로토타입.

> "신고 이전의 6~12개월에 누적되는 위험 신호를 모아, 신고 이전에 도와준다."
> 사후 대응에서 사전 예방으로 — AI 기반 가정폭력 조기경보 + 자치구 정책 대시보드.

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 (히어로 + 3-track 카드) |
| `/chat` | 시민 익명 챗봇 — 9등급 위험 트리아지 + 자동 라우팅 |
| `/dashboard` | 자치구 위험 대시보드 — 17 시도 + 시군구 히트맵 + Top 30 + 보호시설 |
| `/admin/triage` | 9등급 룰 시뮬레이터 (정책 입안자용 화이트박스) |
| `/about` | 산식·데이터 출처·개인정보 보호 정책 |
| `/api/triage` | POST · 위험도 분석 API |
| `/api/risk?code=11680` | GET · 시군구 상세 |

## 기술 스택

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Recharts · Zustand · Zod

## 로컬 실행

```bash
npm install --legacy-peer-deps
npm run dev
# http://localhost:3000
```

## Vercel 배포 (사용자 직접)

```bash
# 1) Vercel 로그인 (한 번만, 브라우저 창이 열림)
npx vercel login

# 2) 배포 (대화형 프롬프트: 프로젝트 이름·팀 선택)
cd 06_safenet1366_prototype
npx vercel --prod
```

배포 완료 후 발급되는 `https://[프로젝트].vercel.app` 공개 URL을 본선 자료에 첨부 가능.

> ⚠️ Windows 한글 경로에서 빌드 시 Turbopack 한글 byte boundary 버그가 발생할 수 있습니다.
> 이 경우 `C:\temp\safenet1366` 등 **ASCII 경로로 폴더 복사** 후 빌드/배포 권장.

### 환경변수 (.env)

```
OPENAI_API_KEY=                 # 선택. 미설정 시 룰 모드만 작동
NEXT_PUBLIC_TRIAGE_MODE=rule
ANON_SALT=safenet1366-demo-salt # SHA-256 솔트
```

## 시연 시나리오 3종 (E2E)

| # | 트랙 | 입력 / 동작 | 기대 결과 |
|---|---|---|---|
| A | 시민 저위험 | "요즘 남편이랑 말다툼이 잦아요" | 녹색 SeverityBanner · severity 3 · 자가가이드 카드 3장 |
| B | 시민 응급 | "오늘 칼 들고 위협했어요" | 적색 SeverityBanner · severity 9 · EmergencyDialog 자동 오픈 · 보호시설 3곳 + 안전계획 7항목 |
| C | 자치구 | `/dashboard` → 시도 선택 → 시군구 클릭 | 시군구 히트맵 + Top 30 우선순위 + 보호시설 가용률 + Risk-Index 구성 차트 |

## 디렉터리 구조

```
06_safenet1366_prototype/
├── app/
│   ├── page.tsx · layout.tsx · not-found.tsx · global-error.tsx
│   ├── chat/page.tsx + _components/ {ChatWindow, MessageBubble, EmergencyDialog}
│   ├── dashboard/page.tsx + _components/ {DashboardClient, SidoGrid, SigunguHeatmap, RiskRankTable, ShelterPanel, ComponentChart}
│   ├── admin/triage/page.tsx
│   ├── about/page.tsx
│   └── api/triage/route.ts · api/risk/route.ts
├── components/{ui,shared}/
├── lib/
│   ├── triage/ {ruleEngine, anonymize}
│   └── risk/formula.ts
├── data/ {sigungu, risk-index, shelters, keywords-9rank}.json
├── store/useChatStore.ts
├── types/index.ts
└── scripts/gen_data.py     # 시뮬 데이터 생성
```

## 개인정보 보호 (PII Free)

- 연락처 SHA-256(전화번호+Salt) 해시 후 즉시 폐기, 식별 불가
- 익명ID 8자리만 표시 (`a3f2…b91c`)
- 발화 내용은 클라이언트 메모리에만 보존, 페이지 종료 시 폐기

## 라이선스

본 프로토타입은 공모전 시연용 비상업 데모이며, 시뮬 데이터로 동작합니다.
실제 위급 상황은 **1366** 또는 **112**로 연락 바랍니다.
