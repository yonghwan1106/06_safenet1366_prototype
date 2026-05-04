// 동 단위 결정적 generator
// 본선 진출 시: 행정안전부 「행정동코드」 + Vworld 행정동 GeoJSON으로 교체.
// 현재는 시군구 청사 좌표를 중심으로 5~7개 동을 결정적으로 분포시킨다.
import { sigunguCoord } from './coords';

export interface DongPoint {
  code: string;        // 8자리 행정동 코드 (시군구5 + 동3)
  sigunguCode: string;
  name: string;        // 예: '역삼1동'
  lat: number;
  lng: number;
  population: number;  // 동 인구 (시군구 인구 / 동 수)
  riskScore: number;   // 0~100
}

const DONG_NAME_POOL = [
  '중앙동', '신흥동', '평화동', '대학동', '시민동',
  '한빛동', '소망동', '본동', '청구동', '산성동',
  '대흥동', '효자동', '명동', '봉천동', '연희동',
  '월계동', '신촌동', '중구동', '서림동', '은행동',
];

function hashInt(code: string, salt: number = 0): number {
  let h = salt;
  for (let i = 0; i < code.length; i++) {
    h = (h * 31 + code.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(h);
}

export function generateDongs(sigunguCode: string, sigunguPopulation = 200_000): DongPoint[] {
  const baseHash = hashInt(sigunguCode);
  const dongCount = 5 + (baseHash % 3); // 5~7개
  const center = sigunguCoord(sigunguCode);
  const dongs: DongPoint[] = [];

  for (let i = 0; i < dongCount; i++) {
    const seed = hashInt(sigunguCode, i * 17 + 3);
    const ang = (seed % 360) * (Math.PI / 180);
    const r = 0.012 + ((seed % 7) * 0.004); // 1~3km 정도 분산
    const lat = center.lat + Math.sin(ang) * r;
    const lng = center.lng + Math.cos(ang) * r;
    const dongIdx = (seed >> 4) % DONG_NAME_POOL.length;
    const name = `${DONG_NAME_POOL[dongIdx]}`;
    // 시군구 코드 + 동 인덱스로 결정적 score
    const score = ((seed >> 8) % 100);
    dongs.push({
      code: sigunguCode + String(i + 1).padStart(3, '0'),
      sigunguCode,
      name,
      lat: Math.round(lat * 1e4) / 1e4,
      lng: Math.round(lng * 1e4) / 1e4,
      population: Math.round(sigunguPopulation / dongCount),
      riskScore: score,
    });
  }
  return dongs;
}
