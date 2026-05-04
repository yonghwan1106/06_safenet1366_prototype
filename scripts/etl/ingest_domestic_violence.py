#!/usr/bin/env python3
"""
가정폭력 실태조사 (data.go.kr publicId 3072073) ingest 골격.

본선 진출 시 활성화. 현재는 schema·필드 매핑만 정의.

산출물: data/raw/domestic_violence_2022.csv → data/processed/recall_rates.json
필드 매핑: ageBand, abuseType, recallMonths, reportedToPolice, helpSeekingChannel
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

PUBLIC_ID = "3072073"
SOURCE = "여성가족부 가정폭력 실태조사"
YEAR = "2022-12"
RAW_FILENAME = "domestic_violence_2022.csv"


def main() -> None:
    api_key = os.environ.get("DATA_GO_KR_API_KEY")
    if not api_key:
        print(f"[skip] DATA_GO_KR_API_KEY 미설정 — {SOURCE} ingest 보류", file=sys.stderr)
        print(f"       본선 진출 시 환경변수 설정 후 재실행하세요.", file=sys.stderr)
        sys.exit(0)

    raw_dir = Path(__file__).resolve().parents[2] / "data" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    target = raw_dir / RAW_FILENAME

    # TODO: data.go.kr API 호출 또는 캐시된 CSV 다운로드
    # import requests
    # url = f"https://api.data.go.kr/openapi/...?serviceKey={api_key}"
    # resp = requests.get(url, timeout=30)
    # target.write_bytes(resp.content)

    # TODO: pandas로 정제 → data/processed/recall_rates.json
    # import pandas as pd
    # df = pd.read_csv(target, encoding='cp949')
    # rates = df.groupby('sidoCode')['recall_months'].apply(...)
    # rates.to_json(processed / 'recall_rates.json', force_ascii=False)

    print(f"[stub] {SOURCE} ({PUBLIC_ID}) ingest 준비 완료 — 본선 진출 시 활성화")


if __name__ == "__main__":
    main()
