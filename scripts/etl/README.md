# SafeNet 1366 — ETL 파이프라인

본선 진출 시 활성화되는 5종 공공데이터 ETL 골격.

## 디렉토리 구조

```
scripts/etl/
├── README.md                       (이 파일)
├── ingest_domestic_violence.py     # 가정폭력 실태조사 (publicId 3072073)
├── ingest_shelter_operations.py    # 피해자 지원시설 운영실적 (15089597)
├── ingest_gender_equality.py       # 국가성평등지수 (3072079)
├── ingest_family_survey.py         # 가족실태조사 (15054982)
├── ingest_violence_education.py    # 폭력예방교육 실적 (15085793)
└── build_processed.py              # raw → processed 통합 정제

data/
├── raw/                            # 원본 CSV/XLSX (gitignore — 50MB+)
│   ├── domestic_violence_2022.csv
│   ├── shelter_operations_2023.csv
│   └── ...
└── processed/                      # ETL 산출물 (commit 가능)
    ├── sigungu-coords.json
    ├── shelters.json
    ├── risk-index.json
    ├── dong.json
    └── provenance.json
```

## 실행 흐름 (본선 운영 시)

```bash
# 1. 환경변수 설정
export DATA_GO_KR_API_KEY="..."
export VWORLD_GEOCODE_KEY="..."

# 2. raw 다운로드 (각 ingest 스크립트가 data.go.kr 직접 호출 또는 캐시된 CSV 읽기)
python scripts/etl/ingest_domestic_violence.py
python scripts/etl/ingest_shelter_operations.py
python scripts/etl/ingest_gender_equality.py
python scripts/etl/ingest_family_survey.py
python scripts/etl/ingest_violence_education.py

# 3. 통합 정제
python scripts/etl/build_processed.py

# 4. risk-index 재생성 (실통계 기반)
python scripts/rebuild_risk_index.py

# 5. shelter 7일 예측
python scripts/forecast_shelter.py

# 6. 빌드 + 배포
npm run build && git add data/processed/ && git commit && git push
```

## 데모 단계 (현재)

`data/raw/`은 비어있고 `data/processed/` 산출물은 결정적 시뮬로 생성됩니다.
schema는 본선 운영 schema와 동일하므로, 실제 데이터로 교체 시 코드 변경 없음.

## API 키 발급

- **data.go.kr**: <https://www.data.go.kr> → 마이페이지 → 인증키 신청 (각 데이터셋 신청)
- **Vworld 지오코딩**: <https://www.vworld.kr> → 인증키 발급 (시군구 청사 좌표)

## 주의

- `data/raw/` 디렉토리는 `.gitignore`로 제외 (대용량 + 라이선스).
- 정제된 `data/processed/`만 commit하여 빌드 시 재현 가능성 보장.
- 모든 ETL 스크립트는 결정적이어야 함 (시뮬·정제 모두 동일 결과 산출).
