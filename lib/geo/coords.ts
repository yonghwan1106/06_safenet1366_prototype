// 한국 17개 시도 대표 좌표 (시청 / 도청 소재지)
// 시군구 좌표가 누락된 mock 데이터를 시각화하기 위한 보강 좌표.
export const SIDO_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  '11': { lat: 37.5665, lng: 126.978, name: '서울특별시' },
  '21': { lat: 35.1796, lng: 129.0756, name: '부산광역시' },
  '22': { lat: 35.8714, lng: 128.6014, name: '대구광역시' },
  '23': { lat: 37.4563, lng: 126.7052, name: '인천광역시' },
  '24': { lat: 35.1595, lng: 126.8526, name: '광주광역시' },
  '25': { lat: 36.3504, lng: 127.3845, name: '대전광역시' },
  '26': { lat: 35.5384, lng: 129.3114, name: '울산광역시' },
  '29': { lat: 36.4801, lng: 127.289, name: '세종특별자치시' },
  '31': { lat: 37.4138, lng: 127.5183, name: '경기도' },
  '32': { lat: 37.8228, lng: 128.1555, name: '강원특별자치도' },
  '33': { lat: 36.6358, lng: 127.4914, name: '충청북도' },
  '34': { lat: 36.5184, lng: 126.8 , name: '충청남도' },
  '35': { lat: 35.8202, lng: 127.108, name: '전북특별자치도' },
  '36': { lat: 34.8161, lng: 126.4628, name: '전라남도' },
  '37': { lat: 36.4919, lng: 128.8889, name: '경상북도' },
  '38': { lat: 35.4606, lng: 128.2132, name: '경상남도' },
  '39': { lat: 33.4996, lng: 126.5312, name: '제주특별자치도' },
};

// 결정적 jitter — sigungu code의 마지막 3자리로 ±0.15도 분산.
// 같은 코드는 항상 같은 좌표를 반환하므로 깜빡임 없음.
export function sigunguCoord(code: string): { lat: number; lng: number } {
  const sidoCode = code.slice(0, 2);
  const base = SIDO_COORDS[sidoCode];
  if (!base) return { lat: 36.5, lng: 127.8 };
  // 시군구 코드 마지막 3자리를 정수로
  const tail = parseInt(code.slice(2), 10) || 0;
  // 결정적 hash → -1.5 ~ +1.5 범위
  const ang = (tail * 0.6180339) % 1; // golden ratio mod 1
  const r = 0.05 + ((tail % 7) * 0.025); // 반지름 0.05~0.20도
  const dx = Math.cos(ang * Math.PI * 2) * r;
  const dy = Math.sin(ang * Math.PI * 2) * r;
  return { lat: base.lat + dy, lng: base.lng + dx };
}
