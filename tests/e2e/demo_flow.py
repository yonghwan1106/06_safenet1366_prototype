"""
SafeNet 1366 — 5분 시연 흐름 e2e 회귀 테스트.

랜딩 → 챗봇(severity 9) → 시뮬레이터 → 대시보드(시군구→동) → ROI → 데이터 카탈로그
모든 핵심 셀렉터의 노출과 라이브 LLM 응답을 검증한다.

실행:
    # 사전: dev 서버 또는 production이 BASE_URL에 떠 있어야 함
    BASE_URL=https://06-safenet1366-prototype.vercel.app python tests/e2e/demo_flow.py
    BASE_URL=http://localhost:3002 python tests/e2e/demo_flow.py  # 로컬

스크린샷: tests/e2e/screenshots/*.png
종료 코드 0 = 모든 검증 통과, 1+ = 실패
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

try:
    from playwright.sync_api import Page, sync_playwright
except ImportError:
    print("ERROR: playwright 미설치 — pip install playwright && python -m playwright install chromium")
    sys.exit(2)

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3002").rstrip("/")
ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "tests" / "e2e" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)

failures: list[str] = []


def shot(page: Page, name: str) -> None:
    page.screenshot(path=str(SHOTS / f"{name}.png"), full_page=True)


def verify(label: str, ok: bool, detail: str = "") -> None:
    icon = "PASS" if ok else "FAIL"
    print(f"[{icon}] {label}{(' — ' + detail) if detail else ''}")
    if not ok:
        failures.append(label + (": " + detail if detail else ""))


def test_landing(page: Page) -> None:
    print("\n=== 1. 랜딩 (/) ===")
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    verify("Hero CTA '5분 시연 시작' 노출", page.locator("text=5분 시연 시작").first.is_visible())
    verify("Stat 30만 노출", page.locator("text=30만").first.is_visible())
    verify("DataBadge 출처 라벨 노출", page.locator("text=출처").first.is_visible())
    verify("3 트랙 카드", page.locator("text=시민 익명 챗봇").first.is_visible())
    shot(page, "01_landing")


def test_chat_severity9(page: Page) -> None:
    print("\n=== 2. 챗봇 — severity 9 응급 시나리오 ===")
    page.goto(BASE_URL + "/chat", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    page.fill("input[placeholder]", "오늘 칼 들고 위협했어요")
    page.keyboard.press("Enter")
    try:
        page.wait_for_selector("text=/위험도\\s*9/", timeout=25_000)
        time.sleep(2)
        verify("severity=9 위험도 표시", page.locator("text=/위험도\\s*9/").first.is_visible())
        verify("응급 112 즉시 호출 버튼", page.locator("text=112 즉시").first.is_visible())
        verify("1366 보호시설 안내", page.locator("text=1366").first.is_visible())
    except Exception as e:
        verify("severity=9 응답 수신", False, str(e)[:80])
    shot(page, "02_chat_emergency")


def test_simulator(page: Page) -> None:
    print("\n=== 3. 정책 시뮬레이터 (/admin/triage) ===")
    page.goto(BASE_URL + "/admin/triage", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    verify("시뮬레이터 제목", page.locator("text=9등급 트리아지 시뮬레이터").first.is_visible())
    verify("9등급 룰 사전", page.locator("text=9등급 룰 사전").first.is_visible())
    shot(page, "03_simulator")


def test_dashboard_drilldown(page: Page) -> None:
    print("\n=== 4. 대시보드 — 시군구→동 드릴다운 ===")
    page.goto(BASE_URL + "/dashboard", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    verify("Leaflet 지도", page.locator(".leaflet-container").first.is_visible())
    verify("시도 17개 격자", page.locator("text=전국 17개 시도").first.is_visible())
    # 시군구 선택 → 동 토글 활성
    sigungu_btns = [
        b for b in page.query_selector_all('button[title*="점"]')
        if "시군구" not in (b.get_attribute("title") or "")
    ]
    if sigungu_btns:
        sigungu_btns[0].click()
        time.sleep(2)
        verify("동 토글 활성", page.locator("text=/동 단위 \\(\\d+\\)/").first.is_visible())
        verify("Risk-Index 분해 차트", page.locator("text=/Risk-Index/").first.is_visible())
    else:
        verify("시군구 버튼 발견", False, "selector miss")
    shot(page, "04_dashboard_drilldown")


def test_roi(page: Page) -> None:
    print("\n=== 5. ROI 계산기 (/admin/roi) ===")
    page.goto(BASE_URL + "/admin/roi", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    verify("ROI 제목", page.locator("text=정책 ROI 계산기").first.is_visible())
    verify("BCR 노출", page.locator("text=BCR").first.is_visible())
    verify("산식 트레이스", page.locator("text=산식 트레이스").first.is_visible())
    shot(page, "05_roi")


def test_data_catalog(page: Page) -> None:
    print("\n=== 6. 데이터 카탈로그 (/data) ===")
    page.goto(BASE_URL + "/data", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    verify("publicId 3072073", page.locator("text=3072073").first.is_visible())
    verify("Risk-Index 산식", page.locator("text=Risk-Index =").first.is_visible())
    verify("실데이터 35%", page.locator("text=/35%/").first.is_visible())
    shot(page, "06_data_catalog")


def test_demo_tour(page: Page) -> None:
    print("\n=== 7. 데모 가이드 (/?demo=1) ===")
    page.goto(BASE_URL + "/?demo=1", wait_until="networkidle", timeout=30_000)
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    verify("Tour 패널 노출", page.locator("text=5분 시연").first.is_visible())
    verify("진행 표시 1/4", page.locator("text=1/4").first.is_visible())
    shot(page, "07_demo_tour")


def test_api_stats(page: Page) -> None:
    print("\n=== 8. /api/stats 익명 통계 ===")
    resp = page.request.get(BASE_URL + "/api/stats")
    verify("/api/stats 200", resp.status == 200, f"status={resp.status}")
    if resp.status == 200:
        data = resp.json()
        verify("retentionDays 30", data.get("retentionDays") == 30)
        verify("totalEvents 필드", "totalEvents" in data)
        verify("storage 필드", data.get("storage") in ("kv", "in-memory"))


def main() -> int:
    print(f"=== SafeNet 1366 e2e 시연 흐름 회귀 ===")
    print(f"BASE_URL: {BASE_URL}\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800}, locale="ko-KR")
        page = ctx.new_page()
        try:
            test_landing(page)
            test_chat_severity9(page)
            test_simulator(page)
            test_dashboard_drilldown(page)
            test_roi(page)
            test_data_catalog(page)
            test_demo_tour(page)
            test_api_stats(page)
        finally:
            browser.close()

    print(f"\n=== 종합 ===")
    if failures:
        print(f"FAIL: {len(failures)}건")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("ALL PASS")
    print(f"스크린샷: {SHOTS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
