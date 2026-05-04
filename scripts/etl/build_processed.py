#!/usr/bin/env python3
"""
ETL orchestrator - raw 5종을 processed JSON으로 통합 정제.

본선 진출 시: ingest_*.py 5개 -> 정제 단계 -> data/processed/*.json
현재(데모): rebuild_risk_index.py + forecast_shelter.py + validate_shelters.py 호출.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

# Windows cp949 회피 - stdout UTF-8 강제
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "scripts"

PIPELINE = [
    ("validate_shelters.py", "보호시설 좌표 검증·클리닝"),
    ("rebuild_risk_index.py", "Risk-Index 5종 컴포넌트 결정적 분포 생성"),
    ("forecast_shelter.py", "보호시설 7일 가용률 예측"),
]


def main() -> None:
    print("=== SafeNet 1366 ETL Pipeline ===")
    for script, desc in PIPELINE:
        path = SCRIPTS / script
        if not path.exists():
            print(f"[warn] {script} 없음 - 스킵")
            continue
        print(f"\n[run] {script} - {desc}")
        env = {**__import__("os").environ, "PYTHONIOENCODING": "utf-8"}
        result = subprocess.run(
            [sys.executable, str(path)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        print((result.stdout or "").strip() or "(no stdout)")
        if result.returncode != 0:
            print(f"[fail] exit={result.returncode}", file=sys.stderr)
            print(result.stderr or "", file=sys.stderr)
            sys.exit(result.returncode)
    print("\n=== ETL 완료 ===")


if __name__ == "__main__":
    main()
