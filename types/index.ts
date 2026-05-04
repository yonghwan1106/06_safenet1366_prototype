// SafeNet 1366 — 공통 타입 정의

export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Routing = 'self-care' | 'counselor-1366' | 'emergency-112';
export type Trend = 'up' | 'down' | 'flat';
export type ShelterType = 'emergency' | 'short' | 'long';
export type AbuseCategory = 'physical' | 'sexual' | 'emotional' | 'economic' | 'stalking' | 'child';

export interface Sigungu {
  code: string;          // 행정표준코드 5자리
  sido: string;          // "서울특별시"
  sidoCode: string;      // "11"
  name: string;          // "종로구"
  population: number;
  households: number;
}

export interface RiskComponents {
  counselDensity: number;       // 0~1
  recallRate: number;           // 재상담률 0~1
  shelterAvailability: number;  // 0~1 가용률
  multicultureWeight: number;   // 1.0~1.5
  childcareWeight: number;      // 1.0~1.5
}

export interface RiskIndex {
  sigunguCode: string;
  score: number;                // 0~100
  components: RiskComponents;
  rank: number;                 // 전국 1~226
  trend: Trend;
  updatedAt: string;            // ISO
}

export interface Shelter {
  id: string;
  name: string;
  sigunguCode: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  type: ShelterType;
  multilingual: boolean;
  phone: string;                // masked, e.g. "010-XXXX-1234"
}

export interface KeywordRule {
  severity: Severity;
  category: AbuseCategory;
  patterns: string[];
  weight: number;               // 1~5
  routingHint: string;
}

export interface SelfCareCard {
  id: string;
  title: string;
  description: string;
  link?: string;
  icon?: string;
}

export interface TriageResult {
  severity: Severity;
  routing: Routing;
  matchedKeywords: string[];
  anonId: string;
  cards?: SelfCareCard[];
  shelters?: Shelter[];
  safetyPlan?: string[];
  message: string;              // 챗봇이 출력할 한국어 응답
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  triage?: TriageResult;
  ts: number;
}
