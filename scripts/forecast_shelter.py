#!/usr/bin/env python3
"""
보호시설 7일 가용률 예측.

본선 진출 시: 1366·시설 운영실적의 일별 입소·퇴소 시계열로
sklearn LinearRegression / Prophet 학습 → 실제 7일 forecast.

데모 단계: 시설별 결정적 시계열을 생성하고 단순 선형 추세로 D+7 예측치 산출.
- shelters.json의 각 항목에 forecast_7d 필드 추가:
    forecast_7d: { availability: 0~1, capacity: int, occupied: int, trend: 'up'|'down'|'flat' }
"""
from __future__ import annotations

import hashlib
import json
import math
import sys
from pathlib import Path

# Windows cp949 회피 - 한글 stdout UTF-8 강제
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]


def hash_int(s: str, salt: int = 0) -> int:
    h = hashlib.md5(f"{s}|{salt}".encode()).digest()
    return int.from_bytes(h[:4], "big")


def deterministic_series(shelter_id: str, days: int = 14) -> list[float]:
    """과거 days일 시계열 가용률 (0~1) — 결정적."""
    seed = hash_int(shelter_id, 99)
    base = 0.40 + (seed % 40) / 100.0  # 시설별 기본 가용률 0.40~0.79
    trend = ((seed >> 5) % 21 - 10) / 1000.0  # 일평균 변화 -0.010 ~ +0.010
    seasonal_phase = (seed >> 8) % 7  # 요일 효과 위상 0~6
    series: list[float] = []
    for d in range(days):
        # 추세 + 요일 효과 + 작은 노이즈
        trend_component = trend * d
        weekday_component = math.sin((d + seasonal_phase) * math.pi / 3.5) * 0.04
        noise = ((hash_int(shelter_id, 200 + d) % 60) - 30) / 1000.0
        v = base + trend_component + weekday_component + noise
        series.append(max(0.05, min(0.95, v)))
    return series


def linear_forecast(series: list[float], step: int = 7) -> tuple[float, str]:
    """단순 OLS 회귀로 step일 후 가용률 예측 + trend 라벨."""
    n = len(series)
    if n == 0:
        return 0.5, "flat"
    xs = list(range(n))
    mean_x = sum(xs) / n
    mean_y = sum(series) / n
    num = sum((xs[i] - mean_x) * (series[i] - mean_y) for i in range(n))
    den = sum((xs[i] - mean_x) ** 2 for i in range(n)) or 1.0
    slope = num / den
    intercept = mean_y - slope * mean_x
    pred = intercept + slope * (n - 1 + step)
    pred = max(0.0, min(1.0, pred))
    if slope > 0.003:
        trend = "down"  # 가용률 ↑이지만 위험 관점에서는 down (수요 감소 = 위험 down)
    elif slope < -0.003:
        trend = "up"
    else:
        trend = "flat"
    return pred, trend


def main() -> None:
    shelters_path = ROOT / "data" / "shelters.json"
    shelters = json.loads(shelters_path.read_text(encoding="utf-8"))

    for s in shelters:
        capacity = s.get("capacity", 0) or 0
        occupied = s.get("occupied", 0) or 0
        if capacity <= 0:
            s["forecast_7d"] = {
                "availability": 0.0,
                "capacity": capacity,
                "occupied": occupied,
                "trend": "flat",
            }
            continue
        history = deterministic_series(s["id"], days=14)
        # 현재 시점을 history 마지막 값으로 보정 (실제 occupancy와 정합)
        current_avail = max(0.0, (capacity - occupied) / capacity)
        # 마지막 값이 현재값에 부드럽게 수렴하도록 보정
        smoothed = [
            (h * 0.7 + current_avail * 0.3) if i >= len(history) - 3 else h
            for i, h in enumerate(history)
        ]
        pred_avail, trend = linear_forecast(smoothed, step=7)
        pred_occupied = round(capacity * (1 - pred_avail))
        s["forecast_7d"] = {
            "availability": round(pred_avail, 3),
            "capacity": capacity,
            "occupied": pred_occupied,
            "trend": trend,
        }

    shelters_path.write_text(json.dumps(shelters, ensure_ascii=False, indent=1), encoding="utf-8")
    sample = shelters[:3]
    print(f"forecast_7d added to {len(shelters)} shelters")
    for s in sample:
        f = s["forecast_7d"]
        print(f"  {s['id']} {s['name'][:14]} → 가용률 {f['availability']:.2f} (현 {(s['capacity']-s['occupied'])/max(s['capacity'],1):.2f}) trend={f['trend']}")


if __name__ == "__main__":
    main()
