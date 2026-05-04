#!/usr/bin/env python3
"""
shelters.json 좌표 검증·클리닝.
한반도 영역(33≤lat≤39, 124≤lng≤132) 밖에 있는 좌표를
sigunguCode 기반 시도 중심 좌표 + 결정적 jitter로 보정한다.

실행: python scripts/validate_shelters.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

# 시도 17개 대표 좌표 (시청·도청 소재지) — lib/geo/coords.ts와 동기화
SIDO_COORDS: dict[str, tuple[float, float]] = {
    "11": (37.5665, 126.9780),  # 서울
    "21": (35.1796, 129.0756),  # 부산
    "22": (35.8714, 128.6014),  # 대구
    "23": (37.4563, 126.7052),  # 인천
    "24": (35.1595, 126.8526),  # 광주
    "25": (36.3504, 127.3845),  # 대전
    "26": (35.5384, 129.3114),  # 울산
    "29": (36.4801, 127.2890),  # 세종
    "31": (37.4138, 127.5183),  # 경기
    "32": (37.8228, 128.1555),  # 강원
    "33": (36.6358, 127.4914),  # 충북
    "34": (36.5184, 126.8000),  # 충남
    "35": (35.8202, 127.1080),  # 전북
    "36": (34.8161, 126.4628),  # 전남
    "37": (36.4919, 128.8889),  # 경북
    "38": (35.4606, 128.2132),  # 경남
    "39": (33.4996, 126.5312),  # 제주
}

# 한반도 영역 (33≤lat≤39, 124≤lng≤132)
KR_LAT_MIN, KR_LAT_MAX = 33.0, 39.0
KR_LNG_MIN, KR_LNG_MAX = 124.0, 132.0


def in_korea(lat: float, lng: float) -> bool:
    return KR_LAT_MIN <= lat <= KR_LAT_MAX and KR_LNG_MIN <= lng <= KR_LNG_MAX


def deterministic_jitter(code: str) -> tuple[float, float]:
    """시군구 행정코드 기반 결정적 jitter (-0.2 ~ +0.2도)."""
    # 마지막 3자리(또는 그 미만)를 정수로
    tail = int(code[-3:]) if len(code) >= 3 else int(code or "0")
    # 황금비 mod 1 기반 각도
    ang = (tail * 0.6180339) % 1
    r = 0.05 + ((tail % 7) * 0.025)  # 반지름 0.05~0.20도
    dy = math.sin(ang * math.tau) * r
    dx = math.cos(ang * math.tau) * r
    return dy, dx


def sigungu_coord(code: str) -> tuple[float, float]:
    sido = code[:2]
    base = SIDO_COORDS.get(sido, (36.5, 127.8))
    dy, dx = deterministic_jitter(code)
    return base[0] + dy, base[1] + dx


def main() -> None:
    proj_root = Path(__file__).resolve().parents[1]
    path = proj_root / "data" / "shelters.json"
    with path.open(encoding="utf-8") as f:
        shelters = json.load(f)

    fixed = 0
    for s in shelters:
        if not in_korea(s["lat"], s["lng"]):
            new_lat, new_lng = sigungu_coord(s["sigunguCode"])
            s["lat"] = round(new_lat, 4)
            s["lng"] = round(new_lng, 4)
            fixed += 1

    with path.open("w", encoding="utf-8") as f:
        json.dump(shelters, f, ensure_ascii=False, indent=1)

    print(f"total={len(shelters)} fixed={fixed} out_of_korea={sum(1 for s in shelters if not in_korea(s['lat'], s['lng']))}")


if __name__ == "__main__":
    main()
